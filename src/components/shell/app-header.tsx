import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared application header. Used by the recruitment workspace and every
 * secondary route so navigation is predictable across the application.
 *
 * Presentation only: it reads no data and changes no state. Environment is
 * always shown as text ("Demo data" / "Live"), never colour alone.
 */

export type AppSection = "VACANCIES" | "COMPANIES" | "RUNS" | "QA";

export const APP_SECTIONS: ReadonlyArray<{ id: AppSection; label: string; href: string }> = [
  { id: "VACANCIES", label: "Vacancies", href: "/" },
  { id: "COMPANIES", label: "Companies", href: "/companies" },
  { id: "RUNS", label: "Runs", href: "/runs" },
  { id: "QA", label: "QA", href: "/qa" },
];

const timeFormatter = new Intl.DateTimeFormat("en-ZA", {
  timeZone: "Africa/Johannesburg",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Fixed locale and zone so server and browser render the same text (no hydration drift). */
export function formatSast(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return `${timeFormatter.format(date)} SAST`;
}

export function AppHeader({
  current,
  demoMode,
  generatedAt,
  search,
}: {
  current: AppSection;
  demoMode: boolean;
  generatedAt?: string;
  search?: ReactNode;
}) {
  return (
    <header className="app-header" role="banner">
      <a href="https://talenttree.co.za" className="app-brand" aria-label="Talent Tree home">
        {/* Official logo asset; the adjacent text lockup carries the name. */}
        <img
          src="/talent-tree-logo.png"
          alt=""
          aria-hidden="true"
          className="app-brand-logo"
          width={132}
          height={108}
        />
        <span className="app-brand-lockup">
          <span className="app-brand-name">Talent Tree</span>
          <span className="app-brand-sub">Recruitment Intelligence</span>
        </span>
      </a>

      {search ? <div className="app-header-search">{search}</div> : null}

      <nav className="app-nav" aria-label="Primary">
        {APP_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            aria-current={section.id === current ? "page" : undefined}
            className="app-nav-link"
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="app-header-end">
        <span
          className={`env-badge ${demoMode ? "demo" : "live"}`}
          title={
            demoMode
              ? "Demo workspace: synthetic records. Nothing here is live REC data."
              : "Live REC workspace: records are read from the canonical datastore."
          }
        >
          <span className="env-dot" aria-hidden="true" />
          {demoMode ? "Demo data" : "Live"}
        </span>
        {generatedAt ? (
          <time className="app-meta-time" dateTime={generatedAt}>
            Updated {formatSast(generatedAt)}
          </time>
        ) : null}
      </div>
    </header>
  );
}
