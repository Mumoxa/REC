import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, 'schemas', name), 'utf8'));
const viewState = readJson('workspace-view-state.schema.json');
const savedView = readJson('workspace-saved-view.schema.json');
const operational = readJson('workspace-operational-state.schema.json');
const candidateMap = readJson('candidate-market-map.schema.json');
const opportunity = readJson('final-opportunity.schema.json');
const fingerprint = readJson('role-environment-fingerprint.schema.json');

for (const file of fs.readdirSync(path.join(root, 'schemas')).filter((name) => name.endsWith('.json'))) {
  assert.doesNotThrow(() => readJson(file), `${file} should be valid JSON`);
  const schema = readJson(file);
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.$ref === 'string' && !value.$ref.startsWith('#')) {
      const target = value.$ref.split('#')[0];
      assert.ok(fs.existsSync(path.join(root, 'schemas', target)), `${file} reference ${value.$ref} should resolve.`);
    }
    Object.values(value).forEach(visit);
  };
  visit(schema);
}
const manifest = fs.readFileSync(path.join(root, 'manifest.yaml'), 'utf8');
const manifestPathPattern = new RegExp('(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.-]+\\.(?:md|json|yaml|yml|csv|tsv|html|js|css)', 'g');
const manifestPaths = new Set(manifest.match(manifestPathPattern) || []);
for (const file of manifestPaths) assert.ok(fs.existsSync(path.join(root, file)), `Manifest reference ${file} should resolve.`);
const docsToCheck = ['README.md', 'MASTER_INDEX.md', 'interface/README.md', 'interface/design-system.md', 'interface/review-and-gaps.md', 'interface/prototype/README.md', 'interface/search-filter-contract.md', 'interface/record-binding-contract.md'];
const internalRefPattern = new RegExp('`((?:interface|schemas|core|runtime|tests)/[^`]+)`', 'g');
for (const doc of docsToCheck) {
  const content = fs.readFileSync(path.join(root, doc), 'utf8');
  for (const match of content.matchAll(internalRefPattern)) {
    const ref = match[1].replace(/[.,;:]+$/, '');
    assert.ok(fs.existsSync(path.join(root, ref)), `${doc} reference ${ref} should resolve.`);
  }
}

assert.equal(candidateMap.$defs.candidate.required.includes('candidate_id'), true);
assert.equal(candidateMap.$defs.candidate.properties.candidate_id.type, 'string');
assert.equal(candidateMap.$defs.candidate.properties.candidate_id.minLength, 1);
assert.equal(candidateMap.properties.opportunity_id.minLength, 1);
assert.equal(opportunity.properties.canonical_job_id.minLength, 1);
assert.equal(fingerprint.properties.opportunity_id.minLength, 1);
assert.match(candidateMap.properties.opportunity_id.description, /canonical_job_id/);
assert.match(fingerprint.properties.opportunity_id.description, /canonical_job_id/);
assert.match(opportunity.properties.canonical_job_id.description, /canonical vacancy identity/i);

assert.equal(savedView.required.includes('saved_view_id'), true);
assert.equal(savedView.required.includes('view_state'), true);
assert.equal(viewState.properties.date_window.type, 'object');
assert.equal(viewState.properties.visible_fields.type, 'object');
assert.equal(viewState.properties.active_vacancy_tab.enum.includes('SEARCH_LOG'), true);

const vacancyItem = operational.properties.vacancies.items;
const assignmentItem = operational.properties.candidate_assignments.items;
const closeRule = vacancyItem.allOf.find((rule) => rule.if?.properties?.lifecycle_status?.const === 'CLOSED');
const excludeRule = assignmentItem.allOf.find((rule) => rule.if?.properties?.operational_status?.const === 'EXCLUDED');
assert.ok(closeRule?.then?.required?.includes('closed_reason'));
assert.ok(closeRule?.then?.required?.includes('closed_at'));
assert.match(vacancyItem.properties.closed_reason_detail.pattern, /\\S/);
const closeDetailPattern = new RegExp(vacancyItem.properties.closed_reason_detail.pattern);
assert.equal(closeDetailPattern.test('Client filled the role'), true);
assert.equal(closeDetailPattern.test('   '), false);
assert.ok(excludeRule?.then?.required?.includes('excluded_reason'));
assert.match(excludeRule.then.properties.excluded_reason.pattern, /\\S/);
const excludeReasonPattern = new RegExp(excludeRule.then.properties.excluded_reason.pattern);
assert.equal(excludeReasonPattern.test('Role scope mismatch'), true);
assert.equal(excludeReasonPattern.test('  '), false);

const bindingContract = fs.readFileSync(path.join(root, 'interface/record-binding-contract.md'), 'utf8');
assert.match(bindingContract, /`canonical_job_id` is the canonical vacancy key/);
assert.match(bindingContract, /stable, opaque `candidate_id`/);

