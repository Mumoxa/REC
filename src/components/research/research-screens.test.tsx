import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { demoSnapshot } from "@/lib/data/demo";
import type { Vacancy } from "@/lib/data/types";
import { StakeholderDirectory } from "./stakeholder-directory";
import { EvidenceWorkspace } from "./evidence-workspace";
import { RunHistory } from "./run-history";

const base = demoSnapshot.vacancies[0];
const stakeholder = {
  id: "person-1",
  key: "shared-key",
  name: "Alex Researcher",
  title: "Finance Director",
  relevance: "PRIMARY_HIRING_OWNER" as const,
  observedBusinessEmail: "alex@observed.example",
  probableBusinessEmail: "a.researcher@inferred.example",
  emailStatus: "PATTERN_INFERRED" as const,
  evidenceStatus: "PROBABLE" as const,
  currentEmploymentStatus: "CURRENT_PROBABLE",
  lastVerified: "2026-10-15T08:00:00Z",
};
const stakeholderVacancy: Vacancy = { ...base, stakeholders: [stakeholder] };

afterEach(cleanup);

describe("research screens", () => {
  it("filters stakeholder mappings and resets a filtered empty state", async () => {
    const user = userEvent.setup();
    render(<StakeholderDirectory vacancies={[stakeholderVacancy]} />);
    await user.type(screen.getByRole("searchbox", { name: "Search stakeholders" }), "not present");
    expect(screen.getByRole("heading", { name: "No matching stakeholders" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getByRole("button", { name: "Alex Researcher" })).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Stakeholder evidence" }),
      "CONFIRMED"
    );
    expect(screen.getByRole("heading", { name: "No matching stakeholders" })).toBeInTheDocument();
  });

  it("opens scoped stakeholder details and distinguishes observed from inferred email", () => {
    const other = {
      ...stakeholderVacancy,
      id: "vac-other",
      title: "Another vacancy",
      stakeholders: [{ ...stakeholder, name: "Other Alex" }],
    };
    render(
      <StakeholderDirectory
        vacancies={[stakeholderVacancy, other]}
        initialStakeholderId="person-1"
        initialVacancyId={base.id}
      />
    );
    const dialog = screen.getByRole("dialog", { name: "Alex Researcher" });
    expect(within(dialog).getByText("Observed public business email")).toBeInTheDocument();
    expect(within(dialog).getByText("Pattern-inferred business email")).toBeInTheDocument();
    expect(within(dialog).getByText("alex@observed.example")).toBeInTheDocument();
    expect(within(dialog).getByText("a.researcher@inferred.example")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Open vacancy intelligence" })).toHaveAttribute(
      "href",
      `/?vacancy=${base.id}`
    );
    expect(dialog.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("includes candidate gate failures in QA and links the exact candidate and vacancy", async () => {
    const user = userEvent.setup();
    const candidate = { ...base.candidates[0], qaStatus: "FAIL_RESEARCH_REQUIRED" as const };
    render(<EvidenceWorkspace vacancies={[{ ...base, candidates: [candidate] }]} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Evidence record type" }),
      "CANDIDATE_QA"
    );
    await user.click(
      screen.getByRole("button", { name: `Inspect ${candidate.name} candidate qa` })
    );
    const dialog = screen.getByRole("dialog", { name: candidate.name });
    expect(
      within(dialog).getByRole("link", { name: "Open candidate intelligence" })
    ).toHaveAttribute("href", `/candidates?candidate=${candidate.candidateId}&vacancy=${base.id}`);
    expect(
      within(dialog).getByText(/timestamped review or challenge history is not available/)
    ).toBeInTheDocument();
  });

  it("offers confirmed sources in the source library and supports keyboard tabs", async () => {
    const user = userEvent.setup();
    render(<EvidenceWorkspace vacancies={[{ ...base, candidates: [] }]} />);
    const tab = screen.getByRole("tab", { name: /Review queue/ });
    tab.focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Source library/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("button", { name: "PRN Recruitment" })).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Evidence status" }),
      "CONFIRMED"
    );
    expect(
      screen.queryByRole("button", { name: "LinkedIn employee repost" })
    ).not.toBeInTheDocument();
  });

  it("consumes run-search deep links and exposes recorded completion timestamps and metrics", async () => {
    const user = userEvent.setup();
    const run = demoSnapshot.runs[0];
    render(<RunHistory runs={demoSnapshot.runs} initialSearch={run.externalRunId} />);
    expect(
      screen.queryByRole("button", { name: demoSnapshot.runs[1].externalRunId })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: `Inspect run ${run.externalRunId}` }));
    const dialog = screen.getByRole("dialog", { name: run.externalRunId });
    expect(within(dialog).getByText(/publication receipt is not available/)).toBeInTheDocument();
    expect(within(dialog).getByText("1h 18m")).toBeInTheDocument();
    expect(within(dialog).getByText("74")).toBeInTheDocument();
    expect(dialog.querySelector(`time[datetime="${run.completedAt}"]`)).not.toBeNull();
  });

  it("opens the exact run requested by a dashboard deep link", () => {
    const run = demoSnapshot.runs[1];
    render(<RunHistory runs={demoSnapshot.runs} initialRunId={run.id} />);
    expect(screen.getByRole("dialog", { name: run.externalRunId })).toBeInTheDocument();
  });

  it("paginates stakeholder mappings instead of rendering the full directory", async () => {
    const user = userEvent.setup();
    const vacancies = Array.from({ length: 13 }, (_, index) => ({
      ...stakeholderVacancy,
      id: `v-${index}`,
      stakeholders: [{ ...stakeholder, id: `p-${index}`, name: `Person ${index + 1}` }],
    }));
    render(<StakeholderDirectory vacancies={vacancies} />);
    expect(screen.queryByRole("button", { name: "Person 13" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("button", { name: "Person 13" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Person 1" })).not.toBeInTheDocument();
  });
});
