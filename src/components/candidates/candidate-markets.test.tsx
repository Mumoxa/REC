import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CandidateMarketsPage from "@/app/candidates/page";
import { demoSnapshot } from "@/lib/data/demo";
import type { WorkspaceSnapshot } from "@/lib/data/types";
import { CandidateMarkets } from "./candidate-markets";
import { canChangeWorkflow, publicProfileUrl } from "./market-model";

vi.mock("@/lib/data/repository", () => ({
  getWorkspaceSnapshot: vi.fn(async () => demoSnapshot),
}));
vi.mock("@/components/shell/app-header", () => ({ AppHeader: () => null }));

function sharedIdentity(demoMode = true): WorkspaceSnapshot {
  const firstVacancy = demoSnapshot.vacancies[0];
  const person = firstVacancy.candidates[0];
  return {
    ...demoSnapshot,
    demoMode,
    vacancies: [
      {
        ...firstVacancy,
        candidates: [{ ...person, profileUrl: "https://example.org/public-profile" }],
      },
      {
        ...demoSnapshot.vacancies[1],
        candidates: [
          {
            ...person,
            assignmentId: "second-assignment",
            marketBucket: "LONGLIST",
            qaStatus: "FAIL_RESEARCH_REQUIRED",
            operationalStatus: "SURFACED",
            whyFit: "Alternative vacancy fit assessment.",
            evidenceGaps: ["Leadership scope requires verification"],
            claims: [
              { name: "Qualification", value: "Recorded qualification", status: "CONFIRMED" },
              { name: "Leadership", value: "Probable management scope", status: "PROBABLE" },
              { name: "Industry", value: "Comparable industry hypothesis", status: "HYPOTHESIS" },
              { name: "ERP", value: "Not verified", status: "UNKNOWN" },
            ],
          },
        ],
      },
    ],
  };
}

async function openAlicia() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Open intelligence for Alicia Daniels" }));
  await screen.findByRole("combobox", { name: "Recruiter workflow status" });
  return { user, dialog: screen.getByRole("dialog", { name: "Candidate intelligence" }) };
}

afterEach(() => vi.unstubAllGlobals());

