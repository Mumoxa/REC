import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import type {
  CandidateAssignment,
  CandidateOperationalStatus,
  MarketBucket,
  Vacancy,
} from "@/lib/data/types";
import type { WorkspaceDensity } from "@/lib/workspace/view-state";
import { displayMarketCounts } from "@/lib/workspace/market-stats";
import { Badge } from "@/components/ui/primitives";
import { safePublicUrl } from "@/components/research/research-model";

export const channelLabels: Record<string, string> = {
  AGREED_CLIENTS: "Agreed Clients",
  AGENCY_SITES: "Agencies",
  LINKEDIN: "LinkedIn",
  JOB_BOARDS: "Job Boards",
};

/** Research buckets — evidence, never changed by a recruiter click. */
export const marketLabels: Record<MarketBucket, string> = {
  TOP_10: "Top 10",
  STRONG_MARKET: "Strongest Market",
  LONGLIST: "Longlist",
  UNREVIEWED: "Unreviewed",
  EXCLUDED: "Excluded",
};

/**
 * Filter labels make the research/recruiter split explicit. `TOP_10` is the
 * evidence-backed research bucket; the Excluded grouping follows the recruiter
 * workflow status, exactly as the prototype does.
 */
export const marketFilterLabels: Record<MarketBucket | "ALL", string> = {
  ALL: "All buckets",
  TOP_10: "Research Top 10",
  STRONG_MARKET: "Strongest Market",
  LONGLIST: "Longlist",
  UNREVIEWED: "Unreviewed",
  EXCLUDED: "Excluded",
};

/**
 * Recruiter workflow progression. Actions never roll the workflow backwards:
 * earlier actions are disabled once the assignment has progressed past them,
 * and un-toggling returns exactly one step (golden case
 * recruiter_workflow_actions_do_not_regress_lifecycle).
 */
const WORKFLOW_ORDER: CandidateOperationalStatus[] = [
  "SURFACED",
  "RELEVANT",
  "EARMARKED",
  "TOP_10",
  "APPROACH",
  "ENGAGED",
  "SUBMITTED",
];

const workflowLabels: Record<CandidateOperationalStatus, string> = {
  SURFACED: "Surfaced",
  RELEVANT: "Relevant",
  EARMARKED: "Earmarked",
  TOP_10: "Recruiter Top 10",
  APPROACH: "Approach",
  ENGAGED: "Engaged",
  SUBMITTED: "Submitted",
  EXCLUDED: "Excluded",
};

function workflowPosition(status: CandidateOperationalStatus) {
  if (status === "EXCLUDED") return -1;
  return WORKFLOW_ORDER.indexOf(status);
}

// Card labels stay short so "Recruiter · …" does not repeat the word "Recruiter" in the status name.
const cardWorkflowLabels: Record<CandidateOperationalStatus, string> = {
  ...workflowLabels,
  TOP_10: "Top 10",
};

