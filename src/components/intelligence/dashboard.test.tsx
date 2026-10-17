import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { IntelligenceDashboard } from "./dashboard";

describe("intelligence overview", () => {
  it("shows snapshot scope and connects research priorities to canonical vacancies", () => {
    render(<IntelligenceDashboard snapshot={demoSnapshot} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Every opportunity.Connected to intelligence."
    );
    expect(screen.getByText(/Demo intelligence/)).toBeInTheDocument();
    expect(screen.getByText("Unique loaded people across all vacancies")).toBeInTheDocument();
    expect(screen.getByText("Vacancy-specific stakeholder associations")).toBeInTheDocument();
    expect(
      screen.getByText(/totals are not unique people or a readiness score/)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open research workspace" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/\?vacancy=vac-/)
    );
    expect(
      screen
        .getAllByRole("link", { name: "Financial Manager" })
        .every((link) => link.getAttribute("href")?.includes("vacancy="))
    ).toBe(true);
  });

  it("renders empty authorised workspaces without fabricated counts or activity", () => {
    render(
      <IntelligenceDashboard
        snapshot={{ ...demoSnapshot, demoMode: false, vacancies: [], runs: [] }}
      />
    );
    expect(screen.getByText("No active opportunities")).toBeInTheDocument();
    expect(screen.getByText("No research runs recorded")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open research workspace" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(
      screen.getByText("Revenue and placement value: not available in REC records")
    ).toBeInTheDocument();
  });
});
