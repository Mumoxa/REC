import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RecruitmentWorkspace } from "./recruitment-workspace";
import { demoSnapshot } from "@/lib/data/demo";

describe("Rebuilt vacancy workbench", () => {
  it("filters relationships without changing canonical channel selection", async () => {
    const user = userEvent.setup();
    render(<RecruitmentWorkspace initialSnapshot={demoSnapshot} />);
    await user.selectOptions(screen.getByLabelText("Filter by relationship"), "AGREED");
    const queue = screen.getByRole("listbox", { name: "Vacancy list" });
    expect(within(queue).getByRole("option", { name: /Group Accountant/i })).toBeInTheDocument();
    expect(
      within(queue).queryByRole("option", { name: /Head of Finance/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Filter by channel")).toHaveValue("ALL");
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(within(queue).getByRole("option", { name: /Head of Finance/i })).toBeInTheDocument();
  });

  it("sorts the queue by title while preserving selected vacancy", async () => {
    const user = userEvent.setup();
    render(<RecruitmentWorkspace initialSnapshot={demoSnapshot} />);
    await user.selectOptions(screen.getByLabelText("Sort vacancies"), "TITLE");
    const queue = screen.getByRole("listbox", { name: "Vacancy list" });
    const titles = within(queue)
      .getAllByRole("option")
      .map((option) => option.querySelector(".vacancy-title")?.textContent);
    expect(titles).toEqual([...titles].sort((a, b) => (a ?? "").localeCompare(b ?? "")));
    expect(within(queue).getByRole("option", { name: /Head of Finance/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("preserves candidate search and selection when work panes change", async () => {
    const user = userEvent.setup();
    render(<RecruitmentWorkspace initialSnapshot={demoSnapshot} />);
    await user.click(screen.getByRole("option", { name: /Group Accountant/i }));
    await user.click(screen.getByRole("button", { name: "Candidates" }));
    await user.type(screen.getByLabelText("Search candidate market"), "Candidate A");
    await user.click(screen.getByRole("button", { name: "Intelligence" }));
    await user.click(screen.getByRole("button", { name: "Candidates" }));
    expect(screen.getByLabelText("Search candidate market")).toHaveValue("Candidate A");
    expect(screen.getByRole("option", { name: /Group Accountant/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("opens an exact candidate deep link in its vacancy context", () => {
    render(
      <RecruitmentWorkspace
        initialSnapshot={demoSnapshot}
        initialVacancyId="vac-002"
        initialCandidateId="c-21"
      />
    );
    const card = screen.getByRole("article", { name: /Candidate A/i });
    expect(within(card).getByRole("button", { expanded: true })).toBeInTheDocument();
    expect(within(card).getByRole("table", { name: "Evidence claims" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Group Accountant/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
  it("saves and restores relationship, stage, and ordering together", async () => {
    const user = userEvent.setup();
    render(<RecruitmentWorkspace initialSnapshot={demoSnapshot} />);
    await user.selectOptions(screen.getByLabelText("Filter by relationship"), "AGREED");
    await user.selectOptions(screen.getByLabelText("Filter by research stage"), "IN_PROGRESS");
    await user.selectOptions(screen.getByLabelText("Sort vacancies"), "TITLE");
    await user.type(screen.getByLabelText("Saved view name"), "Client mapping");
    await user.click(screen.getByRole("button", { name: "Save current view" }));
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    await user.selectOptions(screen.getByLabelText("Sort vacancies"), "RECENT");
    await user.selectOptions(screen.getByLabelText("Load saved view"), "Client mapping");
    expect(screen.getByLabelText("Filter by relationship")).toHaveValue("AGREED");
    expect(screen.getByLabelText("Filter by research stage")).toHaveValue("IN_PROGRESS");
    expect(screen.getByLabelText("Sort vacancies")).toHaveValue("TITLE");
    const queue = screen.getByRole("listbox", { name: "Vacancy list" });
    expect(within(queue).getAllByRole("option")).toHaveLength(1);
    expect(within(queue).getByRole("option", { name: /Group Accountant/i })).toBeInTheDocument();
  });

  it("does not expose unsupported stored public profile protocols", () => {
    const snapshot = structuredClone(demoSnapshot);
    snapshot.vacancies[0].candidates[0].profileUrl = "javascript:alert(1)";
    render(
      <RecruitmentWorkspace
        initialSnapshot={snapshot}
        initialVacancyId="vac-001"
        initialCandidateId="c-1"
      />
    );
    expect(screen.queryByRole("link", { name: "Open public profile" })).not.toBeInTheDocument();
  });
  it("returns keyboard focus to the close-role trigger after cancelling its confirmation", async () => {
    const user = userEvent.setup();
    render(<RecruitmentWorkspace initialSnapshot={demoSnapshot} />);
    const trigger = screen.getByRole("button", { name: "Close vacancy" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Close vacancy confirmation" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("keeps mobile filters intact when the compact toolbar closes", async () => {
    const user = userEvent.setup();
    render(<RecruitmentWorkspace initialSnapshot={demoSnapshot} />);
    const toggle = screen.getByRole("button", { name: "Show filters and saved views" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    await user.selectOptions(screen.getByLabelText("Filter by relationship"), "AGREED");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByLabelText("Filter by relationship")).toHaveValue("AGREED");
  });
});