export function VacancyCard({
  vacancy,
  density,
  selected,
  onSelect,
}: {
  vacancy: Vacancy;
  density: WorkspaceDensity;
  selected: boolean;
  onSelect: () => void;
}) {
  const market = displayMarketCounts(vacancy.candidates, vacancy.candidateMarketSummary);
  const nextAction =
    vacancy.lifecycleStatus === "CLOSED"
      ? "Archived intelligence"
      : vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED"
        ? "Resolve research gaps"
        : vacancy.employerStatus !== "CONFIRMED"
          ? "Verify employer identity"
          : vacancy.candidateMapStatus === "READY"
            ? "Review candidate market"
            : "Continue market mapping";
  return (
    <button
      id={`vacancy-${vacancy.id}`}
      role="option"
      aria-selected={selected}
      className={`vacancy-card ${selected ? "selected" : ""} ${density.toLowerCase()}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="vacancy-card-top">
        <span className="vacancy-channel-icon">
          <BriefcaseBusiness size={16} />
        </span>
        <div className="vacancy-title">{vacancy.title}</div>
        {vacancy.unread && <span className="new-dot" title="New" aria-label="New vacancy" />}
        <ChevronRight size={15} className="vacancy-selected-arrow" aria-hidden="true" />
      </div>
      {density !== "MINIMAL" && (
        <>
          <div className="vacancy-employer">{vacancy.employerName}</div>
          <div className="vacancy-detail-line">
            <MapPin size={12} />
            <span>{vacancy.location}</span>
            <span className="vacancy-channel-label">{channelLabels[vacancy.searchChannel]}</span>
          </div>
        </>
      )}
      {density === "EXPANDED" && (
        <>
          <div className="vacancy-badges">
            <EvidencePill status={vacancy.employerStatus} />
            <QaPill status={vacancy.qaStatus} compact />
            {["AGREED_CLIENT", "AGREED_GROUP_ENTITY"].includes(vacancy.clientStatus) && (
              <span className="client-badge">Agreed</span>
            )}
          </div>
          <div className="vacancy-stats" aria-label="Candidate market stats">
            <span>
              <strong>{market.credible}</strong> credible
            </span>
            <span>
              <strong>{market.strongest}</strong> strongest
            </span>
            <span>
              <strong>{market.top10}</strong> Top 10
            </span>
          </div>
          <div className="vacancy-next-action">
            <span>{nextAction}</span>
            <ArrowUpRight size={13} />
          </div>
          <div className="vacancy-recency">
            <Clock3 size={11} />
            {vacancy.lastVerified
              ? `Verified ${formatDate(vacancy.lastVerified)}`
              : "Verification date unavailable"}
          </div>
        </>
      )}
      {density === "COMPACT" && (
        <div className="vacancy-compact-meta">
          <span>{market.credible} credible candidates</span>
          <QaPill status={vacancy.qaStatus} compact />
        </div>
      )}
    </button>
  );
}

export function Overview({ vacancy }: { vacancy: Vacancy }) {
  const market = displayMarketCounts(
    vacancy.candidates,
    vacancy.candidateMarketSummary,
    vacancy.researchQueries.filter((query) => query.executionStatus === "EXECUTED").length
  );
  return (
    <div className="stack-lg">
      <section className="role-overview">
        <div className="section-title">The opportunity</div>
        <p className="summary-copy">{vacancy.summary || "No vacancy summary has been recorded."}</p>
        <div className="role-context-tags">
          <span>{vacancy.roleFamily}</span>
          <span>{vacancy.seniority}</span>
          <span>{vacancy.clientStatus.replaceAll("_", " ").toLowerCase()}</span>
        </div>
      </section>
      <section className="employer-resolution">
        <div className="section-heading">
          <h3>Employer resolution</h3>
          <EvidencePill status={vacancy.employerStatus} />
        </div>
        <strong>{vacancy.employerName}</strong>
        <p>
          {vacancy.employerStatus === "CONFIRMED"
            ? "Employer identity is confirmed in the authorised research record."
            : vacancy.employerStatus === "PROBABLE"
              ? "This employer is probable. Verify attribution before treating it as confirmed."
              : vacancy.employerStatus === "HYPOTHESIS"
                ? "This employer is a research hypothesis. Source evidence must be challenged before attribution."
                : "Employer identity remains unresolved. Additional research is required."}
        </p>
        <a href={`/companies?q=${encodeURIComponent(vacancy.employerName)}`}>
          Explore organisation <ArrowUpRight size={13} />
        </a>
      </section>
      <section>
        <div className="section-heading">
          <h3>Priority requirements</h3>
          <span>{vacancy.requirements.length} recorded</span>
        </div>
        <div className="requirements-grid">
          {vacancy.requirements.slice(0, 6).map((requirement) => (
            <div className="requirement-card" key={requirement.id}>
              <div className="requirement-label">{requirement.label}</div>
              <div className="requirement-value">{requirement.value}</div>
              <EvidencePill status={requirement.status} />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h3>Candidate market coverage</h3>
          <StatusPill
            text={`Coverage: ${vacancy.candidateMarketSummary.coverageStatus.replaceAll("_", " ")}`}
            subtle
          />
        </div>
        <div className="progress-grid">
          <MetricCard label="Credible market" value={market.credible} />
          <MetricCard label="Strongest market" value={market.strongest} />
          <MetricCard label="Research Top 10" value={market.top10} />
          <MetricCard label="Queries executed" value={market.executedQueries ?? 0} />
        </div>
        <div className="market-funnel-note">
          Research depth target: 50+ credible candidates where supported, then roughly 20–25
          strongest, then the final Top 10. These are targets, not quotas.
          {vacancy.candidateMarketSummary.coverageNote && (
            <p>{vacancy.candidateMarketSummary.coverageNote}</p>
          )}
          {vacancy.candidateMarketSummary.rawProfilesReviewed != null && (
            <span>
              {vacancy.candidateMarketSummary.rawProfilesReviewed} raw profiles reviewed ·{" "}
              {vacancy.candidates.length} assignment records loaded
            </span>
          )}
        </div>
      </section>
      <section className="vacancy-history">
        <div className="section-heading">
          <h3>Record history</h3>
          <Clock3 size={15} />
        </div>
        <div className="history-event">
          <span className="history-dot" />
          <div>
            <strong>First surfaced</strong>
            <time dateTime={vacancy.firstSeen}>{formatDate(vacancy.firstSeen)} SAST</time>
          </div>
        </div>
        {vacancy.lastSeen && (
          <div className="history-event">
            <span className="history-dot" />
            <div>
              <strong>Last observed</strong>
              <time dateTime={vacancy.lastSeen}>{formatDate(vacancy.lastSeen)} SAST</time>
            </div>
          </div>
        )}
        <div className="history-event">
          <span className="history-dot" />
          <div>
            <strong>Latest verification</strong>
            <span>
              {vacancy.lastVerified
                ? `${formatDate(vacancy.lastVerified)} SAST`
                : "No verification date recorded"}
            </span>
          </div>
        </div>
        <div className="history-event">
          <span className="history-dot" />
          <div>
            <strong>
              {vacancy.sources.length} source{vacancy.sources.length === 1 ? "" : "s"} supporting
              this canonical vacancy
            </strong>
            <span>Further event history is unavailable in this read model.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HiringTeam({ vacancy }: { vacancy: Vacancy }) {
  const intel = vacancy.companyEmailIntelligence;
  const statusLabel = vacancy.stakeholderMapStatus.replaceAll("_", " ");

  return (
    <div className="stack-lg hiring-team-panel">
      <div className="hiring-team-status">
        <div>
          <div className="section-title">Hiring-team research</div>
          <p className="summary-copy">
            Named people who are likely to own, influence or execute hiring for this vacancy.
            Observed business emails are kept separate from pattern-inferred probable addresses.
          </p>
        </div>
        <StatusPill text={statusLabel} subtle />
      </div>

      {vacancy.stakeholderMapNote && (
        <div className="contact-research-note">{vacancy.stakeholderMapNote}</div>
      )}

      <div className="section-title">Company email intelligence</div>
      <div className="email-intel-grid">
        <div className="email-intel-card">
          <span>Website domain</span>
          <strong>{intel?.websiteDomain || "Unknown"}</strong>
          <small style={{ opacity: 0.7 }}>Company website</small>
        </div>
        <div className="email-intel-card">
          <span>Employee email domain</span>
          <strong>{intel?.employeeEmailDomain || "Unknown"}</strong>
          <small>{intel?.domainStatus || "UNKNOWN"}</small>
        </div>
        <div className="email-intel-card">
          <span>Detected pattern</span>
          <strong>{intel?.detectedPattern || "Unknown"}</strong>
          <small>{intel?.patternStatus || "UNKNOWN_PATTERN"}</small>
        </div>
        <div className="email-intel-card">
          <span>Observed examples</span>
          <strong>{intel?.observedPatternExamplesCount ?? 0}</strong>
          <small>
            {intel?.observedBusinessEmailExamples?.join(" · ") || "No public examples stored"}
          </small>
        </div>
      </div>

      {!!intel?.patternBasis?.length && (
        <div className="contact-pattern-basis">
          <strong>Pattern basis</strong>
          <span>{intel.patternBasis.join(" · ")}</span>
        </div>
      )}

      <div className="section-title">Hiring stakeholders</div>
      {vacancy.stakeholders.length === 0 ? (
        <div className="empty-state">
          {vacancy.stakeholderMapStatus === "NOT_STARTED"
            ? "Hiring-team research has not started for this vacancy."
            : vacancy.stakeholderMapStatus === "IN_PROGRESS"
              ? "Hiring-team research is in progress; no stakeholder has been resolved yet."
              : "No stakeholder was resolved. Review the research note and evidence before outreach."}
        </div>
      ) : (
        <div className="stakeholder-list">
          {vacancy.stakeholders.map((person) => (
            <article
              className="stakeholder-card"
              key={person.id}
              aria-label={`${person.name} stakeholder card`}
            >
              <div className="stakeholder-head">
                <div className="stakeholder-identity">
                  <div className="stakeholder-avatar" aria-hidden="true">
                    {initials(person.name)}
                  </div>
                  <div>
                    <strong>{person.name}</strong>
                    <div className="muted">{person.title || "Title unresolved"}</div>
                  </div>
                </div>
                <div className="stakeholder-pills">
                  {person.relevance && (
                    <StatusPill text={person.relevance.replaceAll("_", " ")} subtle />
                  )}
                  <EvidencePill status={person.evidenceStatus} />
                </div>
              </div>

              {person.reasonRelevant && <p>{person.reasonRelevant}</p>}

              <div className="stakeholder-grid">
                <div>
                  <span>Employment</span>
                  <strong>
                    {person.currentEmploymentStatus?.replaceAll("_", " ") || "Unknown"}
                  </strong>
                </div>
                <div className="observed">
                  <span>
                    <Check size={13} aria-hidden="true" /> Observed business email
                  </span>
                  <strong>{person.observedBusinessEmail || "—"}</strong>
                </div>
                <div className="probable">
                  <span>
                    <Search size={13} aria-hidden="true" /> Probable business email
                  </span>
                  <strong>{person.probableBusinessEmail || "—"}</strong>
                  {person.probableBusinessEmail && (
                    <small style={{ fontSize: 9, color: "var(--stone-500)", marginTop: 2 }}>
                      Pattern-inferred · requires verification
                    </small>
                  )}
                </div>
                <div>
                  <span>Email status</span>
                  <strong>{person.emailStatus?.replaceAll("_", " ") || "UNKNOWN"}</strong>
                </div>
              </div>

              {(person.emailPatternBasis || person.emailConfidenceNote) && (
                <div className="stakeholder-evidence-note">
                  {person.emailPatternBasis && (
                    <span>
                      <b>Pattern:</b> {person.emailPatternBasis}
                    </span>
                  )}
                  {person.emailConfidenceNote && (
                    <span>
                      <b>Confidence:</b> {person.emailConfidenceNote}
                    </span>
                  )}
                </div>
              )}

              <div className="stakeholder-links">
                {safePublicUrl(person.profileUrl) && (
                  <a
                    href={safePublicUrl(person.profileUrl)!}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open profile for ${person.name}`}
                  >
                    Profile <ExternalLink size={12} />
                  </a>
                )}
                {person.lastVerified && <span>Verified {formatDate(person.lastVerified)}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function Requirements({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="data-table" role="table" aria-label="Requirements">
      <div className="data-row header" role="row">
        <span role="columnheader">Requirement</span>
        <span role="columnheader">Value</span>
        <span role="columnheader">Type</span>
        <span role="columnheader">Evidence</span>
      </div>
      {vacancy.requirements.map((r) => (
        <div className="data-row" key={r.id} role="row">
          <strong role="cell">{r.label}</strong>
          <span role="cell">{r.value}</span>
          <span role="cell">{r.type}</span>
          <span role="cell">
            <EvidencePill status={r.status} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sources({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="source-list">
      {vacancy.sources.map((source) => (
        <div className="source-item" key={source.id}>
          <div>
            <strong>{source.name}</strong>
            {safePublicUrl(source.url) && (
              <a
                className="source-link"
                href={safePublicUrl(source.url)!}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open source ${source.name}`}
              >
                <ExternalLink size={13} />
                Open source
              </a>
            )}
            <div className="muted">{source.type.replaceAll("_", " ")}</div>
          </div>
          <div className="source-meta">
            <EvidencePill status={source.evidenceStatus} />
            {source.postedAt && <span>{formatDate(source.postedAt)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchLog({ vacancy }: { vacancy: Vacancy }) {
  if (!vacancy.researchQueries.length) {
    return <div className="empty-state">No candidate research queries have been executed yet.</div>;
  }
  return (
    <div className="query-list">
      {vacancy.researchQueries.map((query) => (
        <div className="query-item" key={query.id}>
          <code>{query.query}</code>
          <div className="query-meta">
            <span>{query.source}</span>
            <span>{query.family.replaceAll("_", " ")}</span>
            <span className={query.executionStatus === "EXECUTED" ? "success-text" : "warn-text"}>
              {query.executionStatus}
            </span>
            <span>{query.candidatesSurfaced ?? 0} candidates</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QaPanel({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="qa-panel">
      <div className="qa-hero">
        <QaPill status={vacancy.qaStatus} />
        <div>
          <strong>Discovery / opportunity QA</strong>
          <p>
            The workspace never upgrades unknown information because it would make the record easier
            to use. Evidence status remains visible through downstream candidate work.
          </p>
        </div>
      </div>
      <div className="section-title">Current unresolved areas</div>
      <div className="unknown-list">
        {vacancy.employerStatus !== "CONFIRMED" && <span>Employer: {vacancy.employerStatus}</span>}
        {vacancy.requirements
          .filter((r) => r.status === "UNKNOWN" || r.status === "HYPOTHESIS")
          .map((r) => (
            <span key={r.id}>
              {r.label}: {r.status}
            </span>
          ))}
        {vacancy.qaStatus === "PASS" && vacancy.employerStatus === "CONFIRMED" && (
          <span>No material discovery-level unknowns currently block the workflow.</span>
        )}
      </div>
    </div>
  );
}

export function CandidateCard({
  candidate,
  selected,
  saving,
  actionsDisabled = false,
  onOpen,
  onStatus,
  onExcludeStart,
}: {
  candidate: CandidateAssignment;
  selected: boolean;
  saving: boolean;
  actionsDisabled?: boolean;
  onOpen: () => void;
  onStatus: (status: CandidateOperationalStatus, reason?: string) => void;
  onExcludeStart?: (candidateId: string, name: string) => void;
}) {
  const position = workflowPosition(candidate.operationalStatus);
  const excluded = candidate.operationalStatus === "EXCLUDED";
  const earmarked = position >= 2;
  const recruiterTop10 = position >= 3;
  const approachStarted = position >= 4;
  const confirmedClaims = candidate.claims.filter((claim) => claim.status === "CONFIRMED");
  const unknownClaims = candidate.claims.filter((claim) => claim.status !== "CONFIRMED");
  return (
    <article
      className={`candidate-card ${selected ? "open" : ""} ${excluded ? "is-excluded" : ""}`}
      aria-label={`Candidate ${candidate.name}`}
    >
      <button
        className="candidate-main"
        onClick={onOpen}
        aria-expanded={selected}
        aria-label={`${candidate.name}, ${candidate.currentTitle} at ${candidate.currentEmployer}. Press Enter to ${selected ? "collapse" : "expand"} details.`}
      >
        <span className="candidate-avatar" aria-hidden="true">
          {initials(candidate.name)}
        </span>
        <div className="candidate-identity">
          <div className="candidate-name">{candidate.name}</div>
          <div className="candidate-role">{candidate.currentTitle}</div>
          <div className="candidate-company">{candidate.currentEmployer}</div>
        </div>
        <span className="candidate-rank">
          {candidate.rank ? (
            `#${candidate.rank}`
          ) : candidate.comparableTier ? (
            `Tier ${candidate.comparableTier}`
          ) : (
            <UserRound size={15} />
          )}
        </span>
      </button>
      <div className="candidate-card-body">
        <div className="candidate-location">
          <MapPin size={12} />
          {candidate.location}
          {candidate.comparableTier && <span>Comparable tier {candidate.comparableTier}</span>}
        </div>
        <div className="candidate-evidence-strip">
          {confirmedClaims.slice(0, 3).map((claim) => (
            <span key={claim.name} title={`${claim.name}: ${claim.value} — CONFIRMED`}>
              <Check size={11} />
              {claim.name}
            </span>
          ))}
          {unknownClaims.length > 0 && (
            <span className="evidence-open">
              {unknownClaims.length} unverified claim{unknownClaims.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="candidate-statuses">
          <span className={`bucket-badge ${candidate.marketBucket.toLowerCase()}`}>
            {marketLabels[candidate.marketBucket]}
          </span>
          <span className={`workflow-badge ${excluded ? "excluded" : "active"}`}>
            Recruiter · {cardWorkflowLabels[candidate.operationalStatus]}
          </span>
          <QaPill status={candidate.qaStatus} compact />
        </div>
      </div>
      <div className="candidate-actions" role="group" aria-label={`Actions for ${candidate.name}`}>
        <button
          disabled={actionsDisabled || saving || excluded || position > 2}
          onClick={() =>
            onStatus(candidate.operationalStatus === "EARMARKED" ? "RELEVANT" : "EARMARKED")
          }
          className={earmarked ? "active" : ""}
          aria-pressed={earmarked}
          aria-label={earmarked ? "Unmark earmarked candidate" : "Earmark candidate"}
          title={
            excluded
              ? "Restore this candidate before changing workflow status."
              : position > 2
                ? "This candidate has progressed beyond Earmarked; the workflow will not be rolled backward."
                : "Recruiter workflow only"
          }
        >
          <Bookmark size={12} />
          {earmarked ? "Earmarked" : "Earmark"}
        </button>
        <button
          disabled={actionsDisabled || saving || excluded || position > 3}
          onClick={() =>
            onStatus(candidate.operationalStatus === "TOP_10" ? "EARMARKED" : "TOP_10")
          }
          className={recruiterTop10 ? "active" : ""}
          aria-pressed={recruiterTop10}
          aria-label={recruiterTop10 ? "Remove from Top 10" : "Add to Top 10"}
          title={
            excluded
              ? "Restore this candidate before changing workflow status."
              : position > 3
                ? "This candidate has progressed beyond Top 10; the workflow will not be rolled backward."
                : "Recruiter workflow only; does not alter the research-recommended Top 10"
          }
        >
          <Star size={12} />
          Top 10
        </button>
        <button
          disabled={actionsDisabled || saving || excluded || approachStarted}
          onClick={() => onStatus("APPROACH")}
          className={candidate.operationalStatus === "APPROACH" ? "active" : ""}
          aria-pressed={candidate.operationalStatus === "APPROACH"}
          aria-label="Mark for approach"
          title={
            excluded
              ? "Restore the candidate before changing workflow."
              : approachStarted
                ? "This candidate has already reached approach or a later workflow stage."
                : undefined
          }
        >
          <ArrowUpRight size={12} />
          {approachStarted ? "Approach started" : "Approach"}
        </button>
        {excluded ? (
          <button
            disabled={actionsDisabled || saving}
            onClick={() => onStatus("RELEVANT")}
            className="restore-lite"
            aria-label="Restore candidate to relevant"
          >
            Restore
          </button>
        ) : (
          <button
            disabled={actionsDisabled || saving}
            onClick={() => onExcludeStart?.(candidate.candidateId, candidate.name)}
            className="danger-lite"
            aria-label="Exclude candidate"
            aria-haspopup="dialog"
          >
            <X size={12} />
            Exclude
          </button>
        )}
      </div>
      <div className="candidate-evidence-footer">
        <button
          onClick={onOpen}
          aria-label={`${selected ? "Close" : "Open"} evidence for ${candidate.name}`}
        >
          {selected ? "Close intelligence" : "Open intelligence"}
          {selected ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <span>
          {saving
            ? "Saving…"
            : candidate.lastVerified
              ? `Verified ${formatDate(candidate.lastVerified)}`
              : "Not yet verified"}
        </span>
      </div>
      {selected && (
        <div className="candidate-detail">
          {excluded && (
            <div className="excluded-note" role="note">
              <strong>Excluded from this vacancy</strong>
              <span>
                {candidate.excludedReason
                  ? `Reason: ${candidate.excludedReason}`
                  : "No exclusion reason recorded."}{" "}
                Evidence, QA and research ranking are unchanged; other vacancy assignments are
                unaffected.
              </span>
            </div>
          )}
          <div className="candidate-detail-heading">
            <ShieldCheck size={16} />
            <h3>Role-specific intelligence</h3>
          </div>
          <p className="why-fit">{candidate.whyFit}</p>
          <div className="claim-grid" role="table" aria-label="Evidence claims">
            <div className="claim-row claim-head" role="row">
              <span role="columnheader">Claim</span>
              <span role="columnheader">Evidence</span>
              <span role="columnheader">Status</span>
            </div>
            {candidate.claims.map((claim) => (
              <div className="claim-row" key={`${claim.name}-${claim.value}`} role="row">
                <span role="cell">{claim.name}</span>
                <strong role="cell">{claim.value}</strong>
                <span role="cell">
                  <EvidencePill status={claim.status} />
                </span>
              </div>
            ))}
          </div>
          {candidate.evidenceGaps.length > 0 && (
            <div className="candidate-unknowns">
              <div className="section-title small">Still unknown</div>
              <div className="gap-list">
                {candidate.evidenceGaps.map((gap) => (
                  <span key={gap}>{gap}</span>
                ))}
              </div>
            </div>
          )}
          {safePublicUrl(candidate.profileUrl) && (
            <a
              className="candidate-profile-link"
              href={safePublicUrl(candidate.profileUrl)!}
              target="_blank"
              rel="noreferrer"
            >
              Open public profile <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function SummaryStat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`summary-stat surface ${accent ? "accent" : ""} ${warn ? "warn" : ""}`}>
      <span className="summary-stat-label">{label}</span>
      <div>
        <strong>{value}</strong>
        <span className="summary-stat-icon">
          {warn ? (
            <Search size={19} />
          ) : accent ? (
            <ArrowUpRight size={19} />
          ) : label.includes("markets") ? (
            <UsersRound size={19} />
          ) : (
            <BriefcaseBusiness size={19} />
          )}
        </span>
      </div>
      <span className="summary-stat-detail">
        {warn
          ? "Evidence or verification required"
          : accent
            ? "Marked new in the current records"
            : label.includes("markets")
              ? "Ready for recruiter review"
              : "Across all four research channels"}
      </span>
    </div>
  );
}

export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function StatusPill({ text, subtle }: { text: string; subtle?: boolean }) {
  return <span className={`status-pill ${subtle ? "subtle" : ""}`}>{text}</span>;
}

export function QaPill({ status, compact }: { status: string; compact?: boolean }) {
  const className =
    status === "PASS" ? "pass" : status === "FAIL_RESEARCH_REQUIRED" ? "fail" : "unknowns";
  const label =
    status === "PASS_WITH_UNKNOWNS"
      ? "PASS + unknowns"
      : status === "FAIL_RESEARCH_REQUIRED"
        ? "Research required"
        : "QA passed";
  return (
    <span
      className={`qa-pill ${className} ${compact ? "compact" : ""}`}
      aria-label={`QA status ${label}`}
    >
      {label}
    </span>
  );
}

export function EvidencePill({ status }: { status: string }) {
  // Larger, color-coded with text + dot, never color alone
  const normalized = status.toUpperCase();
  const className = normalized.toLowerCase();
  // Keep original label visible plus dot; color via CSS class
  return (
    <span className={`evidence-pill ${className}`} aria-label={`Evidence ${normalized}`}>
      <Badge value={normalized} />
    </span>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
