import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const ingest = read("supabase/functions/ingest-run/index.ts");
const publishing = read("docs/RUN_PUBLISHING.md");
const orchestrator = read("runtime/orchestrator.md");
const channel1 = read("runtime/agreed-client-worker.md");
const candidateWorker = read("runtime/candidate-mapping-worker.md");
const guard = read("ARCHITECTURE_GUARD.md");

assert(
  ingest.includes('payload.run.status || "RUNNING"'),
  "Ingestion must default omitted run status to RUNNING."
);
assert(
  !ingest.includes('payload.run.status || "COMPLETE"'),
  "Ingestion must never default omitted run status to COMPLETE."
);
assert(
  ingest.includes("validateCompletionContract"),
  "Ingestion must validate the completion contract."
);
assert(
  ingest.includes('candidate.marketBucket === "TOP_10"'),
  "Payload completion must require a research TOP_10 candidate."
);
assert(
  ingest.includes('candidate.qaStatus === "PASS"') &&
    ingest.includes('candidate.qaStatus === "PASS_WITH_UNKNOWNS"'),
  "Submit-ready candidates must be QA-cleared."
);
assert(
  ingest.includes("Boolean(candidate.whyFit?.trim())"),
  "Submit-ready candidates must have a non-empty fit rationale."
);
assert(
  ingest.includes("completionContractSatisfied"),
  "Ingestion response must expose completion verification."
);
assert(
  ingest.includes("persistedSubmitReadyTop10Count"),
  "Ingestion response must expose persisted submit-ready count."
);

for (const [name, content] of [
  ["publishing contract", publishing],
  ["orchestrator", orchestrator],
  ["Channel 1 worker", channel1],
  ["candidate worker", candidateWorker],
  ["architecture guard", guard],
]) {
  assert(
    /client-submittable|submit-ready/i.test(content),
    `${name} must define submit-ready/client-submittable completion.`
  );
  assert(
    /COMPLETE/.test(content),
    `${name} must explicitly govern COMPLETE status.`
  );
}

assert(
  publishing.includes("A chat response is not publication."),
  "Publishing contract must forbid treating chat output as publication."
);
assert(
  /post-write/i.test(publishing) && /verification/i.test(publishing),
  "Publishing contract must require post-write verification."
);
assert(
  publishing.includes('"status": "RUNNING"') &&
    publishing.includes('"candidateMapStatus": "IN_PROGRESS"'),
  "Vacancy-only example must remain in-progress rather than complete."
);

console.log("REC run-completion contract smoke checks passed.");
