import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const publisher = read("scripts/rec-publish.mjs");
const agents = read("AGENTS.md");
const claude = read("CLAUDE.md");
const publishing = read("docs/RUN_PUBLISHING.md");
const orchestrator = read("runtime/orchestrator.md");

assert(
  publisher.includes("vercel") && publisher.includes("env") && publisher.includes("run") && publisher.includes("--environment=production"),
  "REC publisher must bootstrap production credentials through Vercel.",
);

assert(
  publisher.includes("https://rec-phi-weld.vercel.app/api/ingest/run"),
  "REC publisher must target the canonical production ingestion endpoint.",
);

assert(
  publisher.includes("persistedVacancyCount") && publisher.includes("completionContractSatisfied"),
  "REC publisher must verify persistence before reporting success.",
);

assert(
  agents.includes("Missing local .env is NOT a publication stop condition"),
  "Agent contract must forbid stopping because a local env file is missing.",
);

assert(
  /Continue through candidate mapping/i.test(claude),
  "Claude instructions must require downstream candidate mapping.",
);

assert(
  /write-through/i.test(agents),
  "Agent contract must require progressive write-through publication.",
);

assert(
  /do not stop the research pipeline|publication.*not.*halt/i.test(publishing + "\\n" + orchestrator + "\\n" + agents),
  "Publication problems must not terminate research before candidate mapping.",
);

console.log("REC agent publication contract smoke checks passed.");
