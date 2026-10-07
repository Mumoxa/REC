import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_INGEST_URL = "https://rec-phi-weld.vercel.app/api/ingest/run";
const VERCEL_PROJECT = {
  orgId: "team_CyTmZDiFFzeUtLGjne1r5bnR",
  projectId: "prj_UuLx9PsSqd58jKPlCRBHldehqSw6",
};

function fail(message, details) {
  console.error(`REC publish failed: ${message}`);
  if (details) console.error(details);
  process.exit(1);
}

function ensureProjectLink() {
  const dir = path.resolve(".vercel");
  const file = path.join(dir, "project.json");
  if (fs.existsSync(file)) return;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify({ orgId: VERCEL_PROJECT.orgId, projectId: VERCEL_PROJECT.projectId }, null, 2) + "\n",
    { mode: 0o600 },
  );
}

function bootstrapThroughVercel(payloadPath) {
  ensureProjectLink();
  const child = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    [
      "--yes",
      "vercel",
      "env",
      "run",
      "--environment=production",
      "--",
      process.execPath,
      path.resolve("scripts/rec-publish.mjs"),
      "--from-vercel",
      path.resolve(payloadPath),
    ],
    { stdio: "inherit", env: process.env },
  );

  if (child.error) {
    fail("Could not start the Vercel-backed publisher.", child.error.message);
  }
  process.exit(child.status ?? 1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const fromVercel = args[0] === "--from-vercel";
  const payloadPath = fromVercel ? args[1] : args[0];
  if (!payloadPath) {
    fail("Usage: npm run rec:publish -- runs/<RUN-ID>/publication-payload.json");
  }
  return { fromVercel, payloadPath };
}

function readPayload(payloadPath) {
  const resolved = path.resolve(payloadPath);
  if (!fs.existsSync(resolved)) fail(`Payload file not found: ${resolved}`);

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(resolved, "utf8"));
  } catch (error) {
    fail("Publication payload is not valid JSON.", error.message);
  }

  if (!payload?.run?.externalRunId || !payload?.run?.channel) {
    fail("Payload must contain run.externalRunId and run.channel before publication.");
  }
  if (!Array.isArray(payload.vacancies)) fail("Payload.vacancies must be an array.");
  return payload;
}

async function publish(payload) {
  const key = process.env.INGEST_API_KEY?.trim();
  if (!key) {
    fail("INGEST_API_KEY is still unavailable after Vercel bootstrap. Authenticate the Vercel CLI for the REC project and retry.");
  }

  const ingestUrl = process.env.REC_INGEST_URL?.trim() || DEFAULT_INGEST_URL;
  let response;
  try {
    response = await fetch(ingestUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    fail(`Unable to reach REC ingestion endpoint ${ingestUrl}.`, error.message);
  }

  const raw = await response.text();
  let body;
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { raw }; }
  if (!response.ok || body?.ok !== true) {
    fail(`REC ingestion returned HTTP ${response.status}.`, JSON.stringify(body, null, 2));
  }

  const verification = body.verification || {};
  const expectedVacancies = payload.vacancies.length;
  const persistedVacancies = Number(verification.persistedVacancyCount ?? body.persistedVacancies?.length ?? 0);
  if (persistedVacancies < expectedVacancies) {
    fail(
      "Post-write verification found fewer persisted vacancies than the payload contained.",
      JSON.stringify({ expectedVacancies, persistedVacancies, externalRunId: payload.run.externalRunId }, null, 2),
    );
  }

  if (payload.run.status === "COMPLETE" && verification.completionContractSatisfied !== true) {
    fail("Server accepted the request but the COMPLETE run did not satisfy the REC completion contract.", JSON.stringify(verification, null, 2));
  }

  console.log(JSON.stringify({
    ok: true,
    published: true,
    externalRunId: body.externalRunId || payload.run.externalRunId,
    runStatus: body.runStatus || payload.run.status || "RUNNING",
    persistedVacancyCount: persistedVacancies,
    persistedCandidateCount: Number(verification.persistedCandidateCount ?? 0),
    persistedCandidateAssignmentCount: Number(verification.persistedCandidateAssignmentCount ?? 0),
    persistedSubmitReadyTop10Count: Number(verification.persistedSubmitReadyTop10Count ?? 0),
    persistedFullMarketReadyVacancyCount: Number(verification.persistedFullMarketReadyVacancyCount ?? 0),
    persistedStakeholderCount: Number(verification.persistedStakeholderCount ?? 0),
    persistedHiringTeamReadyVacancyCount: Number(verification.persistedHiringTeamReadyVacancyCount ?? 0),
    persistedCompanyEmailIntelligenceCount: Number(verification.persistedCompanyEmailIntelligenceCount ?? 0),
    completionContractSatisfied: verification.completionContractSatisfied === true,
  }, null, 2));
}

const { fromVercel, payloadPath } = parseArgs();
const payload = readPayload(payloadPath);
if (!process.env.INGEST_API_KEY && !fromVercel) bootstrapThroughVercel(payloadPath);
await publish(payload);
