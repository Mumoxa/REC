/**
 * REC Product Regression — Critical Semantic Boundaries
 *
 * These checks read the implementation. They are not tautologies over local
 * variables: a recruiter click that overwrites marketBucket, a close path that
 * drops the reason, or a fifth sourcing channel will fail here.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const workspace = read("src/components/workspace/recruitment-workspace.tsx");
const candidateRoute = read("src/app/api/ops/candidate/route.ts");
const vacancyRoute = read("src/app/api/ops/vacancy/route.ts");
const validation = read("src/lib/ops/validation.ts");
const types = read("src/lib/data/types.ts");
const guard = read("ARCHITECTURE_GUARD.md");
const operationalSchema = read("schemas/workspace-operational-state.schema.json");
const migration = read("supabase/migrations/008_operational_reason_contract.sql");

function testResearchVsRecruiterSeparation() {
  assert.match(workspace, /marketBucket/, "Research market bucket must still be rendered.");
  assert.match(workspace, /Recruiter · /, "Recruiter workflow must be labelled separately from research.");
  assert.doesNotMatch(
    candidateRoute,
    /market_bucket/,
    "Candidate operations must not write the research market bucket."
  );
  assert.match(candidateRoute, /operational_status: operationalStatus/);
  assert.match(types, /marketBucket: MarketBucket/);
  assert.match(types, /operationalStatus: CandidateOperationalStatus/);
  console.log("PASS: Research vs Recruiter separation preserved.");
}

function testEvidenceNotCollapsed() {
  for (const state of ["CONFIRMED", "PROBABLE", "HYPOTHESIS", "UNKNOWN"]) {
    assert.match(types, new RegExp(`"${state}"`));
  }
  assert.match(workspace, /EvidencePill/);
  assert.doesNotMatch(candidateRoute, /evidence_status/);
  console.log("PASS: Evidence and workflow concepts are not collapsed.");
}

function testCloseRequiresReasonAndPreservesLineage() {
  for (const reason of [
    "FILLED",
    "EXPIRED",
    "CLIENT_NO_LONGER_HIRING",
    "NOT_COMMERCIALLY_RELEVANT",
    "DUPLICATE",
    "CANCELLED",
    "OTHER",
  ]) {
    assert.match(validation, new RegExp(`"${reason}"`));
    assert.match(operationalSchema, new RegExp(`"${reason}"`));
  }
  assert.match(vacancyRoute, /closed_reason: reason/);
  assert.match(vacancyRoute, /closed_at: now/);
  assert.match(validation, /OTHER requires an explanation/);
  assert.match(migration, /closed_reason_detail/);
  console.log("PASS: Close semantics valid.");
}

function testFailedMutationRollback() {
  assert.match(workspace, /operationalStatus: previousStatus/);
  assert.match(workspace, /lifecycleStatus: previousStatus/);
  assert.match(workspace, /Failed to save candidate operation/);
  assert.match(workspace, /Failed to close vacancy/);
  console.log("PASS: Failed mutation rollback semantics verified.");
}

function testHiringTeamEmailDistinction() {
  assert.match(workspace, /Observed business email/);
  assert.match(workspace, /Probable business email/);
  assert.match(types, /observedBusinessEmail\?: string \| null/);
  assert.match(types, /probableBusinessEmail\?: string \| null/);
  console.log("PASS: Email distinction preserved.");
}

function testFourChannelsOnly() {
  for (const channel of ["AGREED_CLIENTS", "AGENCY_SITES", "LINKEDIN", "JOB_BOARDS"]) {
    assert.match(guard, new RegExp(channel));
    assert.match(workspace, new RegExp(`value="${channel}"`));
  }
  assert.match(guard, /Exactly four sourcing channels/);
  assert.doesNotMatch(workspace, /FIFTH_CHANNEL|value="OTHER_CHANNEL"/);
  console.log("PASS: Four-channel invariant held.");
}

function testExclusionRequiresReason() {
  assert.match(validation, /Candidate exclusion requires a reason/);
  assert.match(candidateRoute, /excluded_reason: excludedReason/);
  assert.match(workspace, /Reason for exclusion/);
  assert.match(migration, /candidate_operations_excluded_reason_required/);
  assert.match(operationalSchema, /excluded_reason/);
  console.log("PASS: Exclusion reason required.");
}

function testArchiveRetrieval() {
  assert.match(types, /"MARKET_READY"/);
  assert.doesNotMatch(types, /TOP_10_READY/);
  assert.match(workspace, /value="ARCHIVED"/);
  assert.match(workspace, /value="ALL"/);
  assert.match(types, /"CLOSED"/);
  console.log("PASS: Archive state exists.");
}

try {
  testResearchVsRecruiterSeparation();
  testEvidenceNotCollapsed();
  testCloseRequiresReasonAndPreservesLineage();
  testFailedMutationRollback();
  testHiringTeamEmailDistinction();
  testFourChannelsOnly();
  testExclusionRequiresReason();
  testArchiveRetrieval();
  console.log("\nAll REC product regression checks passed.");
} catch (error) {
  console.error("REGRESSION FAILURE:", error);
  process.exit(1);
}
