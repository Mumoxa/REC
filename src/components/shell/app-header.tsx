"use client";

import Link from "next/link";
import { TalentTreeLogo } from "@/components/ui/talent-tree-logo";
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Command,
  GitBranch,
  Menu,
  Search,
  ShieldCheck,
  Users,
  UserRoundSearch,
} from "lucide-react";
import type { WorkspaceSnapshot } from "@/lib/data/types";
import { Dialog } from "@/components/ui/primitives";

export type AppSection =
  "INTELLIGENCE" | "VACANCIES" | "COMPANIES" | "CANDIDATES" | "STAKEHOLDERS" | "RUNS" | "QA";
export const APP_SECTIONS: ReadonlyArray<{
  id: AppSection;
  label: string;
  href: string;
  description: string;
}> = [
  {
    id: "INTELLIGENCE",
    label: "Intelligence",
    href: "/intelligence",
    description: "Your operating overview",
  },
  {
    id: "COMPANIES",
    label: "Organisations",
    href: "/companies",
    description: "Clients & employer intelligence",
  },
  { id: "VACANCIES", label: "Vacancies", href: "/", description: "Opportunities & research" },
  {
    id: "CANDIDATES",
    label: "Candidate markets",
    href: "/candidates",
    description: "People, fit & evidence",
  },
  {
    id: "STAKEHOLDERS",
    label: "Hiring stakeholders",
    href: "/stakeholders",
    description: "Decision-maker intelligence",
  },
  { id: "QA", label: "Evidence & QA", href: "/qa", description: "Confidence behind decisions" },
  {
    id: "RUNS",
    label: "Research runs",
    href: "/runs",
    description: "Progress & published records",
  },
];
const icons = {
  INTELLIGENCE: Activity,
  COMPANIES: Building2,
  VACANCIES: BriefcaseBusiness,
  CANDIDATES: Users,
  STAKEHOLDERS: UserRoundSearch,
  QA: ShieldCheck,
  RUNS: GitBranch,
};
const timeFormatter = new Intl.DateTimeFormat("en-ZA", {
  timeZone: "Africa/Johannesburg",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
export function formatSast(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown time" : `${timeFormatter.format(date)} SAST`;
}

type SearchResult = { key: string; kind: string; title: string; detail: string; href: string };
function indexRecords(snapshot: WorkspaceSnapshot): SearchResult[] {
  const records: SearchResult[] = [];
  const people = new Set<string>();
  const companies = new Set<string>();
  for (const v of snapshot.vacancies) {
    records.push({
      key: `v-${v.id}`,
      kind: "Vacancy",
      title: v.title,
      detail: `${v.employerName} · ${v.location}`,
      href: `/?vacancy=${encodeURIComponent(v.id)}`,
    });
    if (v.employerStatus !== "UNKNOWN" && !companies.has(v.employerName)) {
      companies.add(v.employerName);
      records.push({
        key: `o-${v.id}`,
        kind: "Organisation",
        title: v.employerName,
        detail: `${v.employerStatus.toLowerCase()} employer · ${v.location}`,
        href: `/companies?q=${encodeURIComponent(v.employerName)}`,
      });
    }
    for (const c of v.candidates) {
      if (people.has(c.candidateId)) continue;
      people.add(c.candidateId);
      records.push({
        key: `c-${c.candidateId}`,
        kind: "Candidate",
        title: c.name,
        detail: `${c.currentTitle} · ${c.currentEmployer} · ${c.location}`,
        href: `/candidates?candidate=${encodeURIComponent(c.candidateId)}&vacancy=${encodeURIComponent(v.id)}`,
      });
    }
    for (const s of v.stakeholders)
      records.push({
        key: `s-${v.id}-${s.id}`,
        kind: "Stakeholder",
        title: s.name,
        detail: `${s.title ?? "Title unavailable"} · ${v.employerName} · ${v.title}`,
        href: `/stakeholders?stakeholder=${encodeURIComponent(s.id)}&vacancy=${encodeURIComponent(v.id)}`,
      });
  }
  for (const r of snapshot.runs)
    records.push({
      key: `r-${r.id}`,
      kind: "Research run",
      title: r.externalRunId,
      detail: `${r.channel} · ${r.status}`,
      href: `/runs?q=${encodeURIComponent(r.externalRunId)}`,
    });
  return records;
}

function matchingRecords(records: SearchResult[], query: string): SearchResult[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return records.filter((record) =>
    terms.every((term) =>
      `${record.title} ${record.detail} ${record.kind}`.toLowerCase().includes(term)
    )
  );
}

export function searchRecords(snapshot: WorkspaceSnapshot, query: string): SearchResult[] {
  return matchingRecords(indexRecords(snapshot), query);
}

export function AppHeader({
  current,
  demoMode,
  generatedAt,
  search,
  snapshot,
}: {
  current: AppSection;
  demoMode: boolean;
  generatedAt?: string;
  search?: ReactNode;
  snapshot?: WorkspaceSnapshot;
}) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const records = useMemo(
    () => (searchOpen && snapshot ? indexRecords(snapshot) : []),
    [snapshot, searchOpen]
  );
  const results = useMemo(() => matchingRecords(records, deferredQuery), [records, deferredQuery]);
  const section = APP_SECTIONS.find((s) => s.id === current);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);
  const counts: Partial<Record<AppSection, number>> = snapshot
    ? {
        VACANCIES: snapshot.vacancies.filter((v) => v.lifecycleStatus !== "CLOSED").length,
        CANDIDATES: new Set(
          snapshot.vacancies.flatMap((v) => v.candidates.map((c) => c.candidateId))
        ).size,
        STAKEHOLDERS: snapshot.vacancies.reduce((n, v) => n + v.stakeholders.length, 0),
        RUNS: snapshot.runs.length,
      }
    : {};
  const navigation = (
    <nav className="app-nav" aria-label="Primary">
      {APP_SECTIONS.map((item) => {
        const Icon = icons[item.id];
        return (
          <Link
            prefetch={false}
            key={item.id}
            href={item.href}
            aria-current={item.id === current ? "page" : undefined}
            className="app-nav-link"
            onClick={() => setNavigationOpen(false)}
          >
            <span className="nav-icon">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="nav-copy">
              <span>{item.label}</span>
              <small>{item.description}</small>
            </span>
            {counts[item.id] !== undefined && (
              <span
                className="nav-count"
                aria-label={`${counts[item.id]} ${item.id === "STAKEHOLDERS" ? "vacancy associations" : "records"}`}
              >
                {counts[item.id]}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
  const brand = (
    <Link
      prefetch={false}
      href="/intelligence"
      className="app-brand"
      aria-label="Talent Tree intelligence"
    >
      <span className="brand-mark">
        <TalentTreeLogo decorative />
      </span>
      <span>
        <strong>Talent Tree</strong>
        <small>Recruitment intelligence</small>
      </span>
    </Link>
  );
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="app-sidebar" aria-label="Workspace navigation">
        <div className="sidebar-brand">
          {brand}
          <p>
            Every opportunity.
            <br />
            Connected to intelligence.
          </p>
        </div>
        {navigation}
        <div className="sidebar-context">
          <p className="sidebar-caption">Research principles</p>
          <div>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>Evidence before confidence</span>
          </div>
          <p>
            Four independent channels.
            <br />
            One connected workspace.
          </p>
        </div>
        <div className="sidebar-footer">
          <span className="workspace-avatar">TT</span>
          <div>
            <strong>{snapshot?.workspaceName ?? "REC workspace"}</strong>
            <small>{demoMode ? "Synthetic demonstration" : "Authorised workspace"}</small>
          </div>
          <Link
            prefetch={false}
            href="/login"
            aria-label="Account and sign in"
            className="sidebar-account"
          >
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <header className="utility-topbar" role="banner">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          onClick={() => setNavigationOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>
        <Link
          prefetch={false}
          href="/intelligence"
          className="utility-brand"
          aria-label="Talent Tree intelligence"
        >
          <TalentTreeLogo decorative />
          <span>Talent Tree</span>
        </Link>
        <span className="utility-section">{section?.label}</span>
        <button
          type="button"
          className="global-search-trigger"
          aria-label="Search intelligence"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={17} aria-hidden="true" />
          <span>Search intelligence…</span>
          <kbd>
            <Command size={12} aria-hidden="true" /> K
          </kbd>
        </button>
        <span
          className={`env-badge ${demoMode ? "demo" : "live"}`}
          title={
            demoMode
              ? "Synthetic records. Recruiter changes are temporary."
              : "Authorised records from the canonical datastore."
          }
        >
          <span className="env-dot" />
          {demoMode ? "Demo data" : "Live"}
        </span>
        {generatedAt && (
          <time className="app-meta-time" dateTime={generatedAt}>
            Updated {formatSast(generatedAt)}
          </time>
        )}
      </header>
      {search && <div className="workspace-search-slot">{search}</div>}
      {navigationOpen && (
        <Dialog
          title="Navigation"
          onClose={() => setNavigationOpen(false)}
          className="mobile-navigation"
        >
          {brand}
          {navigation}
        </Dialog>
      )}
      {searchOpen && (
        <Dialog
          title="Search intelligence"
          onClose={() => setSearchOpen(false)}
          className="global-search-dialog"
        >
          <label className="field">
            Search authorised records
            <input
              data-autofocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, employer, role or location"
            />
          </label>
          <p className="muted search-scope">
            {snapshot
              ? "Scope: loaded workspace vacancies, employers, candidates, stakeholder associations and runs."
              : "Scope: vacancy workspace. Open the results to search stored intelligence."}
          </p>
          {snapshot ? (
            <>
              <div className="search-results" aria-live="polite">
                {query.trim() ? (
                  results.length ? (
                    results.slice(0, 30).map((result) => (
                      <Link
                        prefetch={false}
                        key={result.key}
                        href={result.href}
                        onClick={() => setSearchOpen(false)}
                      >
                        <span>
                          <small>{result.kind}</small>
                          <strong>{result.title}</strong>
                          <span>{result.detail}</span>
                        </span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    ))
                  ) : (
                    <p>No matching records. Try a different name or role.</p>
                  )
                ) : (
                  <p className="search-prompt">
                    Find the people, opportunities and evidence behind your next decision.
                  </p>
                )}
              </div>
              {results.length > 30 && (
                <p className="muted">
                  Showing the first 30 of {results.length} matches. Refine your search.
                </p>
              )}
            </>
          ) : (
            <Link
              prefetch={false}
              className="btn btn-primary"
              href={`/?q=${encodeURIComponent(query)}`}
            >
              Search vacancies
            </Link>
          )}
        </Dialog>
      )}
    </>
  );
}
