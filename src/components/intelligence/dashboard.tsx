import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CircleAlert,
  Clock3,
  GitBranch,
  Network,
  Radar,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge, EmptyState, StatCard } from "@/components/ui/primitives";
import type { WorkspaceSnapshot } from "@/lib/data/types";
import { buildIntelligenceOverview, CHANNEL_LABELS, LIFECYCLE_LABELS } from "./overview-model";
import { organisationHref, shortDate, vacancyHref } from "@/components/organisations/read-model";

export function IntelligenceDashboard({ snapshot }: { snapshot: WorkspaceSnapshot }) {
  const data = buildIntelligenceOverview(snapshot);
  const maxStage = Math.max(1, ...data.lifecycle.map((stage) => stage.count));
  const employerKeys = new Map(
    data.organisations.flatMap((org) => org.vacancies.map((role) => [role.id, org.key] as const))
  );
  return (
    <div className="intelligence-dashboard">
      <section className="intelligence-hero" aria-labelledby="intelligence-title">
        <div className="intelligence-hero-top">
          <div>
            <span className="intelligence-live-label">
              <Radar size={14} aria-hidden="true" />{" "}
              {snapshot.demoMode ? "Demo intelligence" : "Workspace intelligence"}
              <span aria-hidden="true">·</span>
              {data.active.length} active vacancies
            </span>
            <h1 id="intelligence-title">
              Every opportunity.
              <br />
              <span>Connected to intelligence.</span>
            </h1>
            <p>
              Connect vacancies, employer research, candidate markets and hiring stakeholders with
              the evidence behind every decision.
            </p>
          </div>
          <div className="intelligence-hero-actions">
            <Link
              prefetch={false}
              href={data.priorities[0] ? vacancyHref(data.priorities[0].role.id) : "/"}
              className="btn intelligence-lime-button"
            >
              <ArrowUpRight size={16} aria-hidden="true" />
              Open research workspace
            </Link>
            <Link prefetch={false} href="/" className="btn intelligence-white-button">
              View vacancies
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="intelligence-hero-stats stat-grid">
          <StatCard
            label="Organisations tracked"
            value={data.namedOrganisationCount}
            detail="Distinct recorded employer labels"
            href="/companies"
            icon={<Building2 size={17} />}
          />
          <StatCard
            label="Active vacancies"
            value={data.active.length}
            detail="All non-closed vacancy records"
            href="/"
            icon={<BriefcaseBusiness size={17} />}
          />
          <StatCard
            label="Mapped candidates"
            value={data.candidateCount}
            detail="Unique loaded people across all vacancies"
            href="/candidates"
            icon={<Users size={17} />}
          />
          <StatCard
            label="Hiring stakeholders"
            value={data.stakeholderCount}
            detail="Vacancy-specific stakeholder associations"
            href="/stakeholders"
            icon={<Network size={17} />}
          />
        </div>
      </section>

      <div className="intelligence-main-grid">
        <section className="surface intelligence-section" aria-labelledby="pipeline-heading">
          <div className="intelligence-section-heading">
            <div>
              <span className="eyebrow">Opportunity pipeline</span>
              <h2 id="pipeline-heading">From discovery to client action</h2>
            </div>
            <GitBranch size={20} aria-hidden="true" />
          </div>
          <p className="muted intelligence-section-note">
            Current lifecycle of {data.active.length} active vacancies. Each vacancy appears in one
            stage.
          </p>
          <div className="intelligence-pipeline" aria-label="Active vacancy counts by lifecycle">
            {data.lifecycle.map((stage, index) => (
              <div key={stage.status} className="intelligence-pipeline-stage">
                <div className="intelligence-bar-track">
                  <div
                    className={`intelligence-stage-bar intelligence-stage-${index}`}
                    style={{ height: `${(stage.count / maxStage) * 100}%` }}
                  />
                  <strong>{stage.count}</strong>
                </div>
                <span>{stage.label}</span>
              </div>
            ))}
          </div>
          <div className="intelligence-section-footer">
            <span className="muted">
              {snapshot.vacancies.length - data.active.length} closed vacancies excluded
            </span>
            <Link prefetch={false} href="/">
              Explore pipeline
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="intelligence-channel-grid">
            {data.channels.map((item) => (
              <div key={item.channel}>
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
          <p className="intelligence-small-note muted">
            Four independent research channels, counted by the vacancy’s recorded channel.
          </p>
        </section>

        <section
          className="surface intelligence-section intelligence-priorities"
          aria-labelledby="priorities-heading"
        >
          <div className="intelligence-section-heading">
            <div>
              <span className="eyebrow">Your next move</span>
              <h2 id="priorities-heading">Research priorities</h2>
            </div>
            <span className="intelligence-count">{data.priorities.length}</span>
          </div>
          <div className="intelligence-priority-summary">
            <CircleAlert size={19} aria-hidden="true" />
            <div>
              <strong>{data.priorities.length} active vacancies need attention</strong>
              <span>Evidence, employer identity or market coverage still needs work.</span>
            </div>
          </div>
          <div className="intelligence-priority-list">
            {data.priorities.slice(0, 4).map(({ role, reasons }) => (
              <Link
                prefetch={false}
                key={role.id}
                href={vacancyHref(role.id)}
                className="intelligence-priority-item"
              >
                <div
                  className={`intelligence-priority-dot ${role.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "urgent" : ""}`}
                />
                <div>
                  <strong>{role.title}</strong>
                  <span>{role.employerName}</span>
                  <small>
                    {reasons[0]}
                    {reasons.length > 1 ? ` · ${reasons.length - 1} more` : ""}
                  </small>
                </div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
          {!data.priorities.length ? (
            <EmptyState title="No outstanding research flags">
              Active vacancy employer, QA, candidate-map and stakeholder-map statuses are ready.
            </EmptyState>
          ) : null}
          <div className="intelligence-section-footer">
            <Link prefetch={false} href="/qa">
              Review independent QA
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="surface intelligence-recent" aria-labelledby="recent-heading">
          <div className="intelligence-section-heading">
            <div>
              <span className="eyebrow">Latest opportunities</span>
              <h2 id="recent-heading">Recently surfaced vacancies</h2>
            </div>
            <Link prefetch={false} href="/">
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Opportunity</th>
                  <th scope="col">Organisation</th>
                  <th scope="col">Research status</th>
                  <th scope="col">First seen</th>
                  <th scope="col">
                    <span className="sr-only">Open vacancy</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <Link
                        prefetch={false}
                        className="intelligence-record-title"
                        href={vacancyHref(role.id)}
                      >
                        {role.title}
                      </Link>
                      <span className="intelligence-cell-meta">
                        {role.location || "Location not recorded"}
                      </span>
                    </td>
                    <td>
                      <Link
                        prefetch={false}
                        href={organisationHref(employerKeys.get(role.id) ?? "")}
                      >
                        {role.employerName}
                      </Link>
                      <span className="intelligence-cell-meta">
                        {role.employerStatus === "CONFIRMED"
                          ? "Confirmed employer"
                          : `${role.employerStatus.toLowerCase()} employer identity`}
                      </span>
                    </td>
                    <td>
                      <Badge value={role.qaStatus} />
                      <span className="intelligence-cell-meta">
                        {LIFECYCLE_LABELS[role.lifecycleStatus]}
                      </span>
                    </td>
                    <td className="intelligence-nowrap">
                      {shortDate(role.firstSeen)}
                      {role.unread ? <span className="intelligence-new-label">Unread</span> : null}
                    </td>
                    <td>
                      <Link
                        prefetch={false}
                        href={vacancyHref(role.id)}
                        className="intelligence-icon-link"
                        aria-label={`Open ${role.title}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.recent.length ? (
            <EmptyState title="No active opportunities">
              Vacancies will appear here when they are available in this workspace.
            </EmptyState>
          ) : null}
        </section>

        <section
          className="surface intelligence-section intelligence-coverage"
          aria-labelledby="coverage-heading"
        >
          <div className="intelligence-section-heading">
            <div>
              <span className="eyebrow">Research depth</span>
              <h2 id="coverage-heading">Candidate-market coverage</h2>
            </div>
            <Users size={20} aria-hidden="true" />
          </div>
          <p className="muted intelligence-section-note">
            Persisted market summaries, with loaded assignment counts as a minimum, across active
            vacancies.
          </p>
          <div className="intelligence-coverage-stage">
            <span className="intelligence-coverage-icon">
              <Users size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>{data.market.credible}</strong>
              <span>Credible market memberships</span>
            </div>
          </div>
          <ArrowDownRight className="intelligence-coverage-arrow" size={18} aria-hidden="true" />
          <div className="intelligence-coverage-stage">
            <span className="intelligence-coverage-icon">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>{data.market.strongest}</strong>
              <span>Strongest market memberships</span>
            </div>
          </div>
          <ArrowDownRight className="intelligence-coverage-arrow" size={18} aria-hidden="true" />
          <div className="intelligence-coverage-stage highlight">
            <span className="intelligence-coverage-icon">
              <Users size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>{data.market.top10}</strong>
              <span>Top 10 memberships</span>
            </div>
          </div>
          <p className="intelligence-small-note muted">
            These are nested research layers. A person can belong to more than one vacancy market;
            totals are not unique people or a readiness score.
          </p>
          <div className="intelligence-section-footer">
            <Link prefetch={false} href="/candidates">
              Explore candidate markets
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="surface intelligence-section" aria-labelledby="activity-heading">
          <div className="intelligence-section-heading">
            <div>
              <span className="eyebrow">Research activity</span>
              <h2 id="activity-heading">Latest recorded runs</h2>
            </div>
            <Link prefetch={false} href="/runs">
              All runs
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="intelligence-run-list">
            {data.runs.map((run) => (
              <Link
                prefetch={false}
                className="intelligence-run-item"
                key={run.id}
                href={`/runs?run=${encodeURIComponent(run.id)}`}
              >
                <span className="intelligence-run-icon">
                  <Radar size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>{run.externalRunId}</strong>
                  <span>
                    {CHANNEL_LABELS[run.channel]} · {shortDate(run.startedAt)}
                  </span>
                </div>
                <Badge value={run.status} />
              </Link>
            ))}
          </div>
          {!data.runs.length ? (
            <EmptyState title="No research runs recorded">
              Published run summaries will appear here.
            </EmptyState>
          ) : null}
          <p className="intelligence-small-note muted">
            Run status is reported as stored. Publication receipts and independent persistence
            outcomes are not included in this snapshot.
          </p>
        </section>

        <section className="surface intelligence-section" aria-labelledby="commercial-heading">
          <div className="intelligence-section-heading">
            <div>
              <span className="eyebrow">Commercial focus</span>
              <h2 id="commercial-heading">Agreed-client opportunities</h2>
            </div>
            <BriefcaseBusiness size={20} aria-hidden="true" />
          </div>
          <div className="intelligence-commercial-summary">
            <strong>{data.commercial.length}</strong>
            <span>active vacancies marked agreed client or agreed group entity</span>
          </div>
          {data.commercial.slice(0, 3).map((role) => (
            <Link
              prefetch={false}
              key={role.id}
              className="intelligence-commercial-row"
              href={vacancyHref(role.id)}
            >
              <div>
                <strong>{role.title}</strong>
                <span>{role.employerName}</span>
              </div>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
          {!data.commercial.length ? (
            <p className="muted">No active vacancies with an agreed-client relationship.</p>
          ) : null}
          <div className="intelligence-commercial-notes">
            <span>
              <Clock3 size={15} aria-hidden="true" />
              {data.newCount} unread active opportunities
            </span>
            <span>Revenue and placement value: not available in REC records</span>
          </div>
        </section>
      </div>
    </div>
  );
}
