(() => {
  'use strict';

  const STORAGE = {
    view: 'rec.workspace.prototype.view.v1',
    operations: 'rec.workspace.prototype.operations.v1',
    savedViews: 'rec.workspace.prototype.saved-views.v1',
    demoLog: 'rec.workspace.prototype.demo-log.v1',
  };

  const opportunities = [
    {
      id: 'vac-demo-041',
      role: 'Finance Director, Southern Africa',
      employer: 'Karoo Meridian Foods',
      employerStatus: 'CONFIRMED',
      location: 'Cape Town, Western Cape',
      region: 'Western Cape',
      clientStatus: 'AGREED_CLIENT',
      channel: 'AGREED_CLIENTS',
      channelLabel: 'Agreed client',
      lifecycle: 'CANDIDATE_MAPPING',
      qaState: 'PASS_WITH_UNKNOWNS',
      researchRequired: false,
      firstSeen: 'Today, 08:42',
      lastSeen: 'Today, 09:16',
      lastVerified: '18 min ago',
      lastVerifiedMinutes: 18,
      candidateCount: 39,
      credibleCount: 39,
      strongestCount: 18,
      top10Count: 8,
      sourceCount: 3,
      new: true,
      unread: true,
      priority: 1,
      ref: 'VAC-041 · TT-OPP-2026-041',
      salaryGate: 'VERIFY',
      roleConfidence: 'CONFIRMED',
      employerConfidence: 'CONFIRMED',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'PASS', note: 'Direct employer supported by primary source and a second independent signal.', time: '09:16' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'PASS_WITH_UNKNOWNS', note: 'Team scope remains unresolved; it is not treated as a requirement.', time: '09:11' },
        { gate: 'C', label: 'Target-company map', state: 'IN_PROGRESS', note: 'Tier A and B coverage is being independently challenged.', time: 'In progress' },
        { gate: 'D', label: 'Candidate evidence', state: 'NOT_STARTED', note: 'Candidate-level claims remain separate from employer-level facts.', time: 'Pending' },
      ],
      requirements: [
        { name: 'CA(SA) designation', value: 'Required', status: 'CONFIRMED', source: 'Employer careers page' },
        { name: 'Multi-site food manufacturing', value: 'Operating context', status: 'CONFIRMED', source: 'Company profile' },
        { name: 'SAP S/4HANA', value: 'Systems exposure', status: 'PROBABLE', source: 'Role advert' },
        { name: 'Team size / reporting scope', value: 'Not established', status: 'UNKNOWN', source: 'Not evidenced' },
        { name: 'Listed-company reporting', value: 'Preference', status: 'PROBABLE', source: 'Role advert' },
      ],
      sources: [
        { name: 'Employer careers page', type: 'Primary vacancy source', status: 'CONFIRMED', ref: 'SRC-8841', detail: 'Role title, location and CA(SA) requirement are explicit.' },
        { name: 'Hiring leader public post', type: 'Independent hiring signal', status: 'CONFIRMED', ref: 'SRC-8848', detail: 'Supports current hiring activity; used as corroboration, not as a second vacancy.' },
        { name: 'Agency advert', type: 'Supporting source', status: 'PROBABLE', ref: 'SRC-8893', detail: 'Likely same vacancy. Kept as separate source lineage pending exact requisition match.' },
      ],
      stakeholders: [
        { initials: 'LM', name: 'L. Maseko', title: 'Group Finance Executive', relevance: 'Functional hiring-owner route', status: 'CURRENT_VERIFIED' },
        { initials: 'RK', name: 'R. Khumalo', title: 'Talent Acquisition Partner', relevance: 'Recruitment process route', status: 'CURRENT_PROBABLE' },
      ],
      searchLog: [
        { family: 'Direct vacancy', source: 'Employer careers', status: 'EXECUTED', yield: '1 current vacancy', reason: 'Resolve role and employer from a primary source.' },
        { family: 'Hiring confirmation', source: 'Public professional posts', status: 'EXECUTED', yield: '1 supporting signal', reason: 'Check current hiring activity and role context.' },
        { family: 'Tier A finance leaders', source: 'LinkedIn / public web', status: 'EXECUTED', yield: '39 credible profiles', reason: 'Build an evidence-led market map from validated comparator companies.' },
      ],
      timeline: [
        { title: 'Employer resolved as confirmed', text: 'Primary careers page and hiring-leader activity support the same direct employer.', time: 'Today · 09:16', kind: 'good' },
        { title: 'QA Gate A passed with unknowns retained', text: 'Salary and team scope remain open. Neither is silently inferred.', time: 'Today · 09:05', kind: 'good' },
        { title: 'Candidate market mapping started', text: 'Role fingerprint accepted for downstream research; target-company coverage is in progress.', time: 'Today · 08:51', kind: 'warn' },
        { title: 'Canonical vacancy created', text: 'Three source appearances linked to one opportunity record.', time: 'Today · 08:42', kind: 'good' },
      ],
      candidates: [
        { candidate_id: 'cand-demo-271', name: 'Lindiwe Maseko', initials: 'LM', title: 'Finance Director', employer: 'Cape Meridian Produce', location: 'Cape Town', tier: 'A', marketRank: 1, researchTop10: true, strongest: true, qa: 'PASS_WITH_UNKNOWNS', lastVerified: '2 days ago', currentEmployment: 'PROBABLE', reason: 'Direct multi-site food manufacturing exposure with public evidence of group-level finance leadership.', claims: [
          { name: 'CA(SA)', status: 'CONFIRMED', basis: 'Professional profile and membership reference are aligned.', source: 'Candidate-level source · demo' },
          { name: 'Food manufacturing', status: 'CONFIRMED', basis: 'Current role description names the operating environment.', source: 'Employer biography · demo' },
          { name: 'SAP S/4HANA', status: 'PROBABLE', basis: 'A public project profile refers to SAP migration; individual ownership needs verification.', source: 'Public project reference · demo' },
          { name: 'Team scope', status: 'UNKNOWN', basis: 'No individual-level source establishes direct-report count.', source: 'Not evidenced' },
        ] },
        { candidate_id: 'cand-demo-272', name: 'Thabo Ndlovu', initials: 'TN', title: 'Group Financial Controller', employer: 'Morrowfield Consumer Brands', location: 'Stellenbosch', tier: 'A', marketRank: 2, researchTop10: true, strongest: true, qa: 'PASS', lastVerified: '4 days ago', currentEmployment: 'CURRENT_VERIFIED', reason: 'Evidence supports consolidated reporting across a multi-entity consumer group.', claims: [
          { name: 'CA(SA)', status: 'CONFIRMED', basis: 'Public professional profile lists the designation.', source: 'Candidate-level source · demo' },
          { name: 'Multi-entity consolidation', status: 'CONFIRMED', basis: 'Candidate biography describes responsibility for group reporting.', source: 'Company leadership page · demo' },
          { name: 'FMCG environment', status: 'CONFIRMED', basis: 'Current employer product and role context are directly documented.', source: 'Employer biography · demo' },
          { name: 'SAP S/4HANA', status: 'UNKNOWN', basis: 'Employer use is not treated as proof of candidate experience.', source: 'Not evidenced' },
        ] },
        { candidate_id: 'cand-demo-273', name: 'Ayesha Govender', initials: 'AG', title: 'Regional Finance Executive', employer: 'Ndlovu Bay Holdings', location: 'Cape Town', tier: 'B', marketRank: 4, researchTop10: false, strongest: true, qa: 'PASS_WITH_UNKNOWNS', lastVerified: '1 week ago', currentEmployment: 'CURRENT_VERIFIED', reason: 'Comparable multi-site operating environment; team leadership claim needs a current source.', claims: [
          { name: 'CA(SA)', status: 'CONFIRMED', basis: 'Public professional profile lists the designation.', source: 'Candidate-level source · demo' },
          { name: 'Multi-site exposure', status: 'CONFIRMED', basis: 'Candidate profile lists regional remit across three sites.', source: 'Candidate biography · demo' },
          { name: 'Manufacturing', status: 'PROBABLE', basis: 'Employer operates manufacturing sites; the candidate personal scope is not yet explicit.', source: 'Mixed company / candidate sources · demo' },
          { name: 'Notice period', status: 'UNKNOWN', basis: 'Never inferred from seniority or current employment.', source: 'Not researched' },
        ] },
        { candidate_id: 'cand-demo-274', name: 'Kagiso Petersen', initials: 'KP', title: 'Financial Controller', employer: 'Silverfern Foods', location: 'Paarl', tier: 'A', marketRank: 7, researchTop10: false, strongest: false, qa: 'NOT_REVIEWED', lastVerified: '11 days ago', currentEmployment: 'PROBABLE', reason: 'Potential direct environment overlap. Current-employment check and systems evidence remain open.', claims: [
          { name: 'CA(SA)', status: 'CONFIRMED', basis: 'Public profile includes an explicit qualification entry.', source: 'Candidate-level source · demo' },
          { name: 'Food manufacturing', status: 'PROBABLE', basis: 'Employer overlap is known; candidate-level remit needs confirmation.', source: 'Company context · demo' },
          { name: 'SAP', status: 'UNKNOWN', basis: 'No individual-level evidence located.', source: 'Not evidenced' },
          { name: 'Availability', status: 'UNKNOWN', basis: 'No contact has been made.', source: 'Not researched' },
        ] },
      ],
    },
    {
      id: 'vac-demo-042', role: 'Head of Supply Chain', employer: 'Employer unresolved', employerStatus: 'UNKNOWN', location: 'Johannesburg, Gauteng', region: 'Gauteng', clientStatus: 'UNKNOWN', channel: 'AGENCY_SITES', channelLabel: 'Agency sites', lifecycle: 'VERIFYING', qaState: 'FAIL_RESEARCH_REQUIRED', researchRequired: true, firstSeen: 'Today, 08:31', lastSeen: 'Today, 08:58', lastVerified: '27 min ago', lastVerifiedMinutes: 27, candidateCount: 0, credibleCount: 0, strongestCount: 0, top10Count: 0, sourceCount: 2, new: true, unread: true, priority: 4, ref: 'VAC-042 · TT-OPP-2026-042', salaryGate: 'VERIFY', roleConfidence: 'PROBABLE', employerConfidence: 'UNKNOWN',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'FAIL_RESEARCH_REQUIRED', note: 'Anonymous agency advert; end employer is unresolved.', time: '08:58' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'NOT_STARTED', note: 'Wait for role and direct employer resolution.', time: 'Blocked' },
        { gate: 'C', label: 'Target-company map', state: 'NOT_STARTED', note: 'Candidate work has not started.', time: 'Blocked' },
        { gate: 'D', label: 'Candidate evidence', state: 'NOT_STARTED', note: 'Candidate work has not started.', time: 'Blocked' },
      ],
      requirements: [
        { name: 'Role title', value: 'Head of Supply Chain', status: 'PROBABLE', source: 'Agency advert' },
        { name: 'Direct employer', value: 'Not identified', status: 'UNKNOWN', source: 'Anonymous advert' },
        { name: 'Industry / value chain', value: 'Not established', status: 'UNKNOWN', source: 'Not evidenced' },
        { name: 'Geography', value: 'Johannesburg', status: 'CONFIRMED', source: 'Agency advert' },
      ],
      sources: [
        { name: 'Network Recruitment advert', type: 'Agency source', status: 'CONFIRMED', ref: 'SRC-9017', detail: 'Advert is live in this sample; end employer is withheld.' },
        { name: 'LinkedIn repost', type: 'Supporting source', status: 'PROBABLE', ref: 'SRC-9023', detail: 'Likely same vacancy; employer identity is not independently resolved.' },
      ],
      stakeholders: [],
      searchLog: [
        { family: 'Employer attribution', source: 'Agency / company sources', status: 'ACCESS_LIMITED', yield: 'Employer unresolved', reason: 'Resolve end employer before candidate mapping.' },
      ],
      timeline: [
        { title: 'Employer attribution research queued', text: 'The role stays in Needs Research until the direct employer is resolved.', time: 'Today · 08:58', kind: 'warn' },
        { title: 'Anonymous agency advert surfaced', text: 'Two source appearances linked as supporting evidence; not counted as two vacancies.', time: 'Today · 08:31', kind: 'good' },
      ],
      candidates: [],
    },
    {
      id: 'vac-demo-043', role: 'Chief Technology Officer', employer: 'Ternion Grid Systems', employerStatus: 'PROBABLE', location: 'Cape Town, Western Cape', region: 'Western Cape', clientStatus: 'TARGET_PROSPECT', channel: 'LINKEDIN', channelLabel: 'LinkedIn', lifecycle: 'CANDIDATE_MAPPING', qaState: 'PASS_WITH_UNKNOWNS', researchRequired: true, firstSeen: 'Yesterday, 15:24', lastSeen: 'Today, 08:40', lastVerified: '1 hr ago', lastVerifiedMinutes: 60, candidateCount: 12, credibleCount: 12, strongestCount: 5, top10Count: 3, sourceCount: 4, new: false, unread: false, priority: 3, ref: 'VAC-043 · TT-OPP-2026-043', salaryGate: 'VERIFY', roleConfidence: 'PROBABLE', employerConfidence: 'PROBABLE',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'PASS_WITH_UNKNOWNS', note: 'Role is credible; operating entity needs one more check.', time: 'Yesterday' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'PASS_WITH_UNKNOWNS', note: 'Reporting line is unknown and remains visibly open.', time: 'Today' },
        { gate: 'C', label: 'Target-company map', state: 'IN_PROGRESS', note: 'Comparator rationale is recorded for each mapped company.', time: 'In progress' },
        { gate: 'D', label: 'Candidate evidence', state: 'NOT_STARTED', note: 'Initial candidate evidence awaits independent review.', time: 'Pending' },
      ],
      requirements: [
        { name: 'Technology transformation', value: 'Mandate', status: 'CONFIRMED', source: 'Executive post' },
        { name: 'Energy / infrastructure', value: 'Operating context', status: 'PROBABLE', source: 'Company profile' },
        { name: 'Board reporting', value: 'Not established', status: 'UNKNOWN', source: 'Not evidenced' },
        { name: 'Geography', value: 'Cape Town', status: 'CONFIRMED', source: 'Public hiring signal' },
      ],
      sources: [
        { name: 'Executive hiring signal', type: 'LinkedIn public activity', status: 'CONFIRMED', ref: 'SRC-8765', detail: 'Signal indicates an active technology leadership search.' },
        { name: 'Company expansion statement', type: 'Company source', status: 'PROBABLE', ref: 'SRC-8772', detail: 'Supports the likely operating environment, not every role requirement.' },
        { name: 'Professional discussion thread', type: 'Public social signal', status: 'PROBABLE', ref: 'SRC-8780', detail: 'Corroborating context only; exact legal employer remains under review.' },
        { name: 'Company careers page', type: 'Primary vacancy source', status: 'HYPOTHESIS', ref: 'SRC-8789', detail: 'Possible role relationship; not yet a confirmed matching requisition.' },
      ],
      stakeholders: [
        { initials: 'JM', name: 'J. Mokoena', title: 'Chief Executive Officer', relevance: 'Executive sponsor route', status: 'CURRENT_PROBABLE' },
      ],
      searchLog: [
        { family: 'Leadership signal', source: 'LinkedIn public activity', status: 'EXECUTED', yield: '4 source records', reason: 'Resolve whether the social signal represents a current executive search.' },
        { family: 'Direct employer verification', source: 'Company web sources', status: 'EXECUTED', yield: '2 competing entities', reason: 'Separate operating company from the holding-company name.' },
      ],
      timeline: [
        { title: 'Employer resolution downgraded to probable', text: 'Holding company and operating entity are not yet conclusively separated.', time: 'Today · 08:40', kind: 'warn' },
        { title: 'Candidate market opened', text: 'Twelve people surfaced; Gate D review is still pending.', time: 'Yesterday · 16:10', kind: 'good' },
      ],
      candidates: [
        { candidate_id: 'cand-demo-281', name: 'Amara Dlamini', initials: 'AD', title: 'Chief Technology Officer', employer: 'Asterion Networks', location: 'Cape Town', tier: 'A', marketRank: 1, researchTop10: true, strongest: true, qa: 'PASS_WITH_UNKNOWNS', lastVerified: '3 days ago', currentEmployment: 'CURRENT_VERIFIED', reason: 'Public leadership material supports large-scale platform transformation; energy-sector transferability remains a hypothesis.', claims: [
          { name: 'Technology leadership', status: 'CONFIRMED', basis: 'Current role and public leadership biography are aligned.', source: 'Candidate-level source · demo' },
          { name: 'Energy / infrastructure', status: 'PROBABLE', basis: 'Adjacent operating experience; not a direct market equivalent.', source: 'Public project note · demo' },
          { name: 'Board reporting', status: 'UNKNOWN', basis: 'No person-level source establishes board accountability.', source: 'Not evidenced' },
        ] },
        { candidate_id: 'cand-demo-282', name: 'Sipho Jacobs', initials: 'SJ', title: 'Technology Transformation Executive', employer: 'Southline Digital', location: 'Stellenbosch', tier: 'B', marketRank: 5, researchTop10: false, strongest: true, qa: 'NOT_REVIEWED', lastVerified: '6 days ago', currentEmployment: 'PROBABLE', reason: 'Transformation history appears relevant; current-employment verification is incomplete.', claims: [
          { name: 'Transformation mandate', status: 'CONFIRMED', basis: 'Public programme history names role and delivery remit.', source: 'Candidate-level source · demo' },
          { name: 'Energy sector', status: 'PROBABLE', basis: 'One project reference suggests exposure; scope is unclear.', source: 'Project source · demo' },
          { name: 'Current employment', status: 'UNKNOWN', basis: 'Most recent profile date is stale.', source: 'Needs verification' },
        ] },
      ],
    },
    {
      id: 'vac-demo-044', role: 'Senior Plant Operations Manager', employer: 'Ravenswood Industrial Works', employerStatus: 'CONFIRMED', location: 'Ekurhuleni, Gauteng', region: 'Gauteng', clientStatus: 'TARGET_PROSPECT', channel: 'JOB_BOARDS', channelLabel: 'Job boards / ATS', lifecycle: 'QUALIFIED', qaState: 'PASS', researchRequired: false, firstSeen: 'Yesterday, 13:08', lastSeen: 'Today, 07:52', lastVerified: '2 hr ago', lastVerifiedMinutes: 120, candidateCount: 26, credibleCount: 26, strongestCount: 11, top10Count: 6, sourceCount: 2, new: false, unread: false, priority: 5, ref: 'VAC-044 · TT-OPP-2026-044', salaryGate: 'INCLUDE', roleConfidence: 'CONFIRMED', employerConfidence: 'CONFIRMED',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'PASS', note: 'Direct ATS listing and employer details agree.', time: 'Yesterday' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'PASS', note: 'Plant context and mandate have source support.', time: 'Today' },
        { gate: 'C', label: 'Target-company map', state: 'IN_PROGRESS', note: 'Comparable employer map is being expanded.', time: 'In progress' },
        { gate: 'D', label: 'Candidate evidence', state: 'NOT_STARTED', note: 'Initial candidate set has not been challenged.', time: 'Pending' },
      ],
      requirements: [
        { name: 'Lean manufacturing', value: 'Required', status: 'CONFIRMED', source: 'ATS advert' },
        { name: 'Multi-shift operations', value: 'Required', status: 'CONFIRMED', source: 'ATS advert' },
        { name: 'Automotive value chain', value: 'Preference', status: 'PROBABLE', source: 'Role context' },
        { name: 'Team size', value: 'Not established', status: 'UNKNOWN', source: 'Not evidenced' },
      ],
      sources: [
        { name: 'Employer ATS listing', type: 'Primary vacancy source', status: 'CONFIRMED', ref: 'SRC-8688', detail: 'Current role and core operating requirements.' },
        { name: 'Job-board copy', type: 'Supporting source', status: 'CONFIRMED', ref: 'SRC-8701', detail: 'Content matches the employer listing; retained as a separate appearance.' },
      ],
      stakeholders: [],
      searchLog: [
        { family: 'Plant operations comparators', source: 'LinkedIn / public web', status: 'EXECUTED', yield: '26 credible profiles', reason: 'Map relevant candidates across comparable industrial operations.' },
      ],
      timeline: [
        { title: 'Commercial qualification passed', text: 'Salary gate and functional scope currently meet the configured criteria.', time: 'Today · 07:52', kind: 'good' },
        { title: 'Duplicate source linked', text: 'The job-board copy was attached to the ATS record; no duplicate vacancy was created.', time: 'Yesterday · 13:21', kind: 'good' },
      ],
      candidates: [
        { candidate_id: 'cand-demo-291', name: 'Peter Khumalo', initials: 'PK', title: 'Plant Operations Director', employer: 'Morningside Components', location: 'Gauteng', tier: 'A', marketRank: 1, researchTop10: true, strongest: true, qa: 'PASS', lastVerified: '2 days ago', currentEmployment: 'CURRENT_VERIFIED', reason: 'Evidence supports multi-shift plant leadership in a closely related industrial value chain.', claims: [
          { name: 'Lean manufacturing', status: 'CONFIRMED', basis: 'Candidate profile references direct programme ownership.', source: 'Candidate-level source · demo' },
          { name: 'Multi-shift operations', status: 'CONFIRMED', basis: 'Public role history describes 24-hour production scope.', source: 'Employer biography · demo' },
          { name: 'Automotive', status: 'PROBABLE', basis: 'Supplier context suggests value-chain exposure, but personal scope needs verification.', source: 'Mixed sources · demo' },
        ] },
        { candidate_id: 'cand-demo-292', name: 'Naledi Petersen', initials: 'NP', title: 'Manufacturing Executive', employer: 'Arborline Engineering', location: 'Johannesburg', tier: 'B', marketRank: 3, researchTop10: true, strongest: true, qa: 'PASS_WITH_UNKNOWNS', lastVerified: '5 days ago', currentEmployment: 'PROBABLE', reason: 'Comparable production complexity; scale of direct reports remains unknown.', claims: [
          { name: 'Manufacturing leadership', status: 'CONFIRMED', basis: 'Public profile identifies multi-plant responsibility.', source: 'Candidate-level source · demo' },
          { name: 'Automotive supply chain', status: 'PROBABLE', basis: 'Employer segment is relevant; individual programme involvement is not established.', source: 'Company context · demo' },
          { name: 'Team size', status: 'UNKNOWN', basis: 'No reliable individual-level headcount evidence.', source: 'Not evidenced' },
        ] },
      ],
    },
    {
      id: 'vac-demo-045', role: 'Group Financial Controller', employer: 'Northline Retail Holdings', employerStatus: 'CONFIRMED', location: 'Cape Town, Western Cape', region: 'Western Cape', clientStatus: 'AGREED_GROUP_ENTITY', channel: 'AGENCY_SITES', channelLabel: 'Agency sites', lifecycle: 'MARKET_READY', qaState: 'PASS', researchRequired: false, firstSeen: 'Monday, 14:22', lastSeen: 'Today, 08:15', lastVerified: '42 min ago', lastVerifiedMinutes: 42, candidateCount: 54, credibleCount: 54, strongestCount: 23, top10Count: 10, sourceCount: 4, new: false, unread: false, priority: 2, ref: 'VAC-045 · TT-OPP-2026-045', salaryGate: 'INCLUDE', roleConfidence: 'CONFIRMED', employerConfidence: 'CONFIRMED',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'PASS', note: 'Employer and vacancy evidence were independently checked.', time: 'Monday' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'PASS', note: 'Requirements were reviewed against primary sources.', time: 'Tuesday' },
        { gate: 'C', label: 'Target-company map', state: 'PASS', note: 'Tier rationale and coverage were independently challenged.', time: 'Yesterday' },
        { gate: 'D', label: 'Candidate evidence', state: 'PASS_WITH_UNKNOWNS', note: 'Candidate set passed review with explicit availability and notice-period unknowns.', time: 'Today' },
      ],
      requirements: [
        { name: 'CA(SA)', value: 'Required', status: 'CONFIRMED', source: 'Employer source' },
        { name: 'Retail / distribution', value: 'Required context', status: 'CONFIRMED', source: 'Employer profile' },
        { name: 'Multi-entity reporting', value: 'Required', status: 'CONFIRMED', source: 'Role advert' },
        { name: 'Oracle ERP', value: 'Preference', status: 'PROBABLE', source: 'Role advert' },
      ],
      sources: [
        { name: 'Employer careers page', type: 'Primary vacancy source', status: 'CONFIRMED', ref: 'SRC-8412', detail: 'Current requisition and requirements.' },
        { name: 'Agency advert', type: 'Supporting source', status: 'CONFIRMED', ref: 'SRC-8450', detail: 'Advert content is consistent with the active employer record.' },
        { name: 'Hiring-manager update', type: 'Hiring signal', status: 'CONFIRMED', ref: 'SRC-8473', detail: 'Public update confirms current hiring activity.' },
        { name: 'Job-board copy', type: 'Supporting source', status: 'PROBABLE', ref: 'SRC-8501', detail: 'Likely syndication of the same vacancy.' },
      ],
      stakeholders: [
        { initials: 'AS', name: 'A. Steyn', title: 'Chief Financial Officer', relevance: 'Functional hiring-owner route', status: 'CURRENT_VERIFIED' },
        { initials: 'LM', name: 'L. Mokoena', title: 'Talent Acquisition Lead', relevance: 'Recruitment process route', status: 'CURRENT_VERIFIED' },
      ],
      searchLog: [
        { family: 'Tier A direct comparators', source: 'LinkedIn / public web', status: 'EXECUTED', yield: '31 credible profiles', reason: 'Search directly comparable retail and distribution environments.' },
        { family: 'Tier B value chain', source: 'LinkedIn / public web', status: 'EXECUTED', yield: '23 credible profiles', reason: 'Extend coverage across adjacent consumer supply chains.' },
      ],
      timeline: [
        { title: 'QA Gate D passed with unknowns', text: 'Availability and notice period remain unknown until verified directly.', time: 'Today · 08:15', kind: 'good' },
        { title: 'Top 10 research set approved', text: 'Ten high-conviction profiles selected from the evidence-backed candidate universe.', time: 'Yesterday · 16:34', kind: 'good' },
      ],
      candidates: [
        { candidate_id: 'cand-demo-301', name: 'Zola Mthembu', initials: 'ZM', title: 'Group Financial Controller', employer: 'Alderway Stores', location: 'Cape Town', tier: 'A', marketRank: 1, researchTop10: true, strongest: true, qa: 'PASS', lastVerified: '1 day ago', currentEmployment: 'CURRENT_VERIFIED', reason: 'Multi-entity consumer finance leadership with person-level evidence for reporting and close ownership.', claims: [
          { name: 'CA(SA)', status: 'CONFIRMED', basis: 'Public professional profile and designation record agree.', source: 'Candidate-level source · demo' },
          { name: 'Multi-entity reporting', status: 'CONFIRMED', basis: 'Public biography describes consolidated reporting responsibility.', source: 'Employer biography · demo' },
          { name: 'Oracle ERP', status: 'PROBABLE', basis: 'Project record indicates exposure; depth is unresolved.', source: 'Project reference · demo' },
          { name: 'Availability', status: 'UNKNOWN', basis: 'Not established; passive-candidate status is not a negative signal.', source: 'Not researched' },
        ] },
        { candidate_id: 'cand-demo-302', name: 'Michael van Rensburg', initials: 'MV', title: 'Finance Executive', employer: 'Juniper Market Group', location: 'Cape Town', tier: 'A', marketRank: 2, researchTop10: true, strongest: true, qa: 'PASS_WITH_UNKNOWNS', lastVerified: '3 days ago', currentEmployment: 'CURRENT_VERIFIED', reason: 'Direct retail and distribution environment; individual system depth remains probable, not confirmed.', claims: [
          { name: 'CA(SA)', status: 'CONFIRMED', basis: 'Professional profile lists designation.', source: 'Candidate-level source · demo' },
          { name: 'Retail operations', status: 'CONFIRMED', basis: 'Role history covers retail and distribution finance.', source: 'Candidate biography · demo' },
          { name: 'Oracle ERP', status: 'PROBABLE', basis: 'Employer technology is a clue only; candidate-level ownership is not confirmed.', source: 'Company context · demo' },
          { name: 'Notice period', status: 'UNKNOWN', basis: 'Not established.', source: 'Not researched' },
        ] },
      ],
    },
    {
      id: 'vac-demo-046', role: 'Commercial Director', employer: 'Lattice Coast Distribution', employerStatus: 'PROBABLE', location: 'Durban, KwaZulu-Natal', region: 'KwaZulu-Natal', clientStatus: 'PAST_CLIENT', channel: 'LINKEDIN', channelLabel: 'LinkedIn', lifecycle: 'VERIFYING', qaState: 'NOT_REVIEWED', researchRequired: true, firstSeen: 'Monday, 09:44', lastSeen: 'Yesterday, 17:12', lastVerified: '1 day ago', lastVerifiedMinutes: 1440, candidateCount: 0, credibleCount: 0, strongestCount: 0, top10Count: 0, sourceCount: 2, new: false, unread: false, priority: 6, ref: 'VAC-046 · TT-OPP-2026-046', salaryGate: 'NOT_ASSESSED', roleConfidence: 'PROBABLE', employerConfidence: 'PROBABLE',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'NOT_REVIEWED', note: 'Past-client relationship needs current verification before commercial promotion.', time: 'Pending' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'NOT_STARTED', note: 'Candidate mapping has not started.', time: 'Blocked' },
        { gate: 'C', label: 'Target-company map', state: 'NOT_STARTED', note: 'Candidate mapping has not started.', time: 'Blocked' },
        { gate: 'D', label: 'Candidate evidence', state: 'NOT_STARTED', note: 'Candidate mapping has not started.', time: 'Blocked' },
      ],
      requirements: [
        { name: 'Commercial leadership', value: 'Mandate', status: 'PROBABLE', source: 'Public hiring signal' },
        { name: 'Distribution exposure', value: 'Context', status: 'PROBABLE', source: 'Company profile' },
        { name: 'Current agreement status', value: 'Not reconfirmed', status: 'UNKNOWN', source: 'Client registry needs review' },
      ],
      sources: [
        { name: 'Executive hiring signal', type: 'LinkedIn public activity', status: 'PROBABLE', ref: 'SRC-8301', detail: 'Role signal may indicate an active commercial leadership search.' },
        { name: 'Company announcement', type: 'Public company source', status: 'PROBABLE', ref: 'SRC-8312', detail: 'Supports company expansion context but not final employer identity.' },
      ],
      stakeholders: [],
      searchLog: [],
      timeline: [
        { title: 'Past-client relationship flagged', text: 'Current agreement status must be verified; historical client status is not promoted automatically.', time: 'Yesterday · 17:12', kind: 'warn' },
        { title: 'Commercial leadership signal captured', text: 'Role and employer attribution remain probable pending Gate A review.', time: 'Monday · 09:44', kind: 'good' },
      ],
      candidates: [],
    },
    {
      id: 'vac-demo-038', role: 'Chief People Officer', employer: 'Willowridge Group', employerStatus: 'CONFIRMED', location: 'Johannesburg, Gauteng', region: 'Gauteng', clientStatus: 'TARGET_PROSPECT', channel: 'JOB_BOARDS', channelLabel: 'Job boards / ATS', lifecycle: 'CLOSED', qaState: 'PASS', researchRequired: false, firstSeen: '17 Sep, 10:14', lastSeen: '26 Sep, 16:40', lastVerified: '26 Sep', lastVerifiedMinutes: 10080, candidateCount: 31, credibleCount: 31, strongestCount: 17, top10Count: 10, sourceCount: 3, new: false, unread: false, priority: 7, ref: 'VAC-038 · TT-OPP-2026-038', salaryGate: 'INCLUDE', roleConfidence: 'CONFIRMED', employerConfidence: 'CONFIRMED', closedReason: 'FILLED',
      qaGates: [
        { gate: 'A', label: 'Discovery, role and employer', state: 'PASS', note: 'Historical evidence remains attached.', time: '17 Sep' },
        { gate: 'B', label: 'Role / environment fingerprint', state: 'PASS', note: 'Historical evidence remains attached.', time: '19 Sep' },
        { gate: 'C', label: 'Target-company map', state: 'PASS', note: 'Historical evidence remains attached.', time: '22 Sep' },
        { gate: 'D', label: 'Candidate evidence', state: 'PASS_WITH_UNKNOWNS', note: 'Some candidate data remains unknown and visible.', time: '26 Sep' },
      ],
      requirements: [
        { name: 'People leadership', value: 'Mandate', status: 'CONFIRMED', source: 'Employer role profile' },
        { name: 'Multi-entity experience', value: 'Preference', status: 'PROBABLE', source: 'Role profile' },
      ],
      sources: [
        { name: 'Employer ATS record', type: 'Primary vacancy source', status: 'CONFIRMED', ref: 'SRC-7991', detail: 'Historical record retained after close.' },
        { name: 'Job-board appearance', type: 'Supporting source', status: 'CONFIRMED', ref: 'SRC-8014', detail: 'Source provenance remains available in the archive.' },
        { name: 'Hiring update', type: 'Hiring signal', status: 'CONFIRMED', ref: 'SRC-8130', detail: 'Supports closure as filled.' },
      ],
      stakeholders: [],
      searchLog: [],
      timeline: [
        { title: 'Vacancy archived as filled', text: 'Source records, candidate map and QA history remain attached.', time: '26 Sep · 16:40', kind: 'good' },
        { title: 'QA Gate D passed with unknowns', text: 'Candidate-market record retained without changing unresolved facts.', time: '26 Sep · 15:12', kind: 'good' },
      ],
      candidates: [],
    },
  ];

  const defaultView = {
    activeModule: 'VACANCIES',
    vacancyView: 'INBOX',
    selectedVacancyId: 'vac-demo-041',
    selectedCandidateId: null,
    vacancySearch: '',
    candidateSearch: '',
    globalSearch: '',
    filters: { client: 'ANY', channel: 'ANY', employer: 'ANY', qa: 'ANY', region: 'ANY', freshness: 'ANY', unread: false, top10Ready: 'ANY' },
    candidateFilterConfirmed: false,
    candidateGroup: 'ALL',
    sort: 'COMMERCIAL_PRIORITY',
    density: 'EXPANDED',
    activeTab: 'OVERVIEW',
    candidateFocus: false,
    mobilePane: 'queue',
    dateWindow: { field: 'FIRST_SEEN_AT', preset: 'ANY', from: null, to: null },
    visibleFields: {
      vacancies: ['CLIENT_STATUS', 'CHANNEL', 'EMPLOYER_RESOLUTION', 'LOCATION', 'LAST_VERIFIED', 'QA_STATE', 'CANDIDATE_COUNT'],
      candidates: ['CURRENT_EMPLOYER', 'CURRENT_TITLE', 'LOCATION', 'TARGET_TIER', 'REQUIREMENT_COVERAGE', 'EVIDENCE_STATUS', 'QA_STATUS', 'OPERATIONAL_STATUS', 'LAST_VERIFIED'],
    },
    queueScrollPosition: 0,
    candidateScrollPosition: 0,
  };

  const defaultOperations = {
    vacancies: {
      'vac-demo-041': { lifecycle_status: 'CANDIDATE_MAPPING', unread: true },
      'vac-demo-042': { lifecycle_status: 'VERIFYING', unread: true },
      'vac-demo-043': { lifecycle_status: 'CANDIDATE_MAPPING', unread: false },
      'vac-demo-044': { lifecycle_status: 'QUALIFIED', unread: false },
      'vac-demo-045': { lifecycle_status: 'MARKET_READY', unread: false },
      'vac-demo-046': { lifecycle_status: 'VERIFYING', unread: false },
      'vac-demo-038': { lifecycle_status: 'CLOSED', closed_reason: 'FILLED', closed_at: '2026-09-26T16:40:00Z', unread: false },
    },
    candidateAssignments: {
      'vac-demo-041:cand-demo-271': { operational_status: 'TOP_10' },
      'vac-demo-041:cand-demo-272': { operational_status: 'EARMARKED' },
      'vac-demo-041:cand-demo-273': { operational_status: 'RELEVANT' },
      'vac-demo-041:cand-demo-274': { operational_status: 'SURFACED' },
      'vac-demo-043:cand-demo-281': { operational_status: 'TOP_10' },
      'vac-demo-043:cand-demo-282': { operational_status: 'EARMARKED' },
      'vac-demo-044:cand-demo-291': { operational_status: 'TOP_10' },
      'vac-demo-044:cand-demo-292': { operational_status: 'RELEVANT' },
      'vac-demo-045:cand-demo-301': { operational_status: 'TOP_10' },
      'vac-demo-045:cand-demo-302': { operational_status: 'EARMARKED' },
    },
  };

  const systemSavedViews = [
    { id: 'system-new', name: 'What’s new', system: true, state: { vacancyView: 'NEW', sort: 'FIRST_SEEN_NEWEST' } },
    { id: 'system-agreed', name: 'Agreed clients · open', system: true, state: { vacancyView: 'AGREED_CLIENTS', sort: 'COMMERCIAL_PRIORITY' } },
    { id: 'system-research', name: 'Employer / QA research', system: true, state: { vacancyView: 'NEEDS_RESEARCH', sort: 'UNRESOLVED_OLDEST' } },
    { id: 'system-top10', name: 'Market ready', system: true, state: { vacancyView: 'INBOX', filters: { client: 'ANY', channel: 'ANY', employer: 'ANY', qa: 'PASS', region: 'ANY', freshness: 'ANY', unread: false, top10Ready: 'READY' }, sort: 'CANDIDATE_COUNT' } },
  ];

  const tabs = [
    ['OVERVIEW', 'Overview'], ['REQUIREMENTS', 'Requirements'], ['SOURCES', 'Sources'], ['EMPLOYER', 'Employer'], ['STAKEHOLDERS', 'Stakeholders'], ['CANDIDATE_MAP', 'Candidate map'], ['SEARCH_LOG', 'Search log'], ['QA', 'QA'], ['HISTORY', 'History'],
  ];
  const groups = [
    ['ALL', 'All mapped'], ['RESEARCH_TOP_10', 'Research Top 10'], ['STRONGEST', 'Strong set'], ['UNREVIEWED', 'Unreviewed'], ['EXCLUDED', 'Excluded'],
  ];
  const statusLabels = {
    CONFIRMED: 'Confirmed', PROBABLE: 'Probable', HYPOTHESIS: 'Hypothesis', UNKNOWN: 'Unknown',
    PASS: 'Passed', PASS_WITH_UNKNOWNS: 'Passed · unknowns', FAIL_RESEARCH_REQUIRED: 'Research required',
    NOT_REVIEWED: 'Not reviewed', IN_PROGRESS: 'In progress', NOT_STARTED: 'Not started',
  };
  const statusClasses = { CONFIRMED: 'confirmed', PROBABLE: 'probable', HYPOTHESIS: 'hypothesis', UNKNOWN: 'unknown' };
  const viewLabels = {
    INBOX: 'All active vacancies', NEW: 'Recently surfaced', AGREED_CLIENTS: 'Current agreed-client roles', AGENCIES: 'Agency-sourced roles', LINKEDIN: 'LinkedIn hiring signals', JOB_BOARDS: 'Job boards and ATS', NEEDS_RESEARCH: 'Evidence or QA needs action', CLOSED_ARCHIVED: 'Closed roles · intelligence retained',
  };
  const channelView = { AGREED_CLIENTS: 'AGREED_CLIENTS', AGENCIES: 'AGENCY_SITES', LINKEDIN: 'LINKEDIN', JOB_BOARDS: 'JOB_BOARDS' };
  const view = loadObject(STORAGE.view, defaultView);
  const operations = loadObject(STORAGE.operations, defaultOperations);
  let savedViews = loadArray(STORAGE.savedViews, []);
  let demoLog = loadArray(STORAGE.demoLog, []);
  let pendingCloseId = null;
  let pendingExclude = null;
  let toastTimer = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const dialog = (id) => document.getElementById(id);
  const selectedOpportunity = () => opportunities.find((item) => item.id === view.selectedVacancyId) || opportunities[0];
  const operationFor = (id) => operations.vacancies[id] || {};
  const assignmentKey = (vacancyId, candidateId) => `${vacancyId}:${candidateId}`;
  const assignmentFor = (vacancyId, candidateId) => operations.candidateAssignments[assignmentKey(vacancyId, candidateId)] || { operational_status: 'SURFACED' };
  dialog('close-vacancy-dialog').addEventListener('close', () => { pendingCloseId = null; });
  dialog('exclude-candidate-dialog').addEventListener('close', () => { pendingExclude = null; });
  function focusSelectedQueue() {
    const target = $$('#vacancy-list [data-vacancy-id]').find((node) => node.dataset.vacancyId === view.selectedVacancyId) || $('#vacancy-list [data-vacancy-id]');
    (target || $('#vacancy-search'))?.focus({ preventScroll: true });
  }
  function focusDetailRegion() { $('#detail-content')?.focus({ preventScroll: true }); }
  function focusCandidateName(candidateId) {
    const target = $$('#candidate-list .candidate-name').find((node) => node.dataset.candidateId === candidateId);
    (target || $('#candidate-search'))?.focus({ preventScroll: true });
  }
  function focusWorkspaceAfterRender() {
    if (window.matchMedia('(max-width: 720px)').matches) {
      if (view.mobilePane === 'detail') focusDetailRegion();
      else if (view.mobilePane === 'candidates') $('#candidate-search')?.focus({ preventScroll: true });
      else focusSelectedQueue();
      return;
    }
    focusSelectedQueue();
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function loadObject(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' && !Array.isArray(value) ? { ...clone(fallback), ...value } : clone(fallback);
    } catch { return clone(fallback); }
  }
  function loadArray(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return Array.isArray(value) ? value : clone(fallback);
    } catch { return clone(fallback); }
  }
  function persist(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { showToast('Browser storage is unavailable. This preview action will not persist.'); }
  }
  function persistView() { persist(STORAGE.view, view); }
  function persistOperations() { persist(STORAGE.operations, operations); }
  function persistSavedViews() { persist(STORAGE.savedViews, savedViews); }
  function persistDemoLog() { persist(STORAGE.demoLog, demoLog); }
  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function formatStatus(value) { return statusLabels[value] || String(value || 'Unknown').replaceAll('_', ' ').toLowerCase(); }
  function matchesQuery(text, query) {
    const haystack = String(text || '').toLocaleLowerCase();
    const terms = String(query || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return terms.every((term) => haystack.includes(term));
  }
  function statusBadge(status, label = null) {
    const key = statusClasses[status] || (status === 'PASS' ? 'qa-passed' : status === 'PASS_WITH_UNKNOWNS' || status === 'PROBABLE' ? 'qa-review' : status === 'FAIL_RESEARCH_REQUIRED' ? 'qa-bad' : 'status-neutral');
    return `<span class="status-badge ${key}">${escapeHtml(label || formatStatus(status))}</span>`;
  }
  function clientBadge(status) {
    const label = {
      AGREED_CLIENT: 'Agreed client', AGREED_GROUP_ENTITY: 'Agreed group entity', PAST_CLIENT: 'Past client', TARGET_PROSPECT: 'Target prospect', UNKNOWN: 'Client unknown',
    }[status] || 'Unknown';
    const extra = status === 'TARGET_PROSPECT' ? ' prospect' : status === 'PAST_CLIENT' ? ' past' : '';
    return `<span class="micro-badge client-badge${extra}">${escapeHtml(label)}</span>`;
  }
  function qaBadge(status) {
    const cls = status === 'PASS' ? 'qa-good' : status === 'PASS_WITH_UNKNOWNS' ? 'qa-warn' : status === 'FAIL_RESEARCH_REQUIRED' ? 'qa-bad' : 'qa-neutral';
    const label = status === 'PASS' ? 'QA passed' : status === 'PASS_WITH_UNKNOWNS' ? 'QA · unknowns' : status === 'FAIL_RESEARCH_REQUIRED' ? 'Research needed' : 'QA pending';
    return `<span class="micro-badge ${cls}">${escapeHtml(label)}</span>`;
  }
  function channelLabel(channel) {
    return { AGREED_CLIENTS: 'Agreed clients', AGENCY_SITES: 'Agency sites', LINKEDIN: 'LinkedIn', JOB_BOARDS: 'Job boards / ATS' }[channel] || channel;
  }
  function lifecycleLabel(status) {
    return { DISCOVERED: 'Discovered', VERIFYING: 'Verifying', QUALIFIED: 'Qualified', EMPLOYER_RESOLVED: 'Employer resolved', CANDIDATE_MAPPING: 'Candidate mapping', MARKET_READY: 'Market ready', CLIENT_ACTION: 'Client action', CLOSED: 'Closed' }[status] || formatStatus(status);
  }
  function visibleOpportunities() {
    const q = (view.vacancySearch || '').trim().toLocaleLowerCase();
    const f = view.filters || defaultView.filters;
    const list = opportunities.filter((item) => {
      const isClosed = operationFor(item.id).lifecycle_status === 'CLOSED';
      const viewOk = view.vacancyView === 'CLOSED_ARCHIVED' ? isClosed : !isClosed;
      if (!viewOk) return false;
      if (view.vacancyView === 'NEW' && !item.new) return false;
      if (view.vacancyView === 'AGREED_CLIENTS' && !['AGREED_CLIENT', 'AGREED_GROUP_ENTITY'].includes(item.clientStatus)) return false;
      if (view.vacancyView === 'AGENCIES' && item.channel !== 'AGENCY_SITES') return false;
      if (view.vacancyView === 'LINKEDIN' && item.channel !== 'LINKEDIN') return false;
      if (view.vacancyView === 'JOB_BOARDS' && item.channel !== 'JOB_BOARDS') return false;
      if (view.vacancyView === 'NEEDS_RESEARCH' && !(item.researchRequired || ['FAIL_RESEARCH_REQUIRED', 'NOT_REVIEWED'].includes(item.qaState) || item.employerStatus === 'UNKNOWN')) return false;
      if (f.client !== 'ANY' && item.clientStatus !== f.client) return false;
      if (f.channel !== 'ANY' && item.channel !== f.channel) return false;
      if (f.employer !== 'ANY' && item.employerStatus !== f.employer) return false;
      if (f.qa !== 'ANY' && item.qaState !== f.qa) return false;
      if (f.region !== 'ANY' && item.region !== f.region && !(f.region === 'Other' && !['Western Cape', 'Gauteng', 'KwaZulu-Natal'].includes(item.region))) return false;
      if (f.unread && !operationFor(item.id).unread) return false;
      if (f.top10Ready === 'READY' && item.top10Count < 10) return false;
      if (f.top10Ready === 'IN_PROGRESS' && (!item.candidateCount || item.top10Count >= 10)) return false;
      if (f.top10Ready === 'NOT_STARTED' && item.candidateCount > 0) return false;
      if (f.freshness === 'TODAY' && !item.firstSeen.startsWith('Today')) return false;
      if (f.freshness === 'LAST_7_DAYS' && item.lastVerifiedMinutes > 10080) return false;
      if (f.freshness === 'LAST_30_DAYS' && item.lastVerifiedMinutes > 43200) return false;
      if (q && !matchesQuery([item.role, item.employer, item.location, item.ref, item.channelLabel, item.clientStatus, ...item.requirements.map((r) => `${r.name} ${r.value}`), ...item.sources.map((source) => `${source.name} ${source.type} ${source.ref} ${source.detail}`), ...item.stakeholders.map((person) => `${person.name} ${person.title} ${person.relevance}`)].join(' '), q)) return false;
      return true;
    });
    if (view.sort === 'FIRST_SEEN_NEWEST') return list.sort((a, b) => Number(b.new) - Number(a.new) || a.priority - b.priority);
    if (view.sort === 'UNRESOLVED_OLDEST') return list.sort((a, b) => Number(b.researchRequired) - Number(a.researchRequired) || b.lastVerifiedMinutes - a.lastVerifiedMinutes);
    if (view.sort === 'LAST_VERIFIED') return list.sort((a, b) => a.lastVerifiedMinutes - b.lastVerifiedMinutes);
    if (view.sort === 'CANDIDATE_COUNT') return list.sort((a, b) => b.candidateCount - a.candidateCount);
    return list.sort((a, b) => a.priority - b.priority);
  }

  function renderQueue() {
    const records = visibleOpportunities();
    const list = $('#vacancy-list');
    const savedScrollPosition = view.queueScrollPosition || list.scrollTop || 0;
    $('#queue-total').textContent = String(records.length).padStart(2, '0');
    $('#queue-view-label').textContent = viewLabels[view.vacancyView] || 'Current view';
    $('#queue-sort-label').textContent = view.sort === 'COMMERCIAL_PRIORITY' ? 'Priority order' : view.sort.replaceAll('_', ' ').toLowerCase();
    const selectedStillVisible = records.some((item) => item.id === view.selectedVacancyId);
    if (!selectedStillVisible && records.length) {
      view.selectedVacancyId = records[0].id;
      view.activeTab = 'OVERVIEW';
      persistView();
    }
    if (!records.length) {
      list.innerHTML = `<div class="empty-state"><span class="empty-state-mark" aria-hidden="true">${searchIcon()}</span><strong>No vacancies in this view</strong><p>Try a broader search, remove one filter, or choose another saved view.</p><button class="text-button" type="button" data-action="clear-all-filters">Clear filters and search</button></div>`;
      return;
    }
    list.innerHTML = records.map((item) => {
      const op = operationFor(item.id);
      const selected = item.id === view.selectedVacancyId;
      const density = view.density === 'MINIMAL' ? 'is-minimal' : view.density === 'COMPACT' ? 'is-compact' : '';
      const unread = op.unread ? 'is-unread' : '';
      const compactStatus = view.density === 'COMPACT' ? qaBadge(item.qaState) : '';
      const signals = view.density === 'MINIMAL' ? '' : `<div class="vacancy-signals"><span class="vacancy-signal"><span class="source-dot"></span>${item.sourceCount} source records</span><span class="vacancy-signal">${item.candidateCount ? `${item.candidateCount} mapped` : 'Map not started'}</span>${item.candidateCount ? `<span class="vacancy-signal">${item.top10Count} research Top 10</span>` : ''}<span class="vacancy-signal">Verified ${escapeHtml(item.lastVerified)}</span></div>`;
      const badges = view.density === 'MINIMAL' ? '' : `<div class="vacancy-badges">${clientBadge(item.clientStatus)}${view.density === 'COMPACT' ? `<span class="compact-status">${compactStatus}</span>` : `<span class="${item.researchRequired ? 'needs-action' : ''}">${item.researchRequired ? 'Action needed' : qaBadge(item.qaState)}</span>`}</div>`;
      return `<button class="vacancy-card ${density} ${unread} ${selected ? 'is-selected' : ''}" type="button" data-vacancy-id="${escapeHtml(item.id)}" aria-current="${selected ? 'true' : 'false'}" aria-label="${escapeHtml(item.role)}, ${escapeHtml(item.employer)}, ${escapeHtml(item.location)}${selected ? ', selected' : ''}">
        <span class="vacancy-topline"><span class="vacancy-role">${escapeHtml(item.role)}</span>${view.density === 'COMPACT' ? `<span class="vacancy-company">${escapeHtml(item.employer)}</span>` : ''}</span>
        ${view.density !== 'COMPACT' && view.density !== 'MINIMAL' ? `<span class="vacancy-company">${escapeHtml(item.employer)}</span><span class="vacancy-location">${escapeHtml(item.location)}</span>` : ''}
        ${signals}${badges}
      </button>`;
    }).join('');
    list.scrollTop = savedScrollPosition;
  }

  function summaryTile(icon, count, label) {
    return `<div class="summary-tile"><span class="tile-icon" aria-hidden="true">${icon}</span><span class="tile-copy"><strong>${escapeHtml(count)}</strong><span>${escapeHtml(label)}</span></span></div>`;
  }
  function evidenceTable(rows, withSource = true) {
    return `<table class="evidence-table"><thead><tr><th scope="col">Evidence field</th><th scope="col">Observed / interpreted value</th><th class="status-cell" scope="col">Evidence status</th>${withSource ? '<th class="source-cell" scope="col">Basis</th>' : ''}</tr></thead><tbody>${rows.map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.value)}</td><td class="status-cell"><span class="claim-status ${escapeHtml((r.status || '').toLowerCase())}">${escapeHtml(formatStatus(r.status))}</span></td>${withSource ? `<td class="source-cell">${escapeHtml(r.source)}</td>` : ''}</tr>`).join('')}</tbody></table>`;
  }
  function renderSearchLog(item) {
    const demoRows = demoLog.filter((entry) => entry.vacancy_id === item.id);
    const existingRows = item.searchLog.map((entry) => `<tr><td>${escapeHtml(entry.family)}<br /><span class="table-subtext">${escapeHtml(entry.reason)}</span></td><td>${escapeHtml(entry.source)}<br /><span class="table-state">${escapeHtml(entry.status)}</span></td><td>${escapeHtml(entry.yield)}</td></tr>`);
    const previewRows = demoRows.map((entry) => `<tr><td>Preview action<br /><span class="table-subtext">${escapeHtml(entry.action)}</span></td><td>Local preview<br /><span class="table-state table-state-warning">NOT_EXECUTED</span></td><td>Not run</td></tr>`);
    const rows = [...existingRows, ...previewRows];
    return rows.length ? `<div class="section-head"><h3>Research activity</h3><p>UI filters are not research events</p></div><table class="search-log-table"><thead><tr><th>Search family / reason</th><th>Source / execution</th><th>Observed yield</th></tr></thead><tbody>${rows.join('')}</tbody></table><div class="detail-notice"><span class="notice-symbol">i</span><span>Each production query records its source, reason, execution status and yield. Preview actions are marked NOT_EXECUTED. Typing into a filter never writes to this log.</span></div>` : `<div class="empty-state"><span class="empty-state-mark">${searchIcon()}</span><strong>No executed searches recorded</strong><p>Research only appears here after an explicit action. Normal filtering never starts a search.</p></div>`;
  }
  function renderDetailTab(item, tab) {
    if (tab === 'REQUIREMENTS') return `<div class="section-head"><h3>Role requirements and operating context</h3><p>CONFIRMED ≠ inferred</p></div>${evidenceTable(item.requirements)}<div class="detail-notice"><span class="notice-symbol">i</span><span>A probable or unknown field stays visibly distinct. Employer characteristics do not become candidate-level claims.</span></div>`;
    if (tab === 'SOURCES') return `<div class="section-head"><h3>Source lineage</h3><p>${item.sourceCount} appearances · 1 canonical vacancy</p></div><ul class="evidence-source-list">${item.sources.map((source, i) => `<li class="source-row"><span class="source-index">${String(i + 1).padStart(2, '0')}</span><div class="source-copy"><strong>${escapeHtml(source.name)} <span class="source-ref">${escapeHtml(source.ref)}</span></strong><p>${escapeHtml(source.type)} · ${escapeHtml(source.detail)}</p></div>${statusBadge(source.status)}</li>`).join('')}</ul><div class="detail-notice"><span class="notice-symbol">i</span><span>Multiple source appearances are preserved under one canonical vacancy. The channel that surfaced the opportunity remains unchanged.</span></div>`;
    if (tab === 'EMPLOYER') return `<div class="section-head"><h3>Employer attribution</h3><p>Evidence-led resolution</p></div><div class="two-column-info"><article class="info-block"><h3>Current resolution</h3><div class="info-status">${statusBadge(item.employerStatus, `Employer ${formatStatus(item.employerStatus).toLowerCase()}`)}</div><p>${escapeHtml(item.employer)} is shown at the confidence supported by the current sample evidence. The interface does not invent numeric probabilities.</p></article><article class="info-block"><h3>Open attribution work</h3><p>${item.employerStatus === 'CONFIRMED' ? 'Check that the employing business unit and agreement scope remain current.' : 'Resolve the operating entity, test competing employer hypotheses and retain contradictions.'}</p><div class="info-divider"></div><button class="inline-action" type="button" data-action="research-employer">Research employer ${arrowIcon()}</button></article></div><div class="section-head section-head-spaced"><h3>Attribution evidence</h3><p>Source-backed</p></div><ul class="evidence-source-list">${item.sources.map((source) => `<li class="source-row"><span class="source-index">${source.status === 'CONFIRMED' ? '✓' : '?'}</span><div class="source-copy"><strong>${escapeHtml(source.name)}</strong><p>${escapeHtml(source.detail)}</p></div>${statusBadge(source.status)}</li>`).join('')}</ul>`;
    if (tab === 'STAKEHOLDERS') return item.stakeholders.length ? `<div class="section-head"><h3>Vacancy-relevant stakeholder routes</h3><p>Current employment status shown separately</p></div>${item.stakeholders.map((person) => `<div class="person-row"><span class="person-monogram">${escapeHtml(person.initials)}</span><div class="person-copy"><strong>${escapeHtml(person.name)} · ${escapeHtml(person.title)}</strong><span>${escapeHtml(person.relevance)} · ${escapeHtml(person.status.replaceAll('_', ' ').toLowerCase())}</span></div>${statusBadge(person.status === 'CURRENT_VERIFIED' ? 'CONFIRMED' : 'PROBABLE', person.status === 'CURRENT_VERIFIED' ? 'Current verified' : 'Current probable')}</div>`).join('')}<div class="detail-notice"><span class="notice-symbol">i</span><span>Stakeholder identities and contact data require private-run handling. No live contact information is included in this sample.</span></div>` : `<div class="empty-state"><span class="empty-state-mark">${personIcon()}</span><strong>No stakeholder record yet</strong><p>Stakeholder research is downstream enrichment and stays gated on role and employer resolution.</p><button class="inline-action" type="button" data-action="research-employer">Review activation gate ${arrowIcon()}</button></div>`;
    if (tab === 'CANDIDATE_MAP') return `<div class="section-head"><h3>Candidate-market coverage</h3><p>Candidate research is not a fifth channel</p></div><div class="detail-summary-strip">${summaryTile(peopleIcon(), item.credibleCount, 'credible longlist · sample')}${summaryTile(networkIcon(), item.strongestCount, 'strong market set · sample')}${summaryTile(starIcon(), item.top10Count, 'research Top 10 · sample')}</div><div class="two-column-info"><article class="info-block"><h3>Research depth</h3><p>${item.candidateCount ? `${item.credibleCount} credible candidate records are shown in this illustration.` : 'No candidate map is shown because the vacancy has not passed the employer/role activation gate.'}</p><div class="info-divider"></div><p>The 50-person depth target is not a quota. A smaller evidence-backed market is better than padding the list.</p></article><article class="info-block"><h3>Candidate recommendation vs recruiter action</h3><p>Research Top 10 is the evidence-reviewed market recommendation. Recruiter Top 10 is a separate operational status. Updating one must not rewrite the other.</p></article></div><button class="inline-action" type="button" data-action="open-candidates">Open candidate market ${arrowIcon()}</button>`;
    if (tab === 'SEARCH_LOG') return renderSearchLog(item);
    if (tab === 'QA') return `<div class="section-head"><h3>Independent review gates</h3><p>Challenges, unknowns and next actions</p></div><div class="qa-gate-list">${item.qaGates.map((gate) => `<div class="qa-gate-row"><span class="qa-gate-code">${escapeHtml(gate.gate)}</span><div class="qa-gate-copy"><strong>${escapeHtml(gate.label)}</strong><span>${escapeHtml(gate.note)}</span></div>${statusBadge(gate.state)}</div>`).join('')}</div><div class="detail-notice"><span class="notice-symbol">i</span><span>Reviewers attempt to disprove unsupported claims. Material unknowns are retained rather than filled by the interface.</span></div>`;
    if (tab === 'HISTORY') return `<div class="section-head"><h3>Opportunity chronology</h3><p>Research events · sample timeline</p></div><ol class="timeline">${item.timeline.map((event) => `<li class="timeline-item"><span class="timeline-node ${event.kind === 'warn' ? 'warn' : ''}"></span><div class="timeline-copy"><strong>${escapeHtml(event.title)}</strong><p>${escapeHtml(event.text)}</p></div><time class="timeline-time">${escapeHtml(event.time)}</time></li>`).join('')}</ol><div class="detail-notice"><span class="notice-symbol">i</span><span>Production history must combine source, run, QA and recruiter-action events. This static preview uses illustrative chronology.</span></div>`;

    const requirementRows = item.requirements.slice(0, 5);
    return `<div class="detail-summary-strip">${summaryTile(sourceIcon(), item.sourceCount, 'source records')}${summaryTile(checkIcon(), `${item.qaGates.filter((g) => ['PASS', 'PASS_WITH_UNKNOWNS'].includes(g.state)).length}/4`, 'independent QA gates')}${summaryTile(peopleIcon(), item.candidateCount, item.candidateCount ? 'mapped people · sample' : 'candidate map not started')}</div>
      <div class="section-head"><h3>Evidence-aware role fingerprint</h3><p>Claim-level confidence</p></div>
      ${evidenceTable(requirementRows)}
      <div class="unknown-callout"><span class="unknown-icon">?</span><div class="unknown-copy"><strong>Unknowns stay unknown</strong><p>${item.requirements.filter((r) => r.status === 'UNKNOWN').map((r) => r.name).join(', ') || 'Salary, notice period and availability are not inferred from title or employer context.'} · ${item.salaryGate === 'VERIFY' ? 'Salary gate still needs verification.' : 'Current role facts retain their source.'}</p></div></div>
      <div class="section-head section-head-spaced"><h3>Source trail</h3><p>${item.sourceCount} appearances · one vacancy</p></div>
      <ol class="timeline">${item.timeline.slice(0, 2).map((event) => `<li class="timeline-item"><span class="timeline-node ${event.kind === 'warn' ? 'warn' : ''}"></span><div class="timeline-copy"><strong>${escapeHtml(event.title)}</strong><p>${escapeHtml(event.text)}</p></div><time class="timeline-time">${escapeHtml(event.time)}</time></li>`).join('')}</ol>
      <div class="next-actions"><button class="inline-action" type="button" data-tab-link="SOURCES">Review source lineage ${arrowIcon()}</button><button class="inline-action" type="button" data-tab-link="QA">Open independent QA ${arrowIcon()}</button></div>`;
  }

  function renderCandidateCoverage(item) {
    const count = item.credibleCount;
    const targetText = count >= 50 ? '50+ depth reached' : `${50 - count} below research target`;
    const shown = item.candidates.length;
    $('#candidate-coverage').innerHTML = `<div class="coverage-strip"><div class="coverage-primary"><strong>${count}</strong><span>credible profiles · sample</span></div><div class="coverage-target"><strong>${count} / 50</strong><span>${targetText}</span></div></div><div class="coverage-note">${infoIcon()} 50 is a research-depth target, never a quota. ${shown} illustrative profile${shown === 1 ? '' : 's'} are seeded for this preview.</div>`;
  }
  function visibleCandidates(item) {
    const q = (view.candidateSearch || '').trim().toLocaleLowerCase();
    return item.candidates.filter((candidate) => {
      const assignment = assignmentFor(item.id, candidate.candidate_id);
      const state = assignment.operational_status;
      if (view.candidateGroup === 'RESEARCH_TOP_10' && !candidate.researchTop10) return false;
      if (view.candidateGroup === 'STRONGEST' && !candidate.strongest) return false;
      if (view.candidateGroup === 'UNREVIEWED' && !['NOT_REVIEWED', 'NOT_STARTED'].includes(candidate.qa)) return false;
      if (view.candidateGroup === 'EXCLUDED' && state !== 'EXCLUDED') return false;
      if (view.candidateFilterConfirmed && !candidate.claims.some((claim) => claim.status === 'CONFIRMED')) return false;
      const searchable = [candidate.name, candidate.title, candidate.employer, candidate.location, candidate.tier, candidate.reason, ...candidate.claims.map((claim) => `${claim.name} ${claim.status} ${claim.basis} ${claim.source}`)].join(' ').toLocaleLowerCase();
      return !q || matchesQuery(searchable, q);
    });
  }
  function candidateCounts(item) {
    const counts = { ALL: item.candidates.length, RESEARCH_TOP_10: item.candidates.filter((c) => c.researchTop10).length, STRONGEST: item.candidates.filter((c) => c.strongest).length, UNREVIEWED: item.candidates.filter((c) => ['NOT_REVIEWED', 'NOT_STARTED'].includes(c.qa)).length, EXCLUDED: item.candidates.filter((c) => assignmentFor(item.id, c.candidate_id).operational_status === 'EXCLUDED').length };
    return counts;
  }
  function workflowLabel(status) {
    return { SURFACED: 'Surfaced', RELEVANT: 'Relevant', EARMARKED: 'Earmarked', TOP_10: 'Recruiter Top 10', APPROACH: 'Approach', ENGAGED: 'Engaged', SUBMITTED: 'Submitted', EXCLUDED: 'Excluded' }[status] || 'Surfaced';
  }
  function workflowClass(status) { return status === 'TOP_10' ? 'top-10' : status === 'EARMARKED' ? 'earmarked' : ['APPROACH', 'ENGAGED', 'SUBMITTED'].includes(status) ? 'approach' : status === 'EXCLUDED' ? 'excluded' : ''; }
  function renderCandidateCard(candidate, item) {
    const op = assignmentFor(item.id, candidate.candidate_id);
    const workflow = op.operational_status;
    const workflowPosition = ['SURFACED', 'RELEVANT', 'EARMARKED', 'TOP_10', 'APPROACH', 'ENGAGED', 'SUBMITTED'].indexOf(workflow);
    const earmarked = workflowPosition >= 2;
    const recruiterTop10 = workflowPosition >= 3;
    const approachStarted = workflowPosition >= 4;
    const excluded = workflow === 'EXCLUDED';
    const previewClaims = candidate.claims.slice(0, 3).map((claim) => `<span class="claim-chip ${claim.status === 'PROBABLE' ? 'probable' : claim.status === 'UNKNOWN' ? 'unknown' : ''}">${escapeHtml(claim.name)} · ${escapeHtml(formatStatus(claim.status))}</span>`).join('');
    const recommendation = candidate.researchTop10 ? `<span class="candidate-rank">#${candidate.marketRank} · RESEARCH TOP 10</span>` : `<span class="candidate-rank">#${candidate.marketRank} · ${escapeHtml(candidate.tier)} TIER</span>`;
    return `<article class="candidate-card ${excluded ? 'is-excluded' : ''}" role="listitem" data-candidate-id="${escapeHtml(candidate.candidate_id)}">
      <div class="candidate-card-top">
        <span class="candidate-avatar" aria-hidden="true">${escapeHtml(candidate.initials)}</span>
        <div class="candidate-identity"><div class="candidate-name-line"><button class="candidate-name" type="button" data-action="evidence" data-candidate-id="${escapeHtml(candidate.candidate_id)}">${escapeHtml(candidate.name)}</button>${recommendation}</div><span class="candidate-meta">${escapeHtml(candidate.title)} · ${escapeHtml(candidate.employer)} · ${escapeHtml(candidate.location)}</span></div>
        <span class="candidate-tier">Tier ${escapeHtml(candidate.tier)}</span>
      </div>
      <div class="candidate-claims">${previewClaims}</div>
      <div class="candidate-workflow-line"><span class="workflow-badge ${workflowClass(workflow)}">Recruiter · ${escapeHtml(workflowLabel(workflow))}</span><span class="demo-person-tag">Illustrative profile</span></div>
      <div class="candidate-actions">
        <button class="candidate-action ${earmarked ? 'is-done' : ''}" type="button" data-action="earmark" data-candidate-id="${escapeHtml(candidate.candidate_id)}" aria-pressed="${earmarked}" ${excluded ? 'disabled title="Restore this candidate before changing workflow status."' : workflowPosition > 2 ? 'disabled title="This candidate has progressed beyond Earmarked; the workflow will not be rolled backward."' : 'title="Mark or unmark as Earmarked"'}>${bookmarkIcon()}${earmarked ? 'Earmarked' : 'Earmark'}</button>
        <button class="candidate-action ${recruiterTop10 ? 'is-done' : ''}" type="button" data-action="top10" data-candidate-id="${escapeHtml(candidate.candidate_id)}" aria-pressed="${recruiterTop10}" ${excluded ? 'disabled title="Restore this candidate before changing workflow status."' : workflowPosition > 3 ? 'disabled title="This candidate has progressed beyond Recruiter Top 10; the workflow will not be rolled backward."' : 'title="Recruiter workflow only; does not alter the research-recommended Top 10"'}>${starIcon()}${recruiterTop10 ? 'Recruiter Top 10' : 'Add to Top 10'}</button>
        <details class="candidate-action-menu"><summary aria-label="More actions for ${escapeHtml(candidate.name)}">···</summary><div class="candidate-action-menu-popover">${excluded ? `<button type="button" disabled>Excluded from this vacancy</button>` : approachStarted ? `<button type="button" disabled aria-pressed="true">Approach started</button>` : `<button type="button" data-action="approach" data-candidate-id="${escapeHtml(candidate.candidate_id)}">Mark for approach</button>`}<button type="button" data-action="evidence" data-candidate-id="${escapeHtml(candidate.candidate_id)}">Open evidence</button>${excluded ? `<button type="button" data-action="restore-candidate" data-candidate-id="${escapeHtml(candidate.candidate_id)}">Restore to relevant</button>` : `<button class="danger-option" type="button" data-action="exclude" data-candidate-id="${escapeHtml(candidate.candidate_id)}">Exclude from this vacancy</button>`}</div></details>
      </div>
    </article>`;
  }
  function renderCandidatePanel() {
    const item = selectedOpportunity();
    const savedScrollPosition = view.candidateScrollPosition || $('#candidate-list')?.scrollTop || 0;
    const counts = candidateCounts(item);
    renderCandidateCoverage(item);
    $('#candidate-total').textContent = String(item.candidateCount);
    $('#candidate-toolbar-count').textContent = String(item.candidateCount);
    $('#candidate-sample-note').textContent = item.candidates.length
      ? `Showing ${item.candidates.length} synthetic preview records from ${item.candidateCount} mapped profiles`
      : item.candidateCount ? `No sample profiles loaded from ${item.candidateCount} mapped profiles` : 'No mapped profiles in this sample role';
    $('#candidate-groups').innerHTML = groups.map(([id, label]) => `<button class="group-tab ${view.candidateGroup === id ? 'is-active' : ''}" type="button" data-group="${id}" aria-pressed="${view.candidateGroup === id}">${label}<span class="group-count">${counts[id]}</span></button>`).join('');
    const filterBanner = $('#candidate-filter-banner');
    if (view.candidateFilterConfirmed) {
      filterBanner.hidden = false;
      filterBanner.innerHTML = `<span>Evidence filter · at least one individually confirmed claim</span><button type="button" data-action="clear-candidate-evidence-filter">Clear</button>`;
    } else {
      filterBanner.hidden = true;
      filterBanner.innerHTML = '';
    }
    const records = visibleCandidates(item);
    $('#candidate-list').innerHTML = records.length
      ? records.map((candidate) => renderCandidateCard(candidate, item)).join('')
      : `<div class="empty-state candidate-empty"><span class="empty-state-mark" aria-hidden="true">${peopleIcon()}</span><strong>${item.candidates.length ? 'No mapped candidates match' : 'Candidate map not started'}</strong><p>${item.candidates.length ? 'Clear a candidate filter or change the market grouping. Stored candidates only are searched.' : 'This sample role has no mapped candidates. In production, mapping only starts after the opportunity activation gates.'}</p>${item.candidates.length ? '<button class="text-button" type="button" data-action="clear-candidate-search">Clear candidate filters</button>' : ''}</div>`;
    $('#candidate-list').scrollTop = savedScrollPosition;
    $('#candidate-filter-toggle').setAttribute('aria-pressed', String(view.candidateFilterConfirmed));
    $('#candidate-filter-toggle').setAttribute('aria-label', view.candidateFilterConfirmed ? 'Clear individually confirmed evidence filter' : 'Show candidates with individually confirmed evidence');
    $('#candidate-filter-toggle').title = view.candidateFilterConfirmed ? 'Clear confirmed-evidence filter' : 'Filter to confirmed candidate-level evidence';
    $('#candidate-focus').setAttribute('aria-pressed', String(view.candidateFocus));
    $('#candidate-focus').setAttribute('aria-label', view.candidateFocus ? 'Exit candidate focus mode' : 'Expand candidate focus mode');
    $('#candidate-focus').title = view.candidateFocus ? 'Exit candidate focus' : 'Expand candidate workspace';
    $('#candidate-pane').classList.toggle('is-drawer-open', Boolean(view.candidateDrawerOpen));
    $('#drawer-scrim').hidden = !view.candidateDrawerOpen;
    $('#workbench').classList.toggle('candidate-focus', Boolean(view.candidateFocus));
    $('#workbench').dataset.mobilePane = view.mobilePane || 'queue';
    $$('.mobile-pane-button').forEach((button) => {
      const active = button.dataset.mobilePane === view.mobilePane;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('.density-switch button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.density === view.density)));
  }
  function renderActiveFilterChips() {
    const f = view.filters || defaultView.filters;
    const filterLabels = [
      ['client', 'Client', { AGREED_CLIENT: 'Agreed client', AGREED_GROUP_ENTITY: 'Agreed group entity', PAST_CLIENT: 'Past client', TARGET_PROSPECT: 'Target prospect', UNKNOWN: 'Client unknown' }],
      ['channel', 'Channel', { AGREED_CLIENTS: 'Agreed clients', AGENCY_SITES: 'Agency sites', LINKEDIN: 'LinkedIn', JOB_BOARDS: 'Job boards / ATS' }],
      ['employer', 'Employer', { CONFIRMED: 'Confirmed employer', PROBABLE: 'Probable employer', HYPOTHESIS: 'Employer hypothesis', UNKNOWN: 'Employer unknown' }],
      ['qa', 'QA', { PASS: 'QA passed', PASS_WITH_UNKNOWNS: 'QA passed · unknowns', FAIL_RESEARCH_REQUIRED: 'Research required', NOT_REVIEWED: 'QA not reviewed' }],
      ['region', 'Region', { 'Western Cape': 'Western Cape', Gauteng: 'Gauteng', 'KwaZulu-Natal': 'KwaZulu-Natal', Other: 'Other / national' }],
      ['freshness', 'Date', { TODAY: 'Seen today', LAST_7_DAYS: 'Last 7 days', LAST_30_DAYS: 'Last 30 days' }],
      ['top10Ready', 'Map', { READY: 'Research Market ready', IN_PROGRESS: 'Top 10 in progress', NOT_STARTED: 'Candidate map not started' }],
    ];
    const active = filterLabels.filter(([key]) => f[key] && f[key] !== 'ANY').map(([key, label, values]) => `<span class="filter-chip">${escapeHtml(values[f[key]] || label)}<button type="button" data-remove-filter="${key}" aria-label="Remove ${escapeHtml(label)} filter">×</button></span>`);
    if (f.unread) active.push('<span class="filter-chip">Unread only<button type="button" data-remove-filter="unread" aria-label="Remove unread filter">×</button></span>');
    $('#active-filter-chips').innerHTML = active.length ? active.join('') : `<span class="empty-filter-label">${view.vacancySearch ? `Searching “${escapeHtml(view.vacancySearch)}”` : 'All active roles'}</span>`;
    const count = Object.values(f).filter((value) => value && value !== 'ANY' && value !== false).length;
    $('#filter-count').textContent = String(count);
    $('#filter-count').hidden = count === 0;
  }
  function renderSavedViews() {
    const select = $('#saved-view-select');
    const current = view.savedViewId || '';
    const all = [...systemSavedViews, ...savedViews.map((saved) => ({ id: saved.saved_view_id, name: saved.name, system: false }))];
    select.innerHTML = `<option value="">Saved views</option>${all.map((saved) => `<option value="${escapeHtml(saved.id)}">${escapeHtml(saved.name)}${saved.system ? '' : ' · personal'}</option>`).join('')}`;
    if (all.some((saved) => saved.id === current)) select.value = current;
  }
  function renderSummary() {
    const active = opportunities.filter((item) => operationFor(item.id).lifecycle_status !== 'CLOSED');
    $('#active-count').textContent = String(active.length).padStart(2, '0');
    $('#research-count').textContent = String(active.filter((item) => item.researchRequired || ['FAIL_RESEARCH_REQUIRED', 'NOT_REVIEWED'].includes(item.qaState)).length).padStart(2, '0');
    $('#client-count').textContent = String(active.filter((item) => ['AGREED_CLIENT', 'AGREED_GROUP_ENTITY'].includes(item.clientStatus)).length).padStart(2, '0');
    const nav = $('.module-link[data-module="VACANCIES"] .nav-count');
    if (nav) nav.textContent = String(active.length).padStart(2, '0');
  }
  function renderAll() {
    renderSummary();
    renderQueue();
    renderActiveFilterChips();
    renderDetail();
    renderCandidatePanel();
    renderSavedViews();
    $('#vacancy-search').value = view.vacancySearch || '';
    $('#candidate-search').value = view.candidateSearch || '';
    $('#vacancy-view').value = view.vacancyView || 'INBOX';
    $('#sort-by').value = view.sort || 'COMMERCIAL_PRIORITY';
  }

  function bindDetailButtons(item) {
    $('#minimise-detail')?.addEventListener('click', () => {
      view.candidateFocus = !view.candidateFocus;
      view.savedViewId = '';
      view.mobilePane = view.candidateFocus ? 'candidates' : 'detail';
      view.candidateDrawerOpen = view.candidateFocus && window.matchMedia('(min-width: 721px) and (max-width: 1280px)').matches;
      persistView();
      renderAll();
      if (view.candidateFocus) $('#candidate-search').focus({ preventScroll: true });
      else focusDetailRegion();
    });
    $('#research-employer')?.addEventListener('click', () => openResearchDialog('employer'));
    $('#open-close-vacancy')?.addEventListener('click', () => {
      pendingCloseId = item.id;
      $('#close-vacancy-title').textContent = `Archive ${item.role}?`;
      $('#close-vacancy-description').textContent = 'The role will leave the active inbox. Its source records, candidate map, Top 10, search log and QA history remain intact.';
      $('#close-reason').value = '';
      $('#close-reason-detail').value = '';
      $('#close-reason-detail').hidden = true;
      $('.detail-label[for="close-reason-detail"]').hidden = true;
      dialog('close-vacancy-dialog').showModal();
    });
    $('#reopen-vacancy')?.addEventListener('click', () => {
      const before = clone(operationFor(item.id));
      operations.vacancies[item.id] = { ...before, lifecycle_status: 'CLIENT_ACTION', closed_reason: null, closed_reason_detail: null, closed_at: null, unread: false };
      persistOperations();
      view.vacancyView = 'INBOX';
      view.mobilePane = 'detail';
      view.activeTab = 'OVERVIEW';
      view.savedViewId = '';
      persistView();
      renderAll();
      focusWorkspaceAfterRender();
      showToast('Vacancy returned to the active inbox. Historical intelligence is unchanged.');
    });
    $$('.detail-tab').forEach((button) => button.addEventListener('click', () => {
      view.activeTab = button.dataset.tab;
      view.savedViewId = '';
      persistView();
      renderDetail();
      $('#detail-content')?.focus({ preventScroll: true });
    }));
    $$('[data-tab-link]').forEach((button) => button.addEventListener('click', () => {
      view.activeTab = button.dataset.tabLink;
      view.savedViewId = '';
      persistView();
      renderDetail();
      focusDetailRegion();
    }));
    $$('[data-action="research-employer"]').forEach((button) => button.addEventListener('click', () => openResearchDialog('employer')));
    $$('[data-action="open-candidates"]').forEach((button) => button.addEventListener('click', () => {
      view.mobilePane = 'candidates';
      view.candidateDrawerOpen = window.matchMedia('(min-width: 721px) and (max-width: 1280px)').matches;
      persistView();
      renderCandidatePanel();
      $('#candidate-search').focus({ preventScroll: true });
    }));
  }

  function renderDetail() {
    const item = selectedOpportunity();
    const op = operationFor(item.id);
    const scroll = $('#detail-content')?.scrollTop || 0;
    $('#selected-role-content').innerHTML = `
      <div class="detail-top">
        <div class="record-context">
          <div class="record-context-left"><span class="record-id">${escapeHtml(item.ref)}</span><span class="context-separator">/</span><span>Last verified ${escapeHtml(item.lastVerified)}</span></div>
          <div class="record-actions">
            <button class="icon-button quiet-button detail-minimise" id="minimise-detail" type="button" aria-pressed="${view.candidateFocus}" title="Toggle candidate focus" aria-label="${view.candidateFocus ? 'Restore vacancy detail pane' : 'Minimise vacancy detail pane'}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M4 6h7M4 14h9" /></svg></button>
            ${op.lifecycle_status === 'CLOSED' ? `<button class="secondary-button close-vacancy-button" id="reopen-vacancy" type="button">Reopen</button>` : `<button class="secondary-button research-employer-button" id="research-employer" type="button"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 15.5 8.2 11l2.7 2.2L16 7"/><circle cx="15.8" cy="6.6" r="1.1" /></svg>Research</button><button class="secondary-button close-vacancy-button" id="open-close-vacancy" type="button">Close role</button>`}
          </div>
        </div>
        <div class="detail-main-heading">
          <div>
            <h2 id="selected-role-title">${escapeHtml(item.role)}</h2>
            <div class="employer-line"><strong>${escapeHtml(item.employer)}</strong><span class="employer-resolution">Employer ${escapeHtml(formatStatus(item.employerStatus).toLowerCase())}</span></div>
          </div>
          <div class="title-actions">${clientBadge(item.clientStatus)}</div>
        </div>
        <div class="selected-role-tags">${statusBadge(item.roleConfidence, 'Role ' + formatStatus(item.roleConfidence).toLowerCase())}${qaBadge(item.qaState)}${op.lifecycle_status === 'CLOSED' ? `<span class="status-badge qa-neutral">Archived · ${escapeHtml(op.closed_reason || item.closedReason || 'Closed')}</span>` : ''}</div>
        <div class="role-metadata">
          <span>${pinIcon()}${escapeHtml(item.location)}</span>
          <span>${sourceIcon()}${escapeHtml(channelLabel(item.channel))}</span>
          <span>${calendarIcon()}First seen ${escapeHtml(item.firstSeen)}</span>
          <span><span class="lifecycle-text">${escapeHtml(lifecycleLabel(op.lifecycle_status || item.lifecycle))}</span></span>
          <span>${clockIcon()}Last seen ${escapeHtml(item.lastSeen)}</span>
        </div>
        <div class="detail-tabs" role="group" aria-label="Vacancy intelligence sections">${tabs.map(([id, label]) => `<button class="detail-tab ${view.activeTab === id ? 'is-active' : ''}" type="button" data-tab="${id}" aria-pressed="${view.activeTab === id}">${label}</button>`).join('')}</div>
      </div>
      <div class="detail-content" id="detail-content" role="region" tabindex="0" aria-label="${escapeHtml(tabs.find(([id]) => id === view.activeTab)?.[1] || 'Overview')} details">${renderDetailTab(item, view.activeTab)}</div>
    `;
    $('#detail-content').scrollTop = scroll;
    $('#candidate-role-context').textContent = item.role;
    $('#research-role-name').textContent = item.role;
    $('#candidate-total').textContent = String(item.candidateCount);
    bindDetailButtons(item);
  }

  function searchIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.7" cy="8.7" r="5.4"/><path d="m12.7 12.7 4 4"/></svg>'; }
  function pinIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17s5-5.2 5-9a5 5 0 1 0-10 0c0 3.8 5 9 5 9Z"/><circle cx="10" cy="8" r="1.7"/></svg>'; }
  function sourceIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5.5h12M4 10h12M4 14.5h7"/><circle cx="2.4" cy="5.5" r=".7" fill="currentColor"/><circle cx="2.4" cy="10" r=".7" fill="currentColor"/><circle cx="2.4" cy="14.5" r=".7" fill="currentColor"/></svg>'; }
  function calendarIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12" rx="1.8"/><path d="M6.5 3v3M13.5 3v3M3.5 8h13"/></svg>'; }
  function clockIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 5.8v4.5l3 1.8"/></svg>'; }
  function checkIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10.4 3.6 3.5L16 5.8"/><circle cx="10" cy="10" r="7.2"/></svg>'; }
  function peopleIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="7.1" cy="6.4" r="2.7"/><path d="M2.8 16.3c.5-2.7 2-4 4.3-4s3.8 1.3 4.3 4M13 4.1a2.5 2.5 0 0 1 0 4.8M13 12.2c2.2.1 3.5 1.4 3.9 4.1"/></svg>'; }
  function networkIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="4" r="2"/><circle cx="4" cy="15" r="2"/><circle cx="16" cy="15" r="2"/><path d="m9 5.8-4 7.4M11 5.8l4 7.4M6 15h8"/></svg>'; }
  function starIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.7 2.2 4.6 5.1.7-3.7 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.7-3.6 5.1-.7L10 2.7Z"/></svg>'; }
  function bookmarkIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.2 3.2h9.6v13.5L10 13.6l-4.8 3.1V3.2Z"/></svg>'; }
  function arrowIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9"/></svg>'; }
  function infoIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M10 9v4M10 6.2h.01"/></svg>'; }
  function personIcon() { return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="6.3" r="2.7"/><path d="M4.5 16.4c.5-2.9 2.3-4.4 5.5-4.4s5 1.5 5.5 4.4"/></svg>'; }

  function openResearchDialog(type) {
    const item = selectedOpportunity();
    $('#research-title').textContent = type === 'employer' ? 'Research employer' : 'Start candidate search';
    $('#research-role-name').textContent = item.role;
    const p = $('.research-confirmation p');
    p.textContent = type === 'employer'
      ? 'This would run targeted employer-attribution and contradiction searches, then record each query and outcome in the vacancy Search Log.'
      : 'This would generate and execute role-specific searches, then write query, source, reason and observed yield to the candidate Search Log.';
    dialog('research-dialog').showModal();
  }

  function updateAssignment(candidateId, nextStatus, reason = null) {
    const key = assignmentKey(selectedOpportunity().id, candidateId);
    const current = assignmentFor(selectedOpportunity().id, candidateId);
    operations.candidateAssignments[key] = {
      ...current,
      operational_status: nextStatus,
      excluded_reason: nextStatus === 'EXCLUDED' ? reason : null,
      last_user_action_at: new Date().toISOString(),
    };
    persistOperations();
    renderSummary();
    renderCandidatePanel();
    focusCandidateName(candidateId);
    if (nextStatus === 'TOP_10') showToast('Recruiter Top 10 updated. Research ranking and QA are unchanged.');
    else if (nextStatus === 'EXCLUDED') showToast('Candidate excluded from this vacancy. Evidence remains available.');
    else showToast(`Candidate workflow set to ${workflowLabel(nextStatus).toLowerCase()}. Evidence is unchanged.`);
  }

  function openCandidateEvidence(candidateId) {
    const item = selectedOpportunity();
    const candidate = item.candidates.find((entry) => entry.candidate_id === candidateId);
    if (!candidate) return;
    const assignment = assignmentFor(item.id, candidate.candidate_id);
    $('#evidence-title').textContent = candidate.name;
    $('#candidate-evidence-content').innerHTML = `<div class="evidence-candidate-intro"><span class="candidate-avatar" aria-hidden="true">${escapeHtml(candidate.initials)}</span><div><strong>${escapeHtml(candidate.title)} · ${escapeHtml(candidate.employer)}</strong><span>${escapeHtml(candidate.location)} · Tier ${escapeHtml(candidate.tier)} · Candidate QA ${escapeHtml(formatStatus(candidate.qa))}</span></div></div><div class="evidence-claim-list">${candidate.claims.map((claim) => `<div class="evidence-claim-row"><strong>${escapeHtml(claim.name)}</strong>${statusBadge(claim.status)}<p>${escapeHtml(claim.basis)} · ${escapeHtml(claim.source)}</p></div>`).join('')}</div><div class="detail-notice evidence-notice"><span class="notice-symbol">i</span><span>Recruiter status: ${escapeHtml(workflowLabel(assignment.operational_status))}. This operational state does not alter candidate evidence, ranking or QA.</span></div>`;
    dialog('candidate-evidence-dialog').showModal();
  }

  function showToast(message, actionLabel = null, action = null) {
    const region = $('#toast-region');
    region.innerHTML = '';
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = `<span class="toast-mark" aria-hidden="true">✓</span><span class="toast-message"></span>`;
    $('.toast-message', node).textContent = message;
    if (actionLabel && action) {
      const button = document.createElement('button');
      button.className = 'toast-action';
      button.type = 'button';
      button.textContent = actionLabel;
      button.addEventListener('click', () => { action(); region.innerHTML = ''; });
      node.appendChild(button);
    }
    region.appendChild(node);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { region.innerHTML = ''; }, actionLabel ? 7500 : 3800);
  }

  function applySavedView(id) {
    const preset = [...systemSavedViews, ...savedViews.map((saved) => ({ id: saved.saved_view_id, state: saved.view_state }))].find((entry) => entry.id === id);
    if (!preset) return;
    const stored = savedViews.find((saved) => saved.saved_view_id === id);
    const sourceState = stored ? stored.view_state : null;
    const next = stored ? {
      vacancyView: sourceState.vacancy_view, vacancySearch: sourceState.vacancy_search, candidateSearch: sourceState.candidate_search,
      filters: sourceState.vacancy_filters, sort: sourceState.vacancy_sort, density: sourceState.layout?.vacancy_density,
      dateWindow: sourceState.date_window, visibleFields: sourceState.visible_fields, candidateGroup: sourceState.candidate_filters?.group,
      candidateFilterConfirmed: sourceState.candidate_filters?.confirmed_only, activeTab: sourceState.active_vacancy_tab,
      candidateFocus: sourceState.layout?.candidate_focus,
    } : (preset.state || {});
    if (next.vacancyView) view.vacancyView = next.vacancyView;
    if (next.sort) view.sort = next.sort;
    if (next.filters) view.filters = { ...defaultView.filters, ...next.filters };
    if (next.vacancySearch !== undefined) view.vacancySearch = next.vacancySearch;
    if (next.density) view.density = next.density;
    if (next.dateWindow) view.dateWindow = next.dateWindow;
    if (next.visibleFields) view.visibleFields = next.visibleFields;
    if (next.candidateGroup) view.candidateGroup = next.candidateGroup;
    if (next.candidateFilterConfirmed !== undefined) view.candidateFilterConfirmed = next.candidateFilterConfirmed;
    view.activeTab = next.activeTab || 'OVERVIEW';
    if (next.candidateFocus !== undefined) view.candidateFocus = next.candidateFocus;
    view.candidateDrawerOpen = Boolean(view.candidateFocus && window.matchMedia('(min-width: 721px) and (max-width: 1280px)').matches);
    view.savedViewId = id;
    const first = visibleOpportunities()[0];
    if (first) view.selectedVacancyId = first.id;
    persistView();
    renderAll();
    showToast(`Loaded saved view: ${preset.name}`);
  }

  function openGlobalSearch() {
    view.globalSearch = '';
    $('#global-search-input').value = '';
    renderGlobalResults('');
    dialog('global-search-dialog').showModal();
    window.setTimeout(() => $('#global-search-input').focus(), 20);
  }
  function renderGlobalResults(query) {
    const target = $('#global-search-results');
    const q = query.trim().toLocaleLowerCase();
    if (!q) {
      target.innerHTML = `<div class="global-search-empty">Search roles, employers, candidate evidence, requirements or source IDs.</div>`;
      return;
    }
    const vacancyMatches = opportunities.filter((item) => matchesQuery([item.role, item.employer, item.location, item.ref, item.channelLabel, item.clientStatus, ...item.requirements.map((r) => `${r.name} ${r.value}`), ...item.sources.map((source) => `${source.name} ${source.type} ${source.ref} ${source.detail}`), ...item.stakeholders.map((person) => `${person.name} ${person.title} ${person.relevance}`)].join(' '), q)).slice(0, 5);
    const candidateMatches = opportunities.flatMap((item) => item.candidates.filter((candidate) => matchesQuery([candidate.name, candidate.title, candidate.employer, candidate.location, candidate.tier, candidate.reason, ...candidate.claims.map((c) => `${c.name} ${c.status} ${c.basis} ${c.source}`)].join(' '), q)).map((candidate) => ({ item, candidate }))).slice(0, 6);
    if (!vacancyMatches.length && !candidateMatches.length) {
      target.innerHTML = `<div class="global-search-empty">No stored records match “${escapeHtml(query)}”. Search existing intelligence only; use an explicit research action to find new information.</div>`;
      return;
    }
    target.innerHTML = `${vacancyMatches.length ? `<div class="search-result-heading">Vacancies · ${vacancyMatches.length}</div>${vacancyMatches.map((item) => `<button class="search-result" type="button" data-result-vacancy="${escapeHtml(item.id)}"><span class="search-result-icon">V</span><span class="search-result-copy"><strong>${escapeHtml(item.role)} · ${escapeHtml(item.employer)}</strong><span>${escapeHtml(item.location)} · ${escapeHtml(channelLabel(item.channel))}</span></span><span class="search-result-type">Vacancy</span></button>`).join('')}` : ''}${candidateMatches.length ? `<div class="search-result-heading">Mapped candidates · ${candidateMatches.length}</div>${candidateMatches.map(({ item, candidate }) => `<button class="search-result" type="button" data-result-candidate="${escapeHtml(candidate.candidate_id)}" data-result-vacancy="${escapeHtml(item.id)}"><span class="search-result-icon">P</span><span class="search-result-copy"><strong>${escapeHtml(candidate.name)} · ${escapeHtml(candidate.title)}</strong><span>${escapeHtml(candidate.employer)} · mapped to ${escapeHtml(item.role)}</span></span><span class="search-result-type">Candidate</span></button>`).join('')}` : ''}`;
    $$('[data-result-vacancy]', target).forEach((button) => button.addEventListener('click', () => {
      view.selectedVacancyId = button.dataset.resultVacancy;
      view.activeTab = 'OVERVIEW';
      view.savedViewId = '';
      view.vacancyView = operationFor(view.selectedVacancyId).lifecycle_status === 'CLOSED' ? 'CLOSED_ARCHIVED' : 'INBOX';
      view.vacancySearch = '';
      view.selectedCandidateId = button.dataset.resultCandidate || null;
      view.mobilePane = button.dataset.resultCandidate ? 'candidates' : 'detail';
      view.candidateDrawerOpen = Boolean(button.dataset.resultCandidate && window.matchMedia('(min-width: 721px) and (max-width: 1280px)').matches);
      if (operationFor(view.selectedVacancyId).unread) operationFor(view.selectedVacancyId).unread = false;
      persistView();
      persistOperations();
      dialog('global-search-dialog').close();
      renderAll();
      if (button.dataset.resultCandidate) {
        focusCandidateName(button.dataset.resultCandidate);
        openCandidateEvidence(button.dataset.resultCandidate);
      } else focusWorkspaceAfterRender();
    }));
  }

  $('#vacancy-search').addEventListener('input', (event) => {
    view.vacancySearch = event.target.value;
    view.savedViewId = '';
    view.queueScrollPosition = 0;
    persistView();
    renderQueue();
    renderActiveFilterChips();
  });
  $('#candidate-search').addEventListener('input', (event) => {
    view.candidateSearch = event.target.value;
    view.savedViewId = '';
    view.candidateScrollPosition = 0;
    persistView();
    renderCandidatePanel();
  });
  $('#vacancy-view').addEventListener('change', (event) => {
    view.vacancyView = event.target.value;
    view.savedViewId = '';
    view.queueScrollPosition = 0;
    persistView();
    renderAll();
  });
  $('#sort-by').addEventListener('change', (event) => {
    view.sort = event.target.value;
    view.savedViewId = '';
    persistView();
    renderQueue();
  });
  $('#vacancy-list').addEventListener('click', (event) => {
    const clear = event.target.closest('[data-action="clear-all-filters"]');
    if (clear) {
      view.vacancySearch = '';
      view.filters = clone(defaultView.filters);
      view.vacancyView = 'INBOX';
      view.queueScrollPosition = 0;
      view.savedViewId = '';
      persistView();
      renderAll();
      focusWorkspaceAfterRender();
      return;
    }
    const button = event.target.closest('[data-vacancy-id]');
    if (!button) return;
    const id = button.dataset.vacancyId;
    const same = view.selectedVacancyId === id;
    view.selectedVacancyId = id;
    view.activeTab = same ? view.activeTab : 'OVERVIEW';
    if (!same) view.savedViewId = '';
    view.selectedCandidateId = null;
    view.mobilePane = 'detail';
    view.candidateDrawerOpen = false;
    operationFor(id).unread = false;
    persistView();
    persistOperations();
    renderAll();
    focusWorkspaceAfterRender();
  });
  $('#vacancy-list').addEventListener('keydown', (event) => {
    const list = $('#vacancy-list');
    const items = $$('.vacancy-card', list);
    if (event.key === 'Enter' && event.target === list) {
      event.preventDefault();
      items.find((item) => item.dataset.vacancyId === view.selectedVacancyId)?.click();
      return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !items.length) return;
    const current = document.activeElement.closest('.vacancy-card');
    const currentIndex = items.indexOf(current);
    const nextIndex = currentIndex < 0
      ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
      : Math.max(0, Math.min(items.length - 1, currentIndex + (event.key === 'ArrowDown' ? 1 : -1)));
    event.preventDefault();
    items[nextIndex].focus();
  });
  $('#vacancy-list').addEventListener('dblclick', (event) => {
    if (!event.target.closest('[data-vacancy-id]')) return;
    view.mobilePane = 'detail';
    persistView();
    renderCandidatePanel();
  });
  $('#vacancy-list').addEventListener('scroll', (event) => { view.queueScrollPosition = event.target.scrollTop; persistView(); }, { passive: true });
  $('#candidate-list').addEventListener('scroll', (event) => { view.candidateScrollPosition = event.target.scrollTop; persistView(); }, { passive: true });

  $('#open-filters').addEventListener('click', () => {
    const f = view.filters || defaultView.filters;
    $('#filter-client').value = f.client || 'ANY';
    $('#filter-channel').value = f.channel || 'ANY';
    $('#filter-employer').value = f.employer || 'ANY';
    $('#filter-qa').value = f.qa || 'ANY';
    $('#filter-region').value = f.region || 'ANY';
    $('#filter-freshness').value = f.freshness || 'ANY';
    $('#filter-top10').value = f.top10Ready || 'ANY';
    $('#filter-unread').checked = Boolean(f.unread);
    dialog('filters-dialog').showModal();
  });
  $('#filters-form').addEventListener('submit', (event) => {
    event.preventDefault();
    view.filters = { client: $('#filter-client').value, channel: $('#filter-channel').value, employer: $('#filter-employer').value, qa: $('#filter-qa').value, region: $('#filter-region').value, freshness: $('#filter-freshness').value, top10Ready: $('#filter-top10').value, unread: $('#filter-unread').checked };
    view.savedViewId = '';
    view.queueScrollPosition = 0;
    persistView();
    dialog('filters-dialog').close();
    renderAll();
    focusWorkspaceAfterRender();
  });
  $('#clear-filters').addEventListener('click', () => {
    view.filters = clone(defaultView.filters);
    view.vacancySearch = '';
    view.savedViewId = '';
    persistView();
    $('#filters-dialog').close();
    renderAll();
    focusWorkspaceAfterRender();
  });
  $('#active-filter-chips').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-filter]');
    if (!button) return;
    const key = button.dataset.removeFilter;
    view.filters[key] = key === 'unread' ? false : 'ANY';
    view.savedViewId = '';
    persistView();
    renderAll();
    $('#open-filters').focus({ preventScroll: true });
  });
  $('#saved-view-select').addEventListener('change', (event) => applySavedView(event.target.value));
  $('#open-save-view').addEventListener('click', () => {
    $('#saved-view-name').value = '';
    dialog('save-view-dialog').showModal();
    window.setTimeout(() => $('#saved-view-name').focus(), 20);
  });
  $('#save-view-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('#saved-view-name').value.trim();
    if (!name) return;
    const id = `personal-${Date.now().toString(36)}`;
    const saved = {
      saved_view_id: id,
      name,
      scope: 'PERSONAL',
      view_state: {
        active_module: 'VACANCIES', vacancy_view: view.vacancyView,
        vacancy_search: view.vacancySearch, candidate_search: view.candidateSearch,
        vacancy_filters: clone(view.filters), candidate_filters: { confirmed_only: view.candidateFilterConfirmed, group: view.candidateGroup },
        vacancy_sort: view.sort, candidate_sort: null, saved_view_id: id, active_vacancy_tab: view.activeTab,
        date_window: clone(view.dateWindow), visible_fields: clone(view.visibleFields),
        layout: { vacancy_density: view.density, middle_pane_state: view.candidateFocus ? 'MINIMISED' : 'OPEN', candidate_focus: view.candidateFocus },
      },
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    savedViews.push(saved);
    view.savedViewId = id;
    persistSavedViews();
    persistView();
    dialog('save-view-dialog').close();
    renderSavedViews();
    $('#saved-view-select').value = id;
    $('#saved-view-select').focus({ preventScroll: true });
    showToast(`Saved view “${name}” in this browser.`);
  });

  $$('.density-switch button').forEach((button) => button.addEventListener('click', () => {
    view.density = button.dataset.density;
    view.savedViewId = '';
    persistView();
    renderQueue();
    $$('.density-switch button').forEach((choice) => choice.setAttribute('aria-pressed', String(choice.dataset.density === view.density)));
  }));
  $('#candidate-groups').addEventListener('click', (event) => {
    const button = event.target.closest('[data-group]');
    if (!button) return;
    view.candidateGroup = button.dataset.group;
    view.savedViewId = '';
    persistView();
    renderCandidatePanel();
    $$('#candidate-groups [data-group]').find((choice) => choice.dataset.group === view.candidateGroup)?.focus({ preventScroll: true });
  });
  $('#candidate-filter-toggle').addEventListener('click', () => {
    view.candidateFilterConfirmed = !view.candidateFilterConfirmed;
    view.savedViewId = '';
    persistView();
    renderCandidatePanel();
  });
  $('#candidate-filter-banner').addEventListener('click', (event) => {
    if (!event.target.closest('[data-action="clear-candidate-evidence-filter"]')) return;
    view.candidateFilterConfirmed = false;
    view.savedViewId = '';
    persistView();
    renderCandidatePanel();
    $('#candidate-filter-toggle').focus({ preventScroll: true });
  });
  $('#candidate-list').addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    action.closest('.candidate-action-menu')?.removeAttribute('open');
    const candidateId = action.dataset.candidateId;
    const candidate = selectedOpportunity().candidates.find((c) => c.candidate_id === candidateId);
    if (action.dataset.action === 'evidence') return openCandidateEvidence(candidateId);
    if (action.dataset.action === 'earmark') {
      const current = assignmentFor(selectedOpportunity().id, candidateId).operational_status;
      return updateAssignment(candidateId, current === 'EARMARKED' ? 'RELEVANT' : 'EARMARKED');
    }
    if (action.dataset.action === 'top10') {
      const current = assignmentFor(selectedOpportunity().id, candidateId).operational_status;
      return updateAssignment(candidateId, current === 'TOP_10' ? 'EARMARKED' : 'TOP_10');
    }
    if (action.dataset.action === 'approach') return updateAssignment(candidateId, 'APPROACH');
    if (action.dataset.action === 'exclude') {
      pendingExclude = candidateId;
      $('#exclude-candidate-name').textContent = `${candidate.name} will be excluded from ${selectedOpportunity().role}. Their source evidence and QA record will remain available.`;
      $('#exclude-reason').value = '';
      dialog('exclude-candidate-dialog').showModal();
      return;
    }
    if (action.dataset.action === 'restore-candidate') return updateAssignment(candidateId, 'RELEVANT');
    if (action.dataset.action === 'clear-candidate-evidence-filter') {
      view.candidateFilterConfirmed = false;
      view.savedViewId = '';
      persistView();
      renderCandidatePanel();
      $('#candidate-filter-toggle').focus({ preventScroll: true });
      return;
    }
    if (action.dataset.action === 'clear-candidate-search') {
      view.candidateSearch = '';
      view.candidateGroup = 'ALL';
      view.candidateFilterConfirmed = false;
      view.savedViewId = '';
      persistView();
      renderCandidatePanel();
      $('#candidate-search').focus({ preventScroll: true });
    }
  });
  $('#candidate-search').addEventListener('keydown', (event) => { if (event.key === 'Escape') { view.candidateSearch = ''; event.target.value = ''; view.savedViewId = ''; persistView(); renderCandidatePanel(); } });
  $('#exclude-candidate-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!pendingExclude || !$('#exclude-reason').value) return;
    const reason = $('#exclude-reason').selectedOptions[0].textContent;
    dialog('exclude-candidate-dialog').close();
    updateAssignment(pendingExclude, 'EXCLUDED', reason);
    pendingExclude = null;
  });
  $('#close-reason').addEventListener('change', (event) => {
    const needsDetail = event.target.value === 'OTHER';
    $('#close-reason-detail').hidden = !needsDetail;
    $('.detail-label[for="close-reason-detail"]').hidden = !needsDetail;
    $('#close-reason-detail').required = needsDetail;
  });
  $('#close-vacancy-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const reason = $('#close-reason').value;
    if (!pendingCloseId || !reason) return;
    const detail = $('#close-reason-detail').value.trim();
    if (reason === 'OTHER' && !detail) return;
    const id = pendingCloseId;
    const previous = clone(operationFor(id));
    const previousViewState = clone(view);
    operations.vacancies[id] = { ...previous, lifecycle_status: 'CLOSED', closed_reason: reason, closed_reason_detail: reason === 'OTHER' ? detail : null, closed_at: new Date().toISOString(), unread: false, last_user_action_at: new Date().toISOString() };
    persistOperations();
    view.vacancyView = 'INBOX';
    view.savedViewId = '';
    view.selectedVacancyId = opportunities.find((item) => item.id !== id && operationFor(item.id).lifecycle_status !== 'CLOSED')?.id || opportunities[0].id;
    view.activeTab = 'OVERVIEW';
    persistView();
    dialog('close-vacancy-dialog').close();
    renderAll();
    focusWorkspaceAfterRender();
    showToast('Vacancy archived. Sources, candidate map, Top 10, Search Log and QA are retained.', 'Undo', () => {
      operations.vacancies[id] = previous;
      Object.assign(view, previousViewState);
      persistOperations();
      persistView();
      renderAll();
      focusWorkspaceAfterRender();
    });
    pendingCloseId = null;
  });
  $('#run-candidate-search').addEventListener('click', () => openResearchDialog('candidate'));
  $('#confirm-research').addEventListener('click', () => {
    const item = selectedOpportunity();
    const entry = { event_id: `demo-${Date.now().toString(36)}`, vacancy_id: item.id, action: $('.research-confirmation p').textContent, created_at: new Date().toISOString(), execution_status: 'NOT_EXECUTED', preview_only: true };
    demoLog.push(entry);
    persistDemoLog();
    showToast('Demo action recorded locally; no query was executed.');
    dialog('research-dialog').close();
    if (view.activeTab === 'SEARCH_LOG') {
      renderDetail();
      focusDetailRegion();
    }
  });
  $('#account-profile').addEventListener('click', () => showToast('Demo recruiter profile. Authentication and account settings are not connected in this prototype.'));
  $('#open-global-search').addEventListener('click', openGlobalSearch);
  $('#close-global-search').addEventListener('click', () => dialog('global-search-dialog').close());
  $('#global-search-input').addEventListener('input', (event) => {
    view.globalSearch = event.target.value;
    renderGlobalResults(event.target.value);
  });
  $('#global-search-input').addEventListener('keydown', (event) => { if (event.key === 'Escape') dialog('global-search-dialog').close(); });
  $('#candidate-focus').addEventListener('click', () => {
    view.candidateFocus = !view.candidateFocus;
    view.savedViewId = '';
    view.mobilePane = view.candidateFocus ? 'candidates' : 'detail';
    view.candidateDrawerOpen = view.candidateFocus && window.matchMedia('(min-width: 721px) and (max-width: 1280px)').matches;
    persistView();
    renderCandidatePanel();
    renderDetail();
    if (view.candidateFocus) $('#candidate-search').focus({ preventScroll: true });
    else focusDetailRegion();
  });
  $('#open-candidate-pane').addEventListener('click', () => {
    if (window.matchMedia('(max-width: 1280px)').matches) {
      view.candidateDrawerOpen = true;
      persistView();
      renderCandidatePanel();
      $('#candidate-search').focus({ preventScroll: true });
    } else {
      view.mobilePane = 'candidates';
      persistView();
      renderCandidatePanel();
    }
  });
  $('#open-role-context').addEventListener('click', () => {
    view.mobilePane = 'detail';
    if (view.candidateFocus) view.savedViewId = '';
    view.candidateFocus = false;
    view.candidateDrawerOpen = false;
    persistView();
    renderCandidatePanel();
    renderDetail();
    focusDetailRegion();
  });
  $('#drawer-scrim').addEventListener('click', () => {
    view.candidateDrawerOpen = false;
    persistView();
    renderCandidatePanel();
    $('#open-candidate-pane').focus({ preventScroll: true });
  });
  $$('.mobile-pane-button').forEach((button) => button.addEventListener('click', () => {
    view.mobilePane = button.dataset.mobilePane;
    if (view.candidateFocus) view.savedViewId = '';
    view.candidateFocus = false;
    view.candidateDrawerOpen = false;
    persistView();
    renderCandidatePanel();
  }));
  $('#show-queue-shortcuts').addEventListener('click', () => dialog('keyboard-help-dialog').showModal());
  $('#queue-options').addEventListener('click', () => showToast('Queue density, sorting and saved views are controlled above the three-pane workspace.'));
  $('#reset-preview').addEventListener('click', () => {
    try { Object.values(STORAGE).forEach((key) => localStorage.removeItem(key)); }
    catch { /* Reload still restores the in-memory synthetic defaults. */ }
    window.location.reload();
  });
  $('.module-nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-module]');
    if (!button || button.dataset.module === 'VACANCIES') return;
    showToast(`${button.textContent.trim()} is defined in the workspace contract; this focused prototype implements VACANCIES → Inbox.`);
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-close-dialog]');
    if (button) dialog(button.dataset.closeDialog).close();
    if (!event.target.closest('.candidate-action-menu')) $$('.candidate-action-menu[open]').forEach((element) => element.removeAttribute('open'));
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openGlobalSearch();
    }
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      $('#vacancy-search').focus();
    }
    if (event.key === 'Escape' && view.candidateDrawerOpen && !document.querySelector('dialog[open]')) {
      view.candidateDrawerOpen = false;
      persistView();
      renderCandidatePanel();
      $('#open-candidate-pane').focus({ preventScroll: true });
    }
  });
  window.addEventListener('resize', () => {
    const tablet = window.matchMedia('(min-width: 721px) and (max-width: 1280px)').matches;
    const phone = window.matchMedia('(max-width: 720px)').matches;
    let changed = false;
    if (tablet && (view.candidateFocus || view.mobilePane === 'candidates') && !view.candidateDrawerOpen) {
      view.candidateDrawerOpen = true;
      changed = true;
    } else if (!tablet && view.candidateDrawerOpen) {
      view.candidateDrawerOpen = false;
      if (phone) view.mobilePane = 'candidates';
      changed = true;
    }
    if (changed) {
      persistView();
      renderCandidatePanel();
    }
  });

  const savedView = systemSavedViews.find((entry) => entry.id === view.savedViewId) || savedViews.find((entry) => entry.saved_view_id === view.savedViewId);
  if (savedView) {
    // A saved view is loaded from its explicit selection; other restored context remains independent.
    view.savedViewId = savedView.id || savedView.saved_view_id;
  }
  renderAll();
  $('#vacancy-list').scrollTop = view.queueScrollPosition || 0;
  $('#candidate-list').scrollTop = view.candidateScrollPosition || 0;
})();
