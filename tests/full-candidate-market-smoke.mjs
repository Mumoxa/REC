import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const schema = JSON.parse(read("schemas/candidate-market-map.schema.json"));
const ui = read("src/components/workspace/recruitment-workspace.tsx");
const ingest = read("supabase/functions/ingest-run/index.ts");
const worker = read("runtime/candidate-mapping-worker.md");
const manifest = read("manifest.yaml");
const publishing = read("docs/RUN_PUBLISHING.md");

for (const field of ["credible_longlist", "strongest_market_set", "top_10", "coverage_summary"]) {
  assert(schema.required.includes(field), `Candidate-market schema must require ${field}.`);
}

assert(/50\+/.test(worker), "Candidate worker must retain the 50+ credible-market target.");
assert(/20.?25/.test(worker), "Candidate worker must retain the ~20–25 strongest-market target.");
assert(/Top 10.*not.*candidate-market|Top 10.*not.*candidate market|not the candidate-market deliverable/i.test(worker),
  "Candidate worker must state that Top 10 is not the full market.");

assert(ui.includes("Candidate markets ready"), "Workspace summary must use market-ready language.");
assert(ui.includes("Credible market"), "Workspace must expose the credible market.");
assert(ui.includes("Strongest Market"), "Workspace must expose the strongest-market layer.");
assert(ui.includes("Coverage:"), "Workspace must expose market coverage state.");

assert(ingest.includes("candidateMarketSummary"), "Ingestion must accept a full candidate-market summary.");
assert(ingest.includes("SCARCE_MARKET"), "Completion must support evidenced scarce markets.");
assert(ingest.includes("credibleMarketCount < 50"), "Normal COMPLETE market coverage must enforce the 50+ depth target.");
assert(ingest.includes("persistedFullMarketReadyVacancyCount"), "Post-write verification must confirm full-market readiness.");

assert(manifest.includes("candidate_market_is_broader_than_top10: true"), "Manifest must protect full-market semantics.");
assert(manifest.includes("strongest_market_target: 20-25"), "Manifest must encode strongest-market target.");
assert(/Top 10 is not the full market/i.test(publishing), "Publishing contract must distinguish Top 10 from the full market.");

console.log("REC full candidate-market smoke checks passed.");
