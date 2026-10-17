import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

const auth = vi.hoisted(() => ({ signInWithOtp: vi.fn(), verifyOtp: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth }) }));
vi.mock("@/lib/supabase/config", () => ({ isDemoMode: () => false }));

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/login");
  auth.signInWithOtp.mockReset().mockResolvedValue({ error: null });
  auth.verifyOtp.mockReset().mockResolvedValue({ error: new Error("Code expired") });
});

async function useExistingCode() {
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Work email"), "recruiter@example.test");
  await user.click(screen.getByRole("button", { name: "I already have a code" }));
  return user;
}

describe("REC sign-in preservation", () => {
  it("requests the existing no-signup OTP flow and keeps the secure callback", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Work email"), "recruiter@example.test");
    await user.click(screen.getByRole("button", { name: "Email me a sign-in" }));
    await screen.findByLabelText("Verification code");
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: "recruiter@example.test",
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    expect(window.localStorage.getItem("talent-tree:pending-auth-email")).toBe(
      "recruiter@example.test"
    );
  });

  it("accepts an existing code without sending a replacement email", async () => {
    await useExistingCode();
    expect(screen.getByLabelText("Verification code")).toBeInTheDocument();
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("rejects short codes, normalises digits and exposes failed verification", async () => {
    const user = await useExistingCode();
    const code = screen.getByLabelText("Verification code");
    await user.type(code, "12345");
    expect(screen.getByRole("button", { name: "Verify code" })).toBeDisabled();
    fireEvent.change(code, { target: { value: "12a3456" } });
    await user.click(screen.getByRole("button", { name: "Verify code" }));
    await screen.findByRole("alert");
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: "recruiter@example.test",
      token: "123456",
      type: "email",
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Code expired");
  });

  it("resends only when explicitly requested and permits changing email", async () => {
    const user = await useExistingCode();
    await user.click(screen.getByRole("button", { name: "Send a new sign-in email" }));
    await waitFor(() => expect(auth.signInWithOtp).toHaveBeenCalledTimes(1));
    expect(auth.signInWithOtp.mock.calls[0][0].options.shouldCreateUser).toBe(false);
    await user.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByLabelText("Work email")).toBeInTheDocument();
    expect(window.localStorage.getItem("talent-tree:pending-auth-email")).toBeNull();
  });

  it("restores an unexpired pending sign-in without a new email", async () => {
    window.localStorage.setItem("talent-tree:pending-auth-email", "recruiter@example.test");
    window.localStorage.setItem("talent-tree:pending-auth-at", String(Date.now()));
    render(<LoginPage />);
    await screen.findByLabelText("Verification code");
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("expires pending access after fifteen minutes", () => {
    window.localStorage.setItem("talent-tree:pending-auth-email", "recruiter@example.test");
    window.localStorage.setItem("talent-tree:pending-auth-at", String(Date.now() - 16 * 60 * 1000));
    render(<LoginPage />);
    expect(screen.getByLabelText("Work email")).toBeInTheDocument();
    expect(window.localStorage.getItem("talent-tree:pending-auth-email")).toBeNull();
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });
});