const workspaceGolden = fs.readFileSync(path.join(root, 'tests/workspace-ui-golden-cases.yaml'), 'utf8');
const candidateGolden = fs.readFileSync(path.join(root, 'tests/candidate-market-mapping-golden-cases.yaml'), 'utf8');
for (const id of ['workspace_record_identity_binding', 'close_requires_reason_and_timestamp', 'close_other_reason_requires_explanation', 'exclude_requires_reason', 'research_top10_is_not_recruiter_top10', 'recruiter_workflow_actions_do_not_regress_lifecycle', 'saved_view_round_trip', 'no_live_personal_data_in_browser_preview']) {
  assert.ok(workspaceGolden.includes(`id: ${id}`), `Workspace golden case ${id} should be present.`);
}
assert.ok(candidateGolden.includes('id: stable_candidate_identity_for_workspace_actions'));

const html = fs.readFileSync(path.join(root, 'interface/prototype/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'interface/prototype/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'interface/prototype/styles.css'), 'utf8');
assert.match(html, /Prototype environment/);
assert.match(html, /No live research or backend is connected/);
assert.match(html, /id="vacancy-list"/);
assert.match(html, /id="selected-role-content"/);
assert.match(html, /id="candidate-list"/);
assert.match(html, /id="candidate-sample-note"/);
assert.match(app, /Showing \$\{item\.candidates\.length\} synthetic preview records/);
assert.match(html, /id="filters-dialog"/);
assert.match(html, /id="close-vacancy-dialog"/);
assert.match(html, /id="research-dialog"/);
assert.match(html, /id="run-candidate-search"/);
assert.match(app, /#run-candidate-search["']\)\.addEventListener\('click', \(\) => openResearchDialog\('candidate'\)\)/);
assert.doesNotMatch(html, /value="cancel"/, 'Modal cancellation should not submit a destructive form.');
for (const id of ['filters-dialog', 'save-view-dialog', 'close-vacancy-dialog', 'exclude-candidate-dialog']) {
  assert.match(html, new RegExp(`data-close-dialog="${id}" type="button"`), `Dialog ${id} should have a non-submitting close action.`);
}
const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, 'Static HTML ids must be unique.');
const idSet = new Set([...htmlIds, ...[...app.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])]);
for (const match of app.matchAll(/dialog\(['"]([^'"]+)['"]\)/g)) {
  assert.ok(idSet.has(match[1]), `Dialog ${match[1]} must exist in the HTML or a render template.`);
}
for (const match of app.matchAll(/\$\(\s*['"]#([\w-]+)['"]\s*\)/g)) {
  assert.ok(idSet.has(match[1]), `App selector #${match[1]} must exist in the HTML or a render template.`);
}
assert.match(html, /href="styles\.css"/);
assert.match(html, /src="app\.js" defer/);
for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const asset = match[1];
  if (/^(?:[a-z]+:|#|\/\/)/i.test(asset)) continue;
  assert.ok(fs.existsSync(path.join(root, 'interface/prototype', asset)), `Prototype asset ${asset} should exist.`);
}
assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
assert.doesNotMatch(html + app, /role="tab"|role="tablist"|aria-selected=/, 'Button groups must not claim an incomplete ARIA tab pattern.');
assert.match(app, /view\.activeTab = next\.activeTab \|\| 'OVERVIEW'/);
assert.match(app, /event\.key === 'Enter' && event\.target === list/);
assert.match(app, /Normal filtering never starts a search/);
assert.match(app, /NOT_EXECUTED/);
assert.match(app, /Research Top 10/);
assert.match(app, /Recruiter Top 10/);
assert.match(app, /candidate\.candidate_id/);
assert.doesNotMatch(app, /\bfetch\s*\(/, 'The static prototype must not call a live research/API endpoint.');
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /:focus-visible/);
assert.match(css, /@media \(max-width: 720px\)/);

const channelBlock = app.match(/const channelView = \{([^}]+)\}/)?.[1] || '';
const prototypeChannels = [...channelBlock.matchAll(/([A-Z_]+):/g)].map((match) => match[1]).sort();
assert.deepEqual(prototypeChannels, ['AGENCIES', 'AGREED_CLIENTS', 'JOB_BOARDS', 'LINKEDIN']);
const allowedChannelsBlock = manifest.match(/allowed_sourcing_channels:\n((?:[ \t]+- [A-Z_]+\n)+)/)?.[1] || '';
const architectureChannels = [...allowedChannelsBlock.matchAll(/- ([A-Z_]+)/g)].map((match) => match[1]).sort();
assert.deepEqual(architectureChannels, ['AGENCY_SITES', 'AGREED_CLIENTS', 'JOB_BOARDS', 'LINKEDIN']);

console.log('Workspace prototype smoke checks passed.');
