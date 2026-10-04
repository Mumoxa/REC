"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  CandidateAssignment,
  CandidateOperationalStatus,
  MarketBucket,
  Vacancy,
  WorkspaceSnapshot,
} from "@/lib/data/types";

type Density = "EXPANDED" | "COMPACT" | "MINIMAL";
type JobTab = "OVERVIEW" | "HIRING_TEAM" | "REQUIREMENTS" | "SOURCES" | "SEARCH_LOG" | "QA";

const channelLabels: Record<string, string> = {
  AGREED_CLIENTS: "Agreed Clients",
  AGENCY_SITES: "Agencies",
  LINKEDIN: "LinkedIn",
  JOB_BOARDS: "Job Boards",
};

const marketLabels: Record<MarketBucket, string> = {
  TOP_10: "Top 10",
  STRONG_MARKET: "Strong Market",
  LONGLIST: "Longlist",
  UNREVIEWED: "Unreviewed",
  EXCLUDED: "Excluded",
};

export function RecruitmentWorkspace({ initialSnapshot }: { initialSnapshot: WorkspaceSnapshot }) {
  const initialSavedViews = initialSnapshot.savedViews || [];
  const [vacancies, setVacancies] = useState(initialSnapshot.vacancies);
  const [selectedId, setSelectedId] = useState(initialSnapshot.vacancies[0]?.id ?? "");
  const [globalSearch, setGlobalSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [density, setDensity] = useState<Density>("EXPANDED");
  const [candidateFocus, setCandidateFocus] = useState(false);
  const [jobTab, setJobTab] = useState<JobTab>("OVERVIEW");
  const [marketFilter, setMarketFilter] = useState<MarketBucket | "ALL">("ALL");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [archiveFilter, setArchiveFilter] = useState<"ACTIVE" | "ARCHIVED" | "ALL">("ACTIVE");
  const [savedViews, setSavedViews] = useState(initialSavedViews);
  const [loadedViewName, setLoadedViewName] = useState<string>("");
  const [saveName, setSaveName] = useState<string>("");
  const [savingView, setSavingView] = useState(false);
  const [exclusionTarget, setExclusionTarget] = useState<{ candidateId: string; name: string } | null>(null);
  const [excludeReason, setExcludeReason] = useState<string>("NOT_SUBMITTED");
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("FILLED");

  const filteredVacancies = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return vacancies.filter((vacancy) => {
      const matchesQuery =
        !q ||
        [
          vacancy.title,
          vacancy.employerName,
          vacancy.location,
          vacancy.roleFamily,
          vacancy.sourceLabel,
          vacancy.requirements.map((r) => `${r.label} ${r.value}`).join(" "),
          vacancy.stakeholders.map((person) => `${person.name} ${person.title ?? ""} ${person.relevance ?? ""} ${person.observedBusinessEmail ?? ""} ${person.probableBusinessEmail ?? ""}`).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesChannel =
        channelFilter === "ALL" || vacancy.searchChannel === channelFilter;
      const matchesRegion = regionFilter === "ALL" || vacancy.region === regionFilter;
      const matchesArchive =
        archiveFilter === "ALL" ||
        (archiveFilter === "ACTIVE" && vacancy.lifecycleStatus !== "CLOSED") ||
        (archiveFilter === "ARCHIVED" && vacancy.lifecycleStatus === "CLOSED");
      return matchesQuery && matchesChannel && matchesRegion && matchesArchive;
    });
  }, [vacancies, globalSearch, channelFilter, regionFilter]);

  const selected =
    vacancies.find((vacancy) => vacancy.id === selectedId) ??
    filteredVacancies[0] ??
    vacancies[0];

  const visibleCandidates = useMemo(() => {
    if (!selected) return [];
    const q = candidateSearch.trim().toLowerCase();
    return selected.candidates
      .filter((candidate) => marketFilter === "ALL" || candidate.marketBucket === marketFilter)
      .filter((candidate) => {
        if (!q) return true;
        return [
          candidate.name,
          candidate.currentTitle,
          candidate.currentEmployer,
          candidate.location,
          candidate.whyFit,
          candidate.claims.map((claim) => `${claim.name} ${claim.value} ${claim.status}`).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  }, [selected, candidateSearch, marketFilter]);

  const selectedCandidate =
    selected?.candidates.find((candidate) => candidate.candidateId === selectedCandidateId) ?? null;

  const regions = useMemo(
    () => Array.from(new Set(vacancies.map((v) => v.region))).filter(Boolean),
    [vacancies]
  );

  const counts = useMemo(() => {
    const active = vacancies.filter((v) => v.lifecycleStatus !== "CLOSED");
    return {
      active: active.length,
      new: active.filter((v) => v.unread).length,
      needsResearch: active.filter((v) => v.qaStatus === "FAIL_RESEARCH_REQUIRED").length,
      top10Ready: active.filter((v) => v.lifecycleStatus === "TOP_10_READY").length,
    };
  }, [vacancies]);

  async function updateCandidateStatus(candidate: CandidateAssignment, status: CandidateOperationalStatus, reason?: string) {
    if (!selected) return;
    // Preserve evidence-backed market bucket; do not let recruiter action rewrite research.
    const previousStatus = candidate.operationalStatus;
    setSaving(`candidate:${candidate.candidateId}`);
    setVacancies((current) =>
      current.map((vacancy) =>
        vacancy.id !== selected.id
          ? vacancy
          : {
              ...vacancy,
              candidates: vacancy.candidates.map((item) =>
                item.candidateId === candidate.candidateId
                  ? {
                      ...item,
                      operationalStatus: status,
                      // marketBucket intentionally preserved from research
                    }
                  : item
              ),
            }
      )
    );

    if (!initialSnapshot.demoMode) {
      try {
        const res = await fetch("/api/ops/candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: selected.id,
            candidateId: candidate.candidateId,
            operationalStatus: status,
            ...(reason ? { reason } : {}),
          }),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
      } catch (err) {
        // Roll back optimistic change so failed mutation never lies to user.
        setVacancies((current) =>
          current.map((vacancy) =>
            vacancy.id !== selected.id
              ? vacancy
              : {
                  ...vacancy,
                  candidates: vacancy.candidates.map((item) =>
                    item.candidateId === candidate.candidateId
                      ? { ...item, operationalStatus: previousStatus }
                      : item
                  ),
                }
          )
        );
        alert("Failed to save candidate operation. Change was not saved.");
        setSaving(null);
        return;
      }
    }
    setSaving(null);
    // Clear exclusion confirmation if this was an exclusion with reason
    if (status === "EXCLUDED" && exclusionTarget) {
      setExclusionTarget(null);
      setExcludeReason("NOT_SUBMITTED");
    }
  }


  function restoreSavedView(view: typeof savedViews[0]) {
    if (!view) return;
    const s = view.viewState || {};
    if (typeof s.globalSearch === "string") setGlobalSearch(s.globalSearch);
    if (typeof s.channelFilter === "string") setChannelFilter(s.channelFilter);
    if (typeof s.regionFilter === "string") setRegionFilter(s.regionFilter);
    if (typeof s.archiveFilter === "string") setArchiveFilter(s.archiveFilter as typeof archiveFilter);
    if (typeof s.density === "string") setDensity(s.density as Density);
    if (typeof s.marketFilter === "string") setMarketFilter(s.marketFilter as MarketBucket | "ALL");
    if (typeof s.jobTab === "string") setJobTab(s.jobTab as JobTab);
    if (typeof s.candidateSearch === "string") setCandidateSearch(s.candidateSearch);
    setLoadedViewName(view.name);
  }

  async function saveCurrentView() {
    if (!saveName.trim()) return;
    setSavingView(true);
    const payload = {
      name: saveName.trim(),
      viewState: {
        globalSearch,
        channelFilter,
        regionFilter,
        archiveFilter,
        density,
        marketFilter,
        jobTab,
        candidateSearch,
      },
    };
    try {
      const res = await fetch("/api/ops/saved-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (json.savedView) {
        setSavedViews((prev) => {
          const idx = prev.findIndex((v) => v.name === json.savedView.name);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...json.savedView, viewState: json.savedView.view_state || payload.viewState };
            return copy;
          }
          return [...prev, { ...json.savedView, viewState: json.savedView.view_state || payload.viewState }];
        });
        setLoadedViewName(saveName.trim());
      }
      setSaveName("");
    } catch (e) {
      alert("Failed to save view.");
    } finally {
      setSavingView(false);
    }
  }
  async function closeVacancy() {
    if (!selected) return;
    // Accessibility repair: replacement for window.prompt is handled by an inline control below.
    // This keeps the old entry point but avoids the inaccessible browser prompt.
    // The UI control below will call confirmCloseVacancy directly.
  }
  async function confirmCloseVacancy(reason: string) {
    if (!selected) return;
    setSaving(`vacancy:${selected.id}`);
    const previousStatus = selected.lifecycleStatus;
    setVacancies((current) =>
      current.map((vacancy) =>
        vacancy.id === selected.id ? { ...vacancy, lifecycleStatus: "CLOSED" } : vacancy
      )
    );

    if (!initialSnapshot.demoMode) {
      try {
        const res = await fetch("/api/ops/vacancy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vacancyId: selected.id, action: "CLOSE", reason }),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch (err) {
        // Roll back so a failed mutation never appears saved.
        setVacancies((current) =>
          current.map((vacancy) =>
            vacancy.id === selected.id ? { ...vacancy, lifecycleStatus: previousStatus } : vacancy
          )
        );
        alert("Failed to close vacancy. Change was not saved.");
        setSaving(null);
        return;
      }
    }

    const next = filteredVacancies.find((v) => v.id !== selected.id && v.lifecycleStatus !== "CLOSED");
    if (next) {
      setSelectedId(next.id);
      setSelectedCandidateId(null);
      setJobTab("OVERVIEW");
    }
    setSaving(null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">TT</div>
          <div>
            <div className="brand-name">Talent Tree</div>
            <div className="brand-subtitle">Recruitment Intelligence</div>
          </div>
        </div>

        <div className="global-search-wrap">
          <span className="search-glyph">⌕</span>
          <input
            aria-label="Global vacancy search"
            className="global-search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search vacancies, employers, systems, requirements…"
          />
          {globalSearch && (
            <button className="clear-search" onClick={() => setGlobalSearch("")}>
              ×
            </button>
          )}
        </div>

        <div className="topbar-meta">
          <nav className="workspace-nav">
            <Link href="/">Vacancies</Link>
            <Link href="/companies">Companies</Link>
            <Link href="/runs">Runs</Link>
            <Link href="/qa">QA</Link>
          </nav>
          {initialSnapshot.demoMode ? (
            <span className="mode-badge demo">Demo mode</span>
          ) : (
            <span className="mode-badge live">Live</span>
          )}
          <span className="timestamp">
            Updated {new Date(initialSnapshot.generatedAt).toLocaleString()}
          </span>
        </div>
      </header>

      <section className="summary-strip">
        <SummaryStat label="Active vacancies" value={counts.active} />
        <SummaryStat label="New" value={counts.new} accent />
        <SummaryStat label="Needs research" value={counts.needsResearch} warn />
        <SummaryStat label="Top 10 ready" value={counts.top10Ready} />
        <div className="summary-spacer" />
        <button
          className={`focus-toggle ${candidateFocus ? "active" : ""}`}
          onClick={() => setCandidateFocus((value) => !value)}
        >
          {candidateFocus ? "Exit candidate focus" : "Candidate focus"}
        </button>
      </section>

      <section className={`workspace-grid ${candidateFocus ? "candidate-focus" : ""}`}>
        <aside className="vacancy-pane">
          <div className="pane-header">
            <div>
              <div className="eyebrow">Vacancies</div>
              <h1>Intelligence Inbox</h1>
            </div>
            <span className="count-pill">{filteredVacancies.length}</span>
          </div>

          <div className="filter-row">
            <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
              <option value="ALL">All channels</option>
              <option value="AGREED_CLIENTS">Agreed Clients</option>
              <option value="AGENCY_SITES">Agencies</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="JOB_BOARDS">Job Boards</option>
            </select>
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              <option value="ALL">All regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <select value={loadedViewName} onChange={(e) => {
              const view = savedViews.find((v) => v.name === e.target.value);
              if (view) restoreSavedView(view);
              else setLoadedViewName("");
            }} aria-label="Load saved view">
              <option value="">— Load view —</option>
              {savedViews.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
            <div className="save-view-row" style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
              <input aria-label="Saved view name" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="View name" style={{ width: "120px" }} />
              <button disabled={savingView || !saveName.trim()} onClick={saveCurrentView} aria-label="Save current view">Save</button>
            </div>
            <select value={archiveFilter} onChange={(event) => setArchiveFilter(event.target.value as typeof archiveFilter)} aria-label="Archive filter">
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="ALL">All</option>
            </select>
          </div>

          <div className="density-control">
            {(["EXPANDED", "COMPACT", "MINIMAL"] as Density[]).map((item) => (
              <button
                key={item}
                onClick={() => setDensity(item)}
                className={density === item ? "active" : ""}
              >
                {item === "EXPANDED" ? "Full" : item === "COMPACT" ? "Compact" : "Titles"}
              </button>
            ))}
          </div>

          <div className="vacancy-list">
            {filteredVacancies.map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                vacancy={vacancy}
                density={density}
                selected={selected?.id === vacancy.id}
                onSelect={() => {
                  setSelectedId(vacancy.id);
                  setSelectedCandidateId(null);
                  setJobTab("OVERVIEW");
                }}
              />
            ))}
            {filteredVacancies.length === 0 && (
              <div className="empty-state">No active vacancies match these filters.</div>
            )}
          </div>
        </aside>

        {!candidateFocus && selected && (
          <section className="job-pane">
            <div className="job-header">
              <div>
                <div className="job-title-row">
                  <h2>{selected.title}</h2>
                  {selected.clientStatus === "AGREED_CLIENT" && (
                    <span className="client-badge">Agreed client</span>
                  )}
                </div>
                <div className="job-employer">{selected.employerName}</div>
                <div className="job-meta">
                  <span>{selected.location}</span>
                  <span>•</span>
                  <span>{channelLabels[selected.searchChannel]}</span>
                  <span>•</span>
                  <span>{selected.sourceLabel}</span>
                </div>
              </div>
              {!closeConfirmOpen ? (
                <button
                  className="close-job-button"
                  onClick={() => setCloseConfirmOpen(true)}
                  disabled={saving === `vacancy:${selected.id}`}
                  aria-label="Close vacancy"
                >
                  Close job
                </button>
              ) : (
                <div className="close-confirm" role="region" aria-label="Close vacancy confirmation">
                  <label htmlFor="close-reason">Reason</label>
                  <select id="close-reason" value={closeReason} onChange={(e) => setCloseReason(e.target.value)}>
                    <option value="FILLED">FILLED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CLIENT_NO_LONGER_HIRING">CLIENT_NO_LONGER_HIRING</option>
                    <option value="NOT_COMMERCIALLY_RELEVANT">NOT_COMMERCIALLY_RELEVANT</option>
                    <option value="DUPLICATE">DUPLICATE</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                  <button onClick={() => { confirmCloseVacancy(closeReason); setCloseConfirmOpen(false); }} disabled={saving === `vacancy:${selected.id}`} aria-label="Confirm close">Confirm</button>
                  <button onClick={() => setCloseConfirmOpen(false)} aria-label="Cancel close">Cancel</button>
                </div>
              )}
            </div>

            <div className="status-line">
              <StatusPill text={selected.lifecycleStatus.replaceAll("_", " ")} />
              <QaPill status={selected.qaStatus} />
              <StatusPill text={`Employer: ${selected.employerStatus}`} subtle />
              <StatusPill text={`Map: ${selected.candidateMapStatus.replaceAll("_", " ")}`} subtle />
            </div>

            <div className="date-line">
              <span>First seen {formatDate(selected.firstSeen)}</span>
              {selected.lastVerified && <span>Last verified {formatDate(selected.lastVerified)}</span>}
              <span>{selected.sources.length} source{selected.sources.length === 1 ? "" : "s"}</span>
            </div>

            <nav className="job-tabs">
              {(["OVERVIEW", "HIRING_TEAM", "REQUIREMENTS", "SOURCES", "SEARCH_LOG", "QA"] as JobTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    className={jobTab === tab ? "active" : ""}
                    onClick={() => setJobTab(tab)}
                  >
                    {tab === "SEARCH_LOG" ? "Search log" : tab === "HIRING_TEAM" ? "Hiring team" : tab[0] + tab.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </nav>

            <div className="job-content">
              {jobTab === "OVERVIEW" && <Overview vacancy={selected} />}
              {jobTab === "HIRING_TEAM" && <HiringTeam vacancy={selected} />}
              {jobTab === "REQUIREMENTS" && <Requirements vacancy={selected} />}
              {jobTab === "SOURCES" && <Sources vacancy={selected} />}
              {jobTab === "SEARCH_LOG" && <SearchLog vacancy={selected} />}
              {jobTab === "QA" && <QaPanel vacancy={selected} />}
            </div>
          </section>
        )}

        <section className="candidate-pane">
          {selected ? (
            <>
              <div className="candidate-header">
                <div>
                  <div className="eyebrow">Relevant people</div>
                  <h2>{selected.candidates.length} mapped candidates</h2>
                  {candidateFocus && (
                    <div className="candidate-context">
                      {selected.title} · {selected.employerName}
                    </div>
                  )}
                </div>
                <div className="candidate-counts">
                  <span>{selected.candidates.filter((c) => c.marketBucket === "TOP_10").length} Top 10</span>
                </div>
              </div>

              <div className="candidate-search-row">
                <input
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="Search this candidate market…"
                />
                <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value as MarketBucket | "ALL")}>
                  <option value="ALL">All buckets</option>
                  {(Object.keys(marketLabels) as MarketBucket[]).map((bucket) => (
                    <option key={bucket} value={bucket}>
                      {marketLabels[bucket]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="market-tabs">
                <button className={marketFilter === "ALL" ? "active" : ""} onClick={() => setMarketFilter("ALL")}>
                  All
                </button>
                {(Object.keys(marketLabels) as MarketBucket[]).map((bucket) => (
                  <button
                    key={bucket}
                    className={marketFilter === bucket ? "active" : ""}
                    onClick={() => setMarketFilter(bucket)}
                  >
                    {marketLabels[bucket]}{" "}
                    <span>{selected.candidates.filter((c) => c.marketBucket === bucket).length}</span>
                  </button>
                ))}
              </div>

              <div className="candidate-list">
                {visibleCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.assignmentId}
                    candidate={candidate}
                    selected={selectedCandidate?.candidateId === candidate.candidateId}
                    saving={saving === `candidate:${candidate.candidateId}`}
                    onOpen={() =>
                      setSelectedCandidateId((current) =>
                        current === candidate.candidateId ? null : candidate.candidateId
                      )
                    }
                    onStatus={(status, reason) => updateCandidateStatus(candidate, status, reason)}
                    exclusionTarget={exclusionTarget}
                    onExcludeStart={(id, name) => { setExclusionTarget({ candidateId: id, name }); setExcludeReason("NOT_SUBMITTED"); }}
                    excludeReason={excludeReason}
                    onExcludeReasonChange={setExcludeReason}
                    onExcludeConfirm={() => { if (exclusionTarget) updateCandidateStatus(candidate, "EXCLUDED", excludeReason); }}
                    onExcludeCancel={() => { setExclusionTarget(null); setExcludeReason("NOT_SUBMITTED"); }}
                  />
                ))}
                {visibleCandidates.length === 0 && (
                  <div className="empty-state">
                    {selected.candidates.length === 0
                      ? "Candidate market mapping has not started for this vacancy."
                      : "No candidates match this filter."}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">Select a vacancy to open its candidate market.</div>
          )}
        </section>
      </section>
    </main>
  );
}

function VacancyCard({
  vacancy,
  density,
  selected,
  onSelect,
}: {
  vacancy: Vacancy;
  density: Density;
  selected: boolean;
  onSelect: () => void;
}) {
  const top10 = vacancy.candidates.filter((c) => c.marketBucket === "TOP_10").length;
  return (
    <button className={`vacancy-card ${selected ? "selected" : ""} ${density.toLowerCase()}`} onClick={onSelect}>
      <div className="vacancy-card-top">
        <div className="vacancy-title">{vacancy.title}</div>
        {vacancy.unread && <span className="new-dot" title="New" />}
      </div>
      {density !== "MINIMAL" && (
        <div className="vacancy-employer">{vacancy.employerName}</div>
      )}
      {density === "EXPANDED" && (
        <>
          <div className="vacancy-detail-line">
            <span>{vacancy.location}</span>
            <span>·</span>
            <span>{vacancy.sourceLabel}</span>
          </div>
          <div className="vacancy-badges">
            {vacancy.clientStatus === "AGREED_CLIENT" && <span className="mini-badge client">Agreed</span>}
            <span className={`mini-badge qa ${vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "fail" : ""}`}>
              {vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "Research" : "QA ✓"}
            </span>
          </div>
          <div className="vacancy-stats">
            <span>{vacancy.candidates.length} mapped</span>
            <span>{top10} Top 10</span>
          </div>
        </>
      )}
      {density === "COMPACT" && (
        <div className="vacancy-detail-line">
          <span>{vacancy.location}</span>
          <span>·</span>
          <span>{vacancy.candidates.length} candidates</span>
        </div>
      )}
    </button>
  );
}

function Overview({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="stack-lg">
      <p className="summary-copy">{vacancy.summary}</p>
      <div className="section-title">Priority requirements</div>
      <div className="requirements-grid">
        {vacancy.requirements.slice(0, 6).map((requirement) => (
          <div className="requirement-card" key={requirement.id}>
            <div className="requirement-label">{requirement.label}</div>
            <div className="requirement-value">{requirement.value}</div>
            <EvidencePill status={requirement.status} />
          </div>
        ))}
      </div>
      <div className="section-title">Market progress</div>
      <div className="progress-grid">
        <MetricCard label="Sources" value={vacancy.sources.length} />
        <MetricCard label="Queries run" value={vacancy.researchQueries.filter((q) => q.executionStatus === "EXECUTED").length} />
        <MetricCard label="Hiring team" value={vacancy.stakeholders.length} />
        <MetricCard label="Candidates" value={vacancy.candidates.length} />
        <MetricCard label="Top 10" value={vacancy.candidates.filter((c) => c.marketBucket === "TOP_10").length} />
      </div>
    </div>
  );
}

function HiringTeam({ vacancy }: { vacancy: Vacancy }) {
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
          <small>{intel?.observedBusinessEmailExamples?.join(" · ") || "No public examples stored"}</small>
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
            <article className="stakeholder-card" key={person.id}>
              <div className="stakeholder-head">
                <div>
                  <strong>{person.name}</strong>
                  <div className="muted">{person.title || "Title unresolved"}</div>
                </div>
                <div className="stakeholder-pills">
                  {person.relevance && <StatusPill text={person.relevance.replaceAll("_", " ")} subtle />}
                  <EvidencePill status={person.evidenceStatus} />
                </div>
              </div>

              {person.reasonRelevant && <p>{person.reasonRelevant}</p>}

              <div className="stakeholder-grid">
                <div>
                  <span>Employment</span>
                  <strong>{person.currentEmploymentStatus?.replaceAll("_", " ") || "Unknown"}</strong>
                </div>
                <div>
                  <span>Observed business email</span>
                  <strong>{person.observedBusinessEmail || "—"}</strong>
                </div>
                <div>
                  <span>Probable business email</span>
                  <strong>{person.probableBusinessEmail || "—"}</strong>
                </div>
                <div>
                  <span>Email status</span>
                  <strong>{person.emailStatus?.replaceAll("_", " ") || "UNKNOWN"}</strong>
                </div>
              </div>

              {(person.emailPatternBasis || person.emailConfidenceNote) && (
                <div className="stakeholder-evidence-note">
                  {person.emailPatternBasis && <span><b>Pattern:</b> {person.emailPatternBasis}</span>}
                  {person.emailConfidenceNote && <span><b>Confidence:</b> {person.emailConfidenceNote}</span>}
                </div>
              )}

              <div className="stakeholder-links">
                {person.profileUrl && (
                  <a href={person.profileUrl} target="_blank" rel="noreferrer">Profile</a>
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

function Requirements({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="data-table">
      <div className="data-row header">
        <span>Requirement</span><span>Value</span><span>Type</span><span>Evidence</span>
      </div>
      {vacancy.requirements.map((r) => (
        <div className="data-row" key={r.id}>
          <strong>{r.label}</strong><span>{r.value}</span><span>{r.type}</span><EvidencePill status={r.status} />
        </div>
      ))}
    </div>
  );
}

function Sources({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="source-list">
      {vacancy.sources.map((source) => (
        <div className="source-item" key={source.id}>
          <div>
            <strong>{source.name}</strong>
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

function SearchLog({ vacancy }: { vacancy: Vacancy }) {
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

function QaPanel({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="qa-panel">
      <div className="qa-hero">
        <QaPill status={vacancy.qaStatus} />
        <div>
          <strong>Discovery / opportunity QA</strong>
          <p>
            The workspace never upgrades unknown information because it would make the record easier to use.
            Evidence status remains visible through downstream candidate work.
          </p>
        </div>
      </div>
      <div className="section-title">Current unresolved areas</div>
      <div className="unknown-list">
        {vacancy.employerStatus !== "CONFIRMED" && <span>Employer: {vacancy.employerStatus}</span>}
        {vacancy.requirements.filter((r) => r.status === "UNKNOWN" || r.status === "HYPOTHESIS").map((r) => (
          <span key={r.id}>{r.label}: {r.status}</span>
        ))}
        {vacancy.qaStatus === "PASS" && vacancy.employerStatus === "CONFIRMED" && (
          <span>No material discovery-level unknowns currently block the workflow.</span>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  saving,
  onOpen,
  onStatus,
  exclusionTarget,
  onExcludeStart,
  excludeReason,
  onExcludeReasonChange,
  onExcludeConfirm,
  onExcludeCancel,
}: {
  candidate: CandidateAssignment;
  selected: boolean;
  saving: boolean;
  onOpen: () => void;
  onStatus: (status: CandidateOperationalStatus, reason?: string) => void;
  exclusionTarget?: { candidateId: string; name: string } | null;
  onExcludeStart?: (candidateId: string, name: string) => void;
  excludeReason?: string;
  onExcludeReasonChange?: (reason: string) => void;
  onExcludeConfirm?: () => void;
  onExcludeCancel?: () => void;
}) {
  return (
    <article className={`candidate-card ${selected ? "open" : ""}`}>
      <button className="candidate-main" onClick={onOpen}>
        <div className="candidate-rank">{candidate.rank ? `#${candidate.rank}` : candidate.comparableTier ? `T${candidate.comparableTier}` : "•"}</div>
        <div className="candidate-identity">
          <div className="candidate-name">{candidate.name}</div>
          <div className="candidate-role">{candidate.currentTitle}</div>
          <div className="candidate-company">{candidate.currentEmployer} · {candidate.location}</div>
        </div>
        <div className="candidate-side">
          <span className={`bucket-badge ${candidate.marketBucket.toLowerCase()}`}>{marketLabels[candidate.marketBucket]}</span>
          <QaPill status={candidate.qaStatus} compact />
        </div>
      </button>

      <div className="candidate-actions">
        <button disabled={saving} onClick={() => onStatus("EARMARKED")} className={candidate.operationalStatus === "EARMARKED" ? "active" : ""}>Earmark</button>
        <button disabled={saving} onClick={() => onStatus("TOP_10")} className={candidate.operationalStatus === "TOP_10" ? "active" : ""}>Top 10</button>
        <button disabled={saving} onClick={() => onStatus("APPROACH")} className={candidate.operationalStatus === "APPROACH" ? "active" : ""}>Approach</button>
        {exclusionTarget?.candidateId === candidate.candidateId ? (
          <div className="exclusion-confirm" role="region" aria-label="Confirm exclusion">
            <label htmlFor={`exclude-reason-${candidate.candidateId}`}>Reason</label>
            <select id={`exclude-reason-${candidate.candidateId}`} value={excludeReason ?? "NOT_SUBMITTED"} onChange={(e) => onExcludeReasonChange?.(e.target.value)}>
              <option value="NOT_SUBMITTED">NOT_SUBMITTED</option>
              <option value="NO_LONGER_RELEVANT">NO_LONGER_RELEVANT</option>
              <option value="COMPETITOR_EXCLUSIVE">COMPETITOR_EXCLUSIVE</option>
              <option value="CLIENT_INSTRUCTED">CLIENT_INSTRUCTED</option>
              <option value="OTHER">OTHER</option>
            </select>
            <button onClick={() => onExcludeConfirm?.()} aria-label="Confirm exclusion">Confirm</button>
            <button onClick={() => onExcludeCancel?.()} aria-label="Cancel exclusion">Cancel</button>
          </div>
        ) : (
          <button disabled={saving} onClick={() => onExcludeStart?.(candidate.candidateId, candidate.name)} className="danger-lite">Exclude</button>
        )}
      </div>

      {selected && (
        <div className="candidate-detail">
          <p className="why-fit">{candidate.whyFit}</p>
          <div className="claim-grid">
            {candidate.claims.map((claim) => (
              <div className="claim-row" key={`${claim.name}-${claim.value}`}>
                <span>{claim.name}</span><strong>{claim.value}</strong><EvidencePill status={claim.status} />
              </div>
            ))}
          </div>
          {!!candidate.evidenceGaps.length && (
            <>
              <div className="section-title small">Still unknown</div>
              <div className="gap-list">{candidate.evidenceGaps.map((gap) => <span key={gap}>{gap}</span>)}</div>
            </>
          )}
          {candidate.lastVerified && <div className="verified-line">Verified {formatDate(candidate.lastVerified)}</div>}
        </div>
      )}
    </article>
  );
}

function SummaryStat({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return <div className={`summary-stat ${accent ? "accent" : ""} ${warn ? "warn" : ""}`}><strong>{value}</strong><span>{label}</span></div>;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>;
}

function StatusPill({ text, subtle }: { text: string; subtle?: boolean }) {
  return <span className={`status-pill ${subtle ? "subtle" : ""}`}>{text}</span>;
}

function QaPill({ status, compact }: { status: string; compact?: boolean }) {
  const className = status === "PASS" ? "pass" : status === "FAIL_RESEARCH_REQUIRED" ? "fail" : "unknowns";
  const label = status === "PASS_WITH_UNKNOWNS" ? "PASS + unknowns" : status === "FAIL_RESEARCH_REQUIRED" ? "Research required" : "QA passed";
  return <span className={`qa-pill ${className} ${compact ? "compact" : ""}`}>{label}</span>;
}

function EvidencePill({ status }: { status: string }) {
  return <span className={`evidence-pill ${status.toLowerCase()}`}>{status}</span>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