describe("Candidate markets", () => {
  it("provides searchable candidate intelligence rather than a read-only directory", async () => {
    render(await CandidateMarketsPage());
    expect(screen.getByRole("searchbox", { name: "Search candidates" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open intelligence for Alicia Daniels" })
    ).toBeInTheDocument();
  });

  it("deduplicates identities while preserving both assignment contexts and claim confidence", async () => {
    render(<CandidateMarkets snapshot={sharedIdentity()} />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Unique candidates").closest(".stat-card")).toHaveTextContent("1");
    expect(screen.getByText("Vacancy assignments").closest(".stat-card")).toHaveTextContent("2");
    const { user, dialog } = await openAlicia();
    await user.click(within(dialog).getByRole("button", { name: /Group Accountant/ }));
    expect(within(dialog).getByText("Alternative vacancy fit assessment.")).toBeInTheDocument();
    expect(within(dialog).getByText("Leadership scope requires verification")).toBeInTheDocument();
    expect(within(dialog).getByRole("region", { name: "Confirmed claims" })).toHaveTextContent(
      "Recorded qualification"
    );
    expect(within(dialog).getByRole("region", { name: "Probable claims" })).toHaveTextContent(
      "Probable management scope"
    );
    expect(within(dialog).getByRole("region", { name: "Hypotheses" })).toHaveTextContent(
      "Comparable industry hypothesis"
    );
    expect(within(dialog).getByRole("region", { name: "Unknown claims" })).toHaveTextContent(
      "Not verified"
    );
    expect(within(dialog).getByRole("combobox", { name: "Recruiter workflow status" })).toHaveValue(
      "SURFACED"
    );
  });

  it("intersects research and QA filters on the same vacancy assignment", async () => {
    const user = userEvent.setup();
    render(<CandidateMarkets snapshot={sharedIdentity()} />);
    await user.selectOptions(screen.getByLabelText("Filter research bucket"), "TOP_10");
    await user.selectOptions(
      screen.getByLabelText("Filter candidate QA"),
      "FAIL_RESEARCH_REQUIRED"
    );
    expect(screen.getByText("No matching candidates")).toBeInTheDocument();
    await user.click(
      within(screen.getByLabelText("Active candidate filters")).getByRole("button", {
        name: "Reset filters",
      })
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByLabelText("Active candidate filters")).not.toBeInTheDocument();
  });

  it("filters employer, title, location, vacancy and tier and supports scoped search", async () => {
    const user = userEvent.setup();
    render(<CandidateMarkets snapshot={demoSnapshot} />);
    await user.selectOptions(screen.getByLabelText("Filter candidate employer"), "Premier Foods");
    await user.selectOptions(
      screen.getByLabelText("Filter candidate job title"),
      "Financial Manager"
    );
    await user.selectOptions(screen.getByLabelText("Filter candidate location"), "Cape Town");
    await user.selectOptions(screen.getByLabelText("Filter comparable tier"), "A");
    await user.selectOptions(screen.getByLabelText("Filter associated vacancy"), "vac-001");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.type(
      screen.getByRole("searchbox", { name: "Search candidates" }),
      "no matching person"
    );
    expect(screen.getByText("No matching candidates")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove search filter" }));
    expect(
      screen.getByRole("button", { name: "Open intelligence for Alicia Daniels" })
    ).toBeInTheDocument();
  });

  it("retains intelligence access in the compact table density", async () => {
    const user = userEvent.setup();
    render(<CandidateMarkets snapshot={demoSnapshot} />);
    await user.click(screen.getByRole("button", { name: "Compact table view" }));
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    await openAlicia();
    expect(screen.getByRole("dialog", { name: "Candidate intelligence" })).toBeInTheDocument();
  });

  it("paginates large markets and resets pagination after filtering", async () => {
    const user = userEvent.setup();
    const vacancy = demoSnapshot.vacancies[0];
    render(
      <CandidateMarkets
        snapshot={{
          ...demoSnapshot,
          vacancies: [
            {
              ...vacancy,
              candidates: Array.from({ length: 13 }, (_, index) => ({
                ...vacancy.candidates[0],
                candidateId: `test-candidate-${index}`,
                assignmentId: `test-assignment-${index}`,
                name: `Test candidate ${String(index).padStart(2, "0")}`,
              })),
            },
          ],
        }}
      />
    );
    expect(screen.getAllByRole("article")).toHaveLength(12);
    await user.click(screen.getByRole("button", { name: "Next candidate page" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "Search candidates" }),
      "Test candidate 00"
    );
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous candidate page" })).toBeDisabled();
  });

  it("keeps demo workflow changes local without changing research or other assignments", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const snapshot = sharedIdentity();
    render(<CandidateMarkets snapshot={snapshot} />);
    const { user, dialog } = await openAlicia();
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Recruiter workflow status" }),
      "ENGAGED"
    );
    await user.click(within(dialog).getByRole("button", { name: "Update workflow" }));
    expect(within(dialog).getByRole("status")).toHaveTextContent(
      "Demo change saved locally: Engaged for Head of Finance."
    );
    expect(
      within(dialog).getByText("Research Top 10", { selector: ".candidate-detail-context > span" })
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /Group Accountant/ }));
    expect(within(dialog).getByRole("combobox", { name: "Recruiter workflow status" })).toHaveValue(
      "SURFACED"
    );
    expect(snapshot.vacancies[0].candidates[0].operationalStatus).toBe("TOP_10");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a reason and confirmation before excluding only the selected assignment", async () => {
    render(<CandidateMarkets snapshot={sharedIdentity()} />);
    const { user, dialog } = await openAlicia();
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Recruiter workflow status" }),
      "EXCLUDED"
    );
    await user.click(within(dialog).getByRole("button", { name: "Update workflow" }));
    const confirmation = screen.getByRole("dialog", { name: "Exclude candidate confirmation" });
    expect(within(confirmation).getByRole("button", { name: "Confirm exclusion" })).toBeDisabled();
    expect(within(confirmation).getByLabelText("Reason for exclusion")).toHaveFocus();
    await user.type(
      within(confirmation).getByLabelText("Reason for exclusion"),
      "Client instructed this vacancy exclusion"
    );
    await user.click(within(confirmation).getByRole("button", { name: "Confirm exclusion" }));
    const updated = screen.getByRole("dialog", { name: "Candidate intelligence" });
    expect(
      within(updated).getByText(/Client instructed this vacancy exclusion/)
    ).toBeInTheDocument();
    expect(
      within(updated).getByText("Research Top 10", { selector: ".candidate-detail-context > span" })
    ).toBeInTheDocument();
    await user.click(within(updated).getByRole("button", { name: /Group Accountant/ }));
    expect(
      within(updated).getByRole("combobox", { name: "Recruiter workflow status" })
    ).toHaveValue("SURFACED");
  });

  it("posts the exact live candidate-operation contract and displays pending then success", async () => {
    let resolveResponse: (response: Response) => void = () => undefined;
    const fetchMock = vi.fn<typeof fetch>(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<CandidateMarkets snapshot={sharedIdentity(false)} />);
    const { user, dialog } = await openAlicia();
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Recruiter workflow status" }),
      "EARMARKED"
    );
    await user.click(within(dialog).getByRole("button", { name: "Update workflow" }));
    expect(within(dialog).getByRole("button", { name: "Saving workflow…" })).toBeDisabled();
    expect(
      within(dialog).getByRole("combobox", { name: "Recruiter workflow status" })
    ).toBeDisabled();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/ops/candidate");
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
      vacancyId: "vac-001",
      candidateId: "c-1",
      operationalStatus: "EARMARKED",
    });
    await act(async () =>
      resolveResponse({ ok: true, json: async () => ({ ok: true }) } as Response)
    );
    expect(within(dialog).getByRole("status")).toHaveTextContent(
      "Workflow saved: Earmarked for Head of Finance."
    );
  });

  it("preserves the recorded workflow on API failure and supports a successful retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Unauthorized" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<CandidateMarkets snapshot={sharedIdentity(false)} />);
    const { user, dialog } = await openAlicia();
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Recruiter workflow status" }),
      "APPROACH"
    );
    await user.click(within(dialog).getByRole("button", { name: "Update workflow" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Unauthorized");
    expect(
      within(dialog).getByText("Recruiter Top 10", { selector: ".candidate-detail-context > span" })
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Update workflow" }));
    expect(await within(dialog).findByRole("status")).toHaveTextContent("Workflow saved: Approach");
  });

  it("dismisses confirmation before the drawer and restores the opening control focus", async () => {
    render(<CandidateMarkets snapshot={sharedIdentity()} />);
    const { user, dialog } = await openAlicia();
    expect(
      within(dialog).getByRole("button", { name: "Close Candidate intelligence" })
    ).toHaveFocus();
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Recruiter workflow status" }),
      "EXCLUDED"
    );
    await user.click(within(dialog).getByRole("button", { name: "Update workflow" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog", { name: "Candidate intelligence" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open intelligence for Alicia Daniels" })
    ).toHaveFocus();
  });

  it("renders supported public sources and rejects executable source URLs", async () => {
    render(<CandidateMarkets snapshot={sharedIdentity()} />);
    const { dialog } = await openAlicia();
    expect(
      within(dialog).getByRole("link", { name: "Open recorded public profile" })
    ).toHaveAttribute("href", "https://example.org/public-profile");
    expect(publicProfileUrl("javascript:alert(1)")).toBeNull();
    expect(publicProfileUrl("data:text/html,test")).toBeNull();
    expect(publicProfileUrl("not-a-url")).toBeNull();
  });

  it("disables earlier actions after workflow progression while preserving explicit restore semantics", async () => {
    const snapshot = sharedIdentity();
    snapshot.vacancies[0].candidates[0].operationalStatus = "ENGAGED";
    render(<CandidateMarkets snapshot={snapshot} />);
    const { dialog } = await openAlicia();
    const select = within(dialog).getByRole("combobox", { name: "Recruiter workflow status" });
    for (const label of ["Surfaced", "Relevant", "Earmarked", "Recruiter Top 10", "Approach"]) {
      expect(within(select).getByRole("option", { name: label })).toBeDisabled();
    }
    expect(within(select).getByRole("option", { name: "Submitted" })).not.toBeDisabled();
    expect(
      within(dialog).getByRole("group", { name: "Current recruiter stage" })
    ).toHaveTextContent("Engaged");
    expect(
      within(dialog).getByRole("group", { name: "Current recruiter stage" })
    ).not.toHaveTextContent("Earmarked");
    expect(within(dialog).queryByLabelText("Completed recruiter stages")).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole("group", { name: "Current recruiter stage" })
    ).not.toHaveTextContent("Recruiter Top 10");
  });

  it("opens authorised identity deep links with a vacancy-specific context", async () => {
    render(
      await CandidateMarketsPage({
        searchParams: Promise.resolve({ candidate: "c-1", vacancy: "vac-001", q: "Premier" }),
      })
    );
    expect(screen.getByRole("searchbox", { name: "Search candidates" })).toHaveValue("Premier");
    expect(screen.getByRole("dialog", { name: "Candidate intelligence" })).toBeInTheDocument();
  });

  it("preserves the established workflow toggles and prevents skipped restore stages", () => {
    expect(canChangeWorkflow("EARMARKED", "RELEVANT")).toBe(true);
    expect(canChangeWorkflow("TOP_10", "EARMARKED")).toBe(true);
    expect(canChangeWorkflow("TOP_10", "SURFACED")).toBe(false);
    expect(canChangeWorkflow("APPROACH", "TOP_10")).toBe(false);
    expect(canChangeWorkflow("ENGAGED", "EARMARKED")).toBe(false);
    expect(canChangeWorkflow("SUBMITTED", "ENGAGED")).toBe(false);
    expect(canChangeWorkflow("EXCLUDED", "RELEVANT")).toBe(true);
    expect(canChangeWorkflow("EXCLUDED", "SUBMITTED")).toBe(false);
    expect(canChangeWorkflow("SUBMITTED", "EXCLUDED")).toBe(true);
  });
});
