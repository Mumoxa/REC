import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecruitmentWorkspace } from "./recruitment-workspace";
import { demoSnapshot } from "@/lib/data/demo";

afterEach(() => vi.unstubAllGlobals());

describe("workbench candidate transactions", () => {
  it("keeps other mutations disabled until rejection restores the original candidate workflow", async () => {
    const user = userEvent.setup();
    let resolve!: (response: Response) => void;
    const fetchMock = vi.fn<typeof fetch>(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    const snapshot = structuredClone(demoSnapshot);
    snapshot.demoMode = false;
    render(<RecruitmentWorkspace initialSnapshot={snapshot} />);
    const alicia = screen.getByRole("article", { name: "Candidate Alicia Daniels" });
    const michael = screen.getByRole("article", { name: "Candidate Michael Jacobs" });
    await user.click(
      within(alicia).getByRole("button", { name: "Open evidence for Alicia Daniels" })
    );
    const evidenceBefore = within(alicia).getByRole("table", {
      name: "Evidence claims",
    }).textContent;
    const qaBefore = within(alicia).getByLabelText(/^QA status/).textContent;
    const researchBefore = alicia.querySelector(".bucket-badge")?.textContent;
    const otherApproach = within(michael).getByRole("button", { name: "Mark for approach" });
    expect(otherApproach).toBeEnabled();

    await user.click(within(alicia).getByRole("button", { name: "Mark for approach" }));
    expect(within(alicia).getByText("Recruiter · Approach")).toBeInTheDocument();
    expect(otherApproach).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close vacancy" })).toBeDisabled();
    expect(within(michael).getByRole("button", { name: "Exclude candidate" })).toBeDisabled();
    await user.click(otherApproach);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({
      vacancyId: "vac-001",
      candidateId: "c-1",
      operationalStatus: "APPROACH",
    });

    await act(async () => resolve(new Response("Forbidden", { status: 403 })));
    expect(within(alicia).getByText("Recruiter · Top 10")).toBeInTheDocument();
    expect(otherApproach).toBeEnabled();
    expect(screen.getByRole("button", { name: "Close vacancy" })).toBeEnabled();
    expect(within(michael).getByText("Recruiter · Top 10")).toBeInTheDocument();
    expect(within(alicia).getByRole("table", { name: "Evidence claims" })).toHaveTextContent(
      evidenceBefore!
    );
    expect(within(alicia).getByLabelText(/^QA status/)).toHaveTextContent(qaBefore!);
    expect(alicia.querySelector(".bucket-badge")?.textContent).toBe(researchBefore);
    expect(snapshot.vacancies[0].candidates[0].operationalStatus).toBe("TOP_10");
    expect(screen.getByRole("alert")).toHaveTextContent("Change was not saved");
  });
});
