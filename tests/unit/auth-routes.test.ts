import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as signIn } from "@/app/api/auth/sign-in/route";
import { POST as recover } from "@/app/api/auth/recover/route";
import { POST as password } from "@/app/api/auth/password/route";
import { POST as signOut } from "@/app/api/auth/sign-out/route";
import { GET as callback } from "@/app/auth/callback/route";
import {
  PASSWORD_GRANT_COOKIE,
  passwordGrant,
  validPasswordGrant,
} from "@/lib/auth/password-reset";

const state = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    updateUser: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    verifyOtp: vi.fn(),
  },
  membership: vi.fn(),
  cookies: new Map<string, string>(),
  setCookie: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (key: string) => ({ value: state.cookies.get(key) }),
    set: state.setCookie,
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    const query = {
      select: () => query,
      eq: () => query,
      limit: () => query,
      maybeSingle: state.membership,
    };
    return { auth: state.auth, from: () => query };
  },
}));
const user = { id: "00000000-0000-4000-8000-000000000001", email_confirmed_at: "2026-10-17" };
const session = {
  access_token: "private-access-token-test",
  refresh_token: "private-refresh-token-test",
};
const request = (path: string, body: unknown, origin = "https://rec.example") =>
  new Request(`https://rec.example${path}`, {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.stubEnv("AUTH_PASSWORD_RESET_SECRET", "fixture-only-reset-signing-secret-32chars");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-test-key");
  Object.values(state.auth).forEach((method) => method.mockReset());
  state.cookies.clear();
  state.setCookie.mockReset();
  state.membership.mockReset().mockResolvedValue({ data: { workspace_id: "w1" }, error: null });
  state.auth.signInWithPassword.mockResolvedValue({ data: { user, session }, error: null });
  state.auth.signOut.mockResolvedValue({ error: null });
  state.auth.getUser.mockResolvedValue({ data: { user }, error: null });
  state.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  state.auth.updateUser.mockResolvedValue({ error: null });
  state.auth.exchangeCodeForSession.mockResolvedValue({ data: { user, session }, error: null });
  state.auth.verifyOtp.mockResolvedValue({ data: { user, session }, error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe("server-managed password sessions", () => {
  it("accepts invited verified members without returning credentials to JavaScript", async () => {
    const response = await signIn(
      request("/api/auth/sign-in", {
        email: " member@example.test ",
        password: "a secure passphrase",
      })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(state.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "member@example.test",
      password: "a secure passphrase",
    });
  });
  it("rejects a signed-in account without workspace membership and clears its new session", async () => {
    state.membership.mockResolvedValue({ data: null, error: null });
    const response = await signIn(
      request("/api/auth/sign-in", { email: "outsider@example.test", password: "test" })
    );
    expect(response.status).toBe(401);
    expect(state.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(await response.text()).not.toContain("outsider");
  });
  it("uses the same denial for invalid credentials and an unverified email", async () => {
    state.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Internal user existence information" },
    });
    const invalid = await signIn(
      request("/api/auth/sign-in", { email: "unknown@example.test", password: "test" })
    );
    state.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: user.id } },
      error: null,
    });
    const unverified = await signIn(
      request("/api/auth/sign-in", { email: "member@example.test", password: "test" })
    );
    expect(invalid.status).toBe(401);
    expect(await invalid.text()).toBe(await unverified.text());
  });
  it("rejects cross-origin login and missing configuration without contacting Auth", async () => {
    expect(
      (await signIn(request("/api/auth/sign-in", {}, "https://attacker.example"))).status
    ).toBe(403);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect((await signIn(request("/api/auth/sign-in", {}))).status).toBe(503);
    expect(state.auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it("preserves provider throttling without leaking provider error details", async () => {
    state.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { status: 429, message: "private details" },
    });
    const response = await signIn(
      request("/api/auth/sign-in", { email: "member@example.test", password: "test" })
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
  });
  it("makes recovery responses identical for delivered and rejected addresses", async () => {
    state.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    const known = await recover(request("/api/auth/recover", { email: "member@example.test" }));
    state.auth.resetPasswordForEmail.mockResolvedValue({ error: { message: "User not found" } });
    const unknown = await recover(request("/api/auth/recover", { email: "unknown@example.test" }));
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(await known.text()).toBe(await unknown.text());
  });
  it("creates a short-lived HttpOnly password grant only after email verification and membership", async () => {
    const response = await callback(
      new Request("https://rec.example/auth/callback?code=one-time-code&next=//evil.example")
    );
    expect(response.headers.get("location")).toBe("https://rec.example/account/password");
    expect(state.setCookie).toHaveBeenCalledWith(
      PASSWORD_GRANT_COOKIE,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/api/auth/password",
        maxAge: 900,
      })
    );
    expect(
      validPasswordGrant(state.setCookie.mock.calls[0][1], user.id, session.access_token)
    ).toBe(true);
  });
  it("does not grant password setup to non-members or unsupported email-link types", async () => {
    state.membership.mockResolvedValue({ data: null, error: null });
    await callback(new Request("https://rec.example/auth/callback?token_hash=hash&type=invite"));
    expect(state.setCookie).not.toHaveBeenCalled();
    state.auth.verifyOtp.mockClear();
    await callback(new Request("https://rec.example/auth/callback?token_hash=hash&type=signup"));
    expect(state.auth.verifyOtp).not.toHaveBeenCalled();
  });
  it("blocks password changes from ordinary sessions and grants bound to another token", async () => {
    const payload = request("/api/auth/password", { password: "new password long enough" });
    expect((await password(payload)).status).toBe(403);
    state.cookies.set(PASSWORD_GRANT_COOKIE, passwordGrant(user.id, "other-token"));
    expect(
      (await password(request("/api/auth/password", { password: "new password long enough" })))
        .status
    ).toBe(403);
    expect(state.auth.updateUser).not.toHaveBeenCalled();
  });
  it("updates a password with a matching grant, consumes it, and signs out existing sessions", async () => {
    state.cookies.set(PASSWORD_GRANT_COOKIE, passwordGrant(user.id, session.access_token));
    const response = await password(
      request("/api/auth/password", { password: "new password long enough" })
    );
    expect(response.status).toBe(200);
    expect(state.auth.updateUser).toHaveBeenCalledWith({ password: "new password long enough" });
    expect(state.setCookie).toHaveBeenCalledWith(
      PASSWORD_GRANT_COOKIE,
      "",
      expect.objectContaining({ maxAge: 0 })
    );
    expect(state.auth.signOut).toHaveBeenCalledWith({ scope: "global" });
  });
  it("rejects expired recovery grants on the server even if a client retains its cookie", () => {
    expect(
      validPasswordGrant(
        passwordGrant(user.id, session.access_token, Date.now() - 1),
        user.id,
        session.access_token
      )
    ).toBe(false);
  });
  it("rejects a forged reset grant even when an attacker knows the user and session token", async () => {
    const expires = Date.now() + 15 * 60 * 1000;
    const forged = `${expires}.${createHash("sha256").update(`${user.id}:${session.access_token}:${expires}`).digest("hex")}`;
    state.cookies.set(PASSWORD_GRANT_COOKIE, forged);
    expect(
      (await password(request("/api/auth/password", { password: "attempted account takeover" })))
        .status
    ).toBe(403);
    expect(state.auth.updateUser).not.toHaveBeenCalled();
  });
  it("fails closed for recovery when no strong server signing key is configured", async () => {
    vi.stubEnv("AUTH_PASSWORD_RESET_SECRET", "");
    vi.stubEnv("INGEST_API_KEY", "");
    expect(
      (await recover(request("/api/auth/recover", { email: "member@example.test" }))).status
    ).toBe(503);
    expect(state.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
  it("can derive an isolated key from ingestion credentials and invalidates grants on rotation", () => {
    vi.stubEnv("AUTH_PASSWORD_RESET_SECRET", "");
    vi.stubEnv("INGEST_API_KEY", "fixture-ingestion-key-aaaaaaaaaaaaaaaaaaaaaaaa");
    const grant = passwordGrant(user.id, session.access_token);
    expect(validPasswordGrant(grant, user.id, session.access_token)).toBe(true);
    vi.stubEnv("INGEST_API_KEY", "fixture-ingestion-key-bbbbbbbbbbbbbbbbbbbbbbbb");
    expect(validPasswordGrant(grant, user.id, session.access_token)).toBe(false);
  });
  it("clears the session and requests browser-cache cleanup on sign-out", async () => {
    const response = await signOut(request("/api/auth/sign-out", {}));
    expect(response.status).toBe(200);
    expect(response.headers.get("clear-site-data")).toContain('"cache"');
  });
});
