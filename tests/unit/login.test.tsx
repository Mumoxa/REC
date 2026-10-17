import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

const send = vi.fn();
beforeEach(() => {
  window.history.replaceState(null, "", "/login");
  window.localStorage.clear();
  send.mockReset().mockResolvedValue({
    ok: false,
    json: async () => ({
      error: "Unable to sign in. Check your credentials and workspace access.",
    }),
  });
  vi.stubGlobal("fetch", send);
});
afterEach(() => vi.unstubAllGlobals());

describe("invited-member password sign-in", () => {
  it("shows a simple email/password form without public signup or demo bypass", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Work email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText(/Open demo|Create account|Sign up/i)).not.toBeInTheDocument();
  });
  it("sends credentials only to the same-origin server and never stores the password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Work email"), "recruiter@example.test");
    await user.type(screen.getByLabelText("Password"), "correct horse battery staple");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByRole("alert");
    expect(send.mock.calls[0][0]).toBe("/api/auth/sign-in");
    expect(JSON.parse(send.mock.calls[0][1].body)).toEqual({
      email: "recruiter@example.test",
      password: "correct horse battery staple",
    });
    expect(window.localStorage.length).toBe(0);
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });
  it("shows generic failures rather than provider internals or account existence", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Work email"), "recruiter@example.test");
    await user.type(screen.getByLabelText("Password"), "test-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to sign in");
  });
  it("supports explicit password recovery with a non-enumerating confirmation", async () => {
    const user = userEvent.setup();
    send.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    render(<LoginPage />);
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(screen.getByLabelText("Work email"), "recruiter@example.test");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    await waitFor(() => expect(send).toHaveBeenCalled());
    expect(send.mock.calls[0][0]).toBe("/api/auth/recover");
    expect(await screen.findByRole("status")).toHaveTextContent("If this email has access");
  });
});
