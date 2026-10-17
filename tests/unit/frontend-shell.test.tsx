import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppHeader, searchRecords } from "@/components/shell/app-header";
import { Badge, Dialog } from "@/components/ui/primitives";
import { demoSnapshot } from "@/lib/data/demo";
import type { WorkspaceSnapshot } from "@/lib/data/types";

function searchSnapshot(): WorkspaceSnapshot {
  const vacancy = demoSnapshot.vacancies[0];
  const candidate = vacancy.candidates[0];
  const stakeholder = {
    id: "person/first",
    key: "shared-local-key",
    name: "Morgan Review",
    title: "Finance Director",
    evidenceStatus: "PROBABLE" as const,
  };
  return {
    ...demoSnapshot,
    vacancies: [
      {
        ...vacancy,
        id: "role/first",
        title: "Finance Lead",
        employerName: "Example Employer",
        candidates: [{ ...candidate, candidateId: "candidate/one", name: "Taylor Example" }],
        stakeholders: [stakeholder],
      },
      {
        ...vacancy,
        id: "role/second",
        title: "Group Accountant",
        employerName: "Second Employer",
        candidates: [
          {
            ...candidate,
            candidateId: "candidate/one",
            assignmentId: "second-assignment",
            name: "Taylor Example",
          },
        ],
        stakeholders: [{ ...stakeholder, id: "person/second" }],
      },
    ],
  };
}

describe("authorised workspace search", () => {
  it("requires every search term, regardless of order or case, and ignores blank searches", () => {
    const snapshot = searchSnapshot();
    expect(searchRecords(snapshot, "  ")).toEqual([]);
    expect(searchRecords(snapshot, "TOWN tAyLoR").map((result) => result.title)).toEqual([
      "Taylor Example",
    ]);
    expect(searchRecords(snapshot, "Taylor nonexistent")).toEqual([]);
  });

  it("deduplicates candidate identity while retaining an exact vacancy association in its link", () => {
    const results = searchRecords(searchSnapshot(), "Taylor Example");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      kind: "Candidate",
      href: "/candidates?candidate=candidate%2Fone&vacancy=role%2Ffirst",
    });
  });

  it("keeps stakeholder associations separate when their local keys match", () => {
    const results = searchRecords(searchSnapshot(), "Morgan Review");
    expect(results).toHaveLength(2);
    expect(results.map((result) => result.href)).toEqual([
      "/stakeholders?stakeholder=person%2Ffirst&vacancy=role%2Ffirst",
      "/stakeholders?stakeholder=person%2Fsecond&vacancy=role%2Fsecond",
    ]);
    expect(new Set(results.map((result) => result.key)).size).toBe(2);
  });

  it("preserves vacancy UUID links and run query links without inventing record actions", () => {
    const snapshot = searchSnapshot();
    expect(
      searchRecords(snapshot, "Finance Lead").find((result) => result.kind === "Vacancy")?.href
    ).toBe("/?vacancy=role%2Ffirst");
    expect(searchRecords(snapshot, snapshot.runs[0].externalRunId)).toEqual([
      expect.objectContaining({
        kind: "Research run",
        href: `/runs?q=${snapshot.runs[0].externalRunId}`,
      }),
    ]);
  });
});

describe("shared shell interactions", () => {
  it("searches loaded records in a dialog and restores focus on Escape without invoking research", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      render(<AppHeader current="CANDIDATES" demoMode snapshot={searchSnapshot()} />);
      const trigger = screen.getByRole("button", { name: /Search intelligence/ });
      await user.click(trigger);
      const dialog = screen.getByRole("dialog", { name: "Search intelligence" });
      const input = within(dialog).getByRole("searchbox", { name: "Search authorised records" });
      expect(input).toHaveFocus();
      await user.type(input, "Taylor");
      expect(within(dialog).getByRole("link", { name: /Taylor Example/ })).toHaveAttribute(
        "href",
        "/candidates?candidate=candidate%2Fone&vacancy=role%2Ffirst"
      );
      expect(fetchSpy).not.toHaveBeenCalled();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("exposes the limited vacancy-search scope when no snapshot is provided", async () => {
    const user = userEvent.setup();
    render(<AppHeader current="VACANCIES" demoMode />);
    await user.click(screen.getByRole("button", { name: /Search intelligence/ }));
    const dialog = screen.getByRole("dialog", { name: "Search intelligence" });
    await user.type(within(dialog).getByRole("searchbox"), "CA(SA) & SAP");
    expect(within(dialog).getByText(/Scope: vacancy workspace/)).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Search vacancies" })).toHaveAttribute(
      "href",
      "/?q=CA(SA)%20%26%20SAP"
    );
  });

  it("opens and closes mobile navigation with the correct current route", async () => {
    const user = userEvent.setup();
    render(<AppHeader current="QA" demoMode snapshot={searchSnapshot()} />);
    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Navigation" });
    const nav = within(dialog).getByRole("navigation", { name: "Primary" });
    const currentLinks = within(nav)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(currentLinks).toHaveLength(1);
    expect(currentLinks[0]).toHaveAttribute("href", "/qa");
    await user.click(within(dialog).getByRole("button", { name: "Close Navigation" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open record
      </button>
      {open && (
        <Dialog title="Record intelligence" onClose={() => setOpen(false)}>
          <label>
            Search evidence
            <input data-autofocus />
          </label>
          <button type="button">Last action</button>
        </Dialog>
      )}
    </>
  );
}

describe("shared modal and evidence primitives", () => {
  it("traps focus in both directions and restores focus and body scrolling after dismissal", async () => {
    const user = userEvent.setup();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "scroll";
    try {
      render(<DialogHarness />);
      const trigger = screen.getByRole("button", { name: "Open record" });
      await user.click(trigger);
      const dialog = screen.getByRole("dialog", { name: "Record intelligence" });
      expect(within(dialog).getByRole("textbox", { name: "Search evidence" })).toHaveFocus();
      expect(document.body.style.overflow).toBe("hidden");
      within(dialog).getByRole("button", { name: "Last action" }).focus();
      await user.tab();
      expect(
        within(dialog).getByRole("button", { name: "Close Record intelligence" })
      ).toHaveFocus();
      await user.tab({ shift: true });
      expect(within(dialog).getByRole("button", { name: "Last action" })).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(document.body.style.overflow).toBe("scroll");
    } finally {
      document.body.style.overflow = previousOverflow;
    }
  });

  it("dismisses only when the backdrop itself is pressed", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Open record" }));
    const dialog = screen.getByRole("dialog", { name: "Record intelligence" });
    fireEvent.mouseDown(within(dialog).getByRole("textbox"));
    expect(dialog).toBeInTheDocument();
    fireEvent.mouseDown(dialog.parentElement!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("retains evidence and QA uncertainty in text and status treatment", () => {
    render(
      <>
        {[
          "CONFIRMED",
          "PROBABLE",
          "HYPOTHESIS",
          "UNKNOWN",
          "PASS",
          "PASS_WITH_UNKNOWNS",
          "FAIL_RESEARCH_REQUIRED",
        ].map((value) => (
          <Badge key={value} value={value} />
        ))}
      </>
    );
    for (const text of [
      "Confirmed",
      "Probable",
      "Hypothesis",
      "Unknown",
      "Pass",
      "Pass with unknowns",
      "Fail research required",
    ]) {
      expect(screen.getByText(text, { exact: true })).toBeInTheDocument();
    }
    expect(screen.getByText("Pass with unknowns")).toHaveClass("badge-warning");
    expect(screen.getByText("Fail research required")).toHaveClass("badge-danger");
  });
});
