import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { APP_SECTIONS, AppHeader, formatSast } from "@/components/shell/app-header";

describe("AppHeader", () => {
  it("marks exactly one primary navigation item as the current page", () => {
    render(<AppHeader current="RUNS" demoMode generatedAt="2026-10-04T06:00:00+02:00" />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");

    expect(links.map((link) => link.querySelector(".nav-copy > span")?.textContent)).toEqual([
      "Intelligence",
      "Organisations",
      "Vacancies",
      "Candidate markets",
      "Hiring stakeholders",
      "Evidence & QA",
      "Research runs",
    ]);
    const current = links.filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Research runs");
  });

  it("routes the full navigation to working REC pages", () => {
    expect(APP_SECTIONS.map((section) => [section.label, section.href])).toEqual([
      ["Intelligence", "/intelligence"],
      ["Organisations", "/companies"],
      ["Vacancies", "/"],
      ["Candidate markets", "/candidates"],
      ["Hiring stakeholders", "/stakeholders"],
      ["Evidence & QA", "/qa"],
      ["Research runs", "/runs"],
    ]);
  });

  it("states the environment as text, not colour alone", () => {
    const { unmount } = render(<AppHeader current="VACANCIES" demoMode />);
    expect(screen.getByText("Demo data")).toBeInTheDocument();
    unmount();

    render(<AppHeader current="VACANCIES" demoMode={false} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.queryByText("Demo data")).not.toBeInTheDocument();
  });

  it("renders the timestamp in SAST with a machine-readable time", () => {
    const { container } = render(
      <AppHeader current="VACANCIES" demoMode={false} generatedAt="2026-10-04T06:00:00+02:00" />
    );
    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time?.getAttribute("datetime")).toBe("2026-10-04T06:00:00+02:00");
    expect(time).toHaveTextContent(/SAST$/);
    expect(time).toHaveTextContent("06:00");
  });

  it("renders an optional search slot inside the header", () => {
    render(<AppHeader current="VACANCIES" demoMode search={<input aria-label="Probe search" />} />);
    expect(screen.getByLabelText("Probe search")).toBeInTheDocument();
  });
});

describe("formatSast", () => {
  it("formats an instant in Africa/Johannesburg regardless of the input offset", () => {
    // 04:00 UTC is 06:00 SAST (UTC+2, no daylight saving).
    expect(formatSast("2026-10-04T04:00:00Z")).toMatch(/06:00 SAST$/);
    expect(formatSast("2026-10-04T06:00:00+02:00")).toMatch(/06:00 SAST$/);
  });

  it("returns a plain fallback for values that are not dates", () => {
    expect(formatSast("not-a-date")).toBe("Unknown time");
  });
});
