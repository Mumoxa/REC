import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const migration = read("supabase/migrations/005_hiring_team_intelligence.sql");
const ingest = read("supabase/functions/ingest-run/index.ts");
const types = read("src/lib/data/types.ts");
const repository = read("src/lib/data/repository.ts");
const ui = read("src/components/workspace/recruitment-workspace.tsx");
const stakeholderSpec = read("core/stakeholder-contact-intelligence.md");
const publishing = read("docs/RUN_PUBLISHING.md");
const manifest = read("manifest.yaml");

assert(migration.includes("company_email_intelligence"), "Migration must create company email intelligence.");
assert(migration.includes("stakeholder_map_status"), "Vacancies must track stakeholder-map state.");
assert(migration.includes("observed_business_email") && migration.includes("probable_business_email"), "Observed and probable emails must remain separate.");

assert(types.includes("interface HiringStakeholder"), "Workspace types must expose hiring stakeholders.");
assert(types.includes("interface CompanyEmailIntelligence"), "Workspace types must expose company email intelligence.");
assert(repository.includes('from("stakeholders")'), "Repository must read stakeholders.");
assert(repository.includes('from("company_email_intelligence")'), "Repository must read company email intelligence.");

assert(ui.includes('"HIRING_TEAM"'), "Vacancy workspace must expose a Hiring Team tab.");
assert(ui.includes("Observed business email"), "Hiring Team UI must show observed business email.");
assert(ui.includes("Probable business email"), "Hiring Team UI must show probable business email.");
assert(ui.includes("Company email intelligence"), "Hiring Team UI must show company email intelligence.");

assert(ingest.includes("stakeholderMapStatus"), "Ingestion must accept stakeholder mapping state.");
assert(ingest.includes("companyEmailIntelligence"), "Ingestion must accept company email intelligence.");
assert(ingest.includes("persistedStakeholderCount"), "Ingestion must verify stakeholder persistence.");
assert(ingest.includes("persistedHiringTeamReadyVacancyCount"), "Ingestion must verify hiring-team readiness.");
assert(ingest.includes("BLOCKED_WITH_EVIDENCE"), "Completion must support explicit evidenced blockers.");

assert(/2–10|2-10/.test(stakeholderSpec), "Stakeholder spec must define the 2–10 target depth.");
assert(/stakeholder.*READY|hiring-team.*READY/i.test(publishing), "Publishing contract must require terminal hiring-team state.");
assert(manifest.includes("run_complete_requires_hiring_team_intelligence: true"), "Manifest must require hiring-team intelligence.");

console.log("REC hiring-team intelligence smoke checks passed.");
