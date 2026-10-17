import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecruitmentWorkspace } from "./recruitment-workspace";
import { demoSnapshot } from "@/lib/data/demo";

function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

afterEach(() => vi.unstubAllGlobals());

describe("vacancy closure transaction", () => {
  it("keeps the confirmed vacancy and pending state stable while its close request is unresolved", async () => {
    const user = userEvent.setup();
    const request = deferredResponse();
    const fetchMock = vi.fn<typeof fetch>(() => request.promise);
    vi.stubGlobal("fetch", fetchMock);
    render(<RecruitmentWorkspace initialSnapshot={{ ...demoSnapshot, demoMode: false }} />);
    await user.click(screen.getByRole("button", { name: "Close vacancy" }));
    await user.click(screen.getByRole("button", { name: "Confirm close vacancy" }));

    const dialog = screen.getByRole("dialog", { name: "Close vacancy confirmation" });
    expect(within(dialog).getByLabelText("Vacancy preview")).toHaveTextContent("Head of Finance");
    const confirm = within(dialog).getByRole("button", { name: "Confirm close vacancy" });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveTextContent("Closing");
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(within(dialog).getByLabelText(/Reason for closing/)).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancel close" })).toBeDisabled();
    await user.keyboard("{Escape}");
    await user.click(dialog);
    expect(dialog).toBeInTheDocument();
    await user.click(confirm);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toMatchObject({
      vacancyId: "vac-001",
      action: "CLOSE",
    });

    await act(async () => request.resolve(new Response("{}", { status: 200 })));
    expect(
      screen.queryByRole("dialog", { name: "Close vacancy confirmation" })
    ).not.toBeInTheDocument();
    const queue = screen.getByRole("listbox", { name: "Vacancy list" });
    expect(
      within(queue).queryByRole("option", { name: /Head of Finance/i })
    ).not.toBeInTheDocument();
    expect(within(queue).getByRole("option", { name: /Group Accountant/i })).toBeInTheDocument();
  });

  it("restores the same vacancy and confirmation context after the server rejects closure", async () => {
    const user = userEvent.setup();
    const request = deferredResponse();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => request.promise)
    );
    render(<RecruitmentWorkspace initialSnapshot={{ ...demoSnapshot, demoMode: false }} />);
    await user.click(screen.getByRole("button", { name: "Close vacancy" }));
    await user.click(screen.getByRole("button", { name: "Confirm close vacancy" }));
    await act(async () => request.resolve(new Response("Forbidden", { status: 403 })));

    const dialog = screen.getByRole("dialog", { name: "Close vacancy confirmation" });
    expect(within(dialog).getByLabelText("Vacancy preview")).toHaveTextContent("Head of Finance");
    expect(within(dialog).getByRole("button", { name: "Confirm close vacancy" })).toBeEnabled();
    const queue = screen.getByRole("listbox", { name: "Vacancy list" });
    expect(within(queue).getByRole("option", { name: /Head of Finance/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Change was not saved");
  });

  it("retains visible pending feedback when closing the final active vacancy", async () => {
    const user = userEvent.setup();
    const request = deferredResponse();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => request.promise)
    );
    render(
      <RecruitmentWorkspace
        initialSnapshot={{
          ...demoSnapshot,
          demoMode: false,
          vacancies: [demoSnapshot.vacancies[0]],
        }}
      />
    );
    await user.click(screen.getByRole("button", { name: "Close vacancy" }));
    await user.click(screen.getByRole("button", { name: "Confirm close vacancy" }));
    const dialog = screen.getByRole("dialog", { name: "Close vacancy confirmation" });
    expect(within(dialog).getByLabelText("Vacancy preview")).toHaveTextContent("Head of Finance");
    expect(within(dialog).getByRole("button", { name: "Confirm close vacancy" })).toBeDisabled();
    await act(async () => request.resolve(new Response("{}", { status: 200 })));
    expect(
      screen.queryByRole("dialog", { name: "Close vacancy confirmation" })
    ).not.toBeInTheDocument();
  });
});
