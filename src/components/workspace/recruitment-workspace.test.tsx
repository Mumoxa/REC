import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RecruitmentWorkspace } from "./recruitment-workspace";
import { demoSnapshot } from "@/lib/data/demo";
import type { WorkspaceSnapshot } from "@/lib/data/types";

function renderWorkspace(overrides?: Partial<WorkspaceSnapshot>) {
  const snap: WorkspaceSnapshot = {
    ...demoSnapshot,
    ...overrides,
    savedViews: overrides?.savedViews ?? demoSnapshot.savedViews,
    vacancies: overrides?.vacancies ?? demoSnapshot.vacancies,
  };
  return render(<RecruitmentWorkspace initialSnapshot={snap} />);
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve("{}"),
        json: () =>
          Promise.resolve({
            ok: true,
            savedView: {
              id: "sv-1",
              name: "mock",
              view_state: {},
              viewState: {},
              workspace_id: "w1",
              user_id: "u1",
            },
          }),
      } as unknown as Response)
    )
  );
});

describe("RecruitmentWorkspace — P2 RTL suite (chip / banner / drawer / arrow)", () => {
  it("shows a filter chip when channel filter changes", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const channelSelect = screen.getByLabelText("Filter by channel");
    await user.selectOptions(channelSelect, "AGREED_CLIENTS");

    const chips = await screen.findByLabelText("Active filters");
    expect(within(chips).getByText("Agreed Clients")).toBeInTheDocument();
  });

  it("removes a single chip via × and clears all via Clear all", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const channelSelect = screen.getByLabelText("Filter by channel");
    const regionSelect = screen.getByLabelText("Filter by region");
    await user.selectOptions(channelSelect, "AGENCY_SITES");
    await user.selectOptions(regionSelect, "Gauteng");

    const chips = await screen.findByLabelText("Active filters");
    expect(within(chips).getByText("Agencies")).toBeInTheDocument();
    expect(within(chips).getByText("Gauteng")).toBeInTheDocument();

    // remove one chip — scope to chip container to avoid matching <option>
    await user.click(screen.getByLabelText("Remove filter Agencies"));
    expect(within(screen.getByLabelText("Active filters")).queryByText("Agencies")).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Active filters")).getByText("Gauteng")).toBeInTheDocument();

    // clear all
    await user.click(screen.getByLabelText("Clear all filters"));
    expect(screen.queryByLabelText("Active filters")).not.toBeInTheDocument();
  });

  it("shows saved-view banner when a saved view is loaded", async () => {
    const user = userEvent.setup();
    const savedViews = [
      {
        id: "sv-1",
        name: "My Filter",
        viewState: { channelFilter: "LINKEDIN", globalSearch: "Finance" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as unknown as WorkspaceSnapshot["savedViews"];
    renderWorkspace({ savedViews });

    // ensure option is rendered before selecting
    expect(await screen.findByRole("option", { name: "My Filter" })).toBeInTheDocument();
    const viewSelect = screen.getByLabelText("Load saved view");
    await user.selectOptions(viewSelect, "My Filter");

    const banner = await screen.findByRole("status");
    expect(banner).toBeInTheDocument();
    expect(within(banner).getByText("My Filter")).toBeInTheDocument();
    expect(banner.textContent).toMatch(/Viewing:/);
  });

  it("opens close-vacancy drawer and dismisses via Cancel and via overlay", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const closeBtn = screen.getByRole("button", { name: "Close vacancy" });
    await user.click(closeBtn);

    const dialog = await screen.findByRole("dialog", { name: /Close vacancy confirmation/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Close vacancy")).toBeInTheDocument();

    // cancel
    await user.click(within(dialog).getByRole("button", { name: "Cancel close" }));
    expect(screen.queryByRole("dialog", { name: /Close vacancy confirmation/i })).not.toBeInTheDocument();

    // reopen, click overlay to dismiss
    await user.click(closeBtn);
    const dialog2 = await screen.findByRole("dialog", { name: /Close vacancy confirmation/i });
    expect(dialog2).toBeInTheDocument();
    // click overlay (the dialog root is the overlay; clicking it where target === currentTarget)
    await user.click(dialog2);
    expect(screen.queryByRole("dialog", { name: /Close vacancy confirmation/i })).not.toBeInTheDocument();
  });

  it("navigates vacancy list with ArrowDown / ArrowUp", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const listbox = screen.getByRole("listbox", { name: "Vacancy list" });
    // first is selected
    const first = screen.getByRole("option", { name: /Head of Finance/i });
    expect(first).toHaveAttribute("aria-selected", "true");

    listbox.focus();
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      const second = screen.getByRole("option", { name: /Group Accountant/i });
      expect(second).toHaveAttribute("aria-selected", "true");
    });

    await user.keyboard("{ArrowUp}");
    await waitFor(() => {
      expect(first).toHaveAttribute("aria-selected", "true");
    });
  });

  it("exclusion drawer opens via Exclude and shows preview", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    // Exclude button is always visible in candidate actions (no need to expand)
    const excludeButtons = screen.getAllByRole("button", { name: "Exclude candidate" });
    expect(excludeButtons.length).toBeGreaterThan(0);
    await user.click(excludeButtons[0]);

    const dialog = await screen.findByRole("dialog", { name: /Exclude candidate confirmation/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Exclude candidate/)).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Reason for exclusion/i)).toBeInTheDocument();

    // drawer note present — use text rather than role=note (jsdom aria mapping varies)
    expect(within(dialog).getByText(/The candidate will move to the Excluded bucket/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Cancel exclusion" }));
    expect(screen.queryByRole("dialog", { name: /Exclude candidate confirmation/i })).not.toBeInTheDocument();
  });
});
