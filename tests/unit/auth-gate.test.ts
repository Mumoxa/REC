import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { sameOrigin } from "@/lib/auth/access";
import { isDemoMode } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/proxy";

const provider = vi.hoisted(() => ({
  getUser: vi.fn(),
  getClaims: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: provider, from: provider.from }),
}));
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
  provider.getUser.mockReset().mockResolvedValue({ data: { user: null }, error: null });
  provider.getClaims.mockReset().mockResolvedValue({ data: null, error: null });
  provider.maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
  const query = {
    select: () => query,
    eq: () => query,
    limit: () => query,
    maybeSingle: provider.maybeSingle,
  };
  provider.from.mockReset().mockReturnValue(query);
});
afterEach(() => vi.unstubAllEnvs());
const request = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(`https://rec.example${path}`, init);

describe("private workspace gate", () => {
  it("uses the actual destination host when Next normalizes a local request URL", () => {
    expect(
      sameOrigin(
        new Request("http://localhost:3317/api/auth/sign-in", {
          headers: { Host: "127.0.0.1:3317", Origin: "http://127.0.0.1:3317" },
        })
      )
    ).toBe(true);
    expect(
      sameOrigin(
        new Request("https://rec.example/api/auth/sign-in", {
          headers: {
            Host: "rec.example",
            Origin: "https://attacker.example",
            "X-Forwarded-Host": "attacker.example",
          },
        })
      )
    ).toBe(false);
  });
  it("never enables production demo access, even with an explicit demo flag", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    expect(isDemoMode()).toBe(false);
  });
  it("never exposes the development demo on a public hostname", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("VERCEL", "");
    expect((await updateSession(request("/"))).status).toBe(307);
    expect((await updateSession(new NextRequest("http://localhost:3000/"))).status).toBe(200);
  });
  it("does not treat missing configuration as demo access", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(isDemoMode()).toBe(false);
  });
  it("redirects anonymous users away from every workspace page, including RSC requests", async () => {
    for (const path of [
      "/",
      "/intelligence",
      "/companies",
      "/candidates",
      "/stakeholders",
      "/qa",
      "/runs",
      "/account/password",
    ]) {
      const response = await updateSession(request(path, { headers: { RSC: "1" } }));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
      expect(response.headers.get("cache-control")).toContain("no-store");
    }
  });
  it("denies anonymous API requests with JSON rather than an HTML redirect", async () => {
    const response = await updateSession(request("/api/ops/candidate"));
    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
  it("fails closed when configuration is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect((await updateSession(request("/api/ops/candidate"))).status).toBe(503);
    expect((await updateSession(request("/"))).status).toBe(307);
  });
  it("does not make prefix lookalikes public", async () => {
    for (const path of ["/login-export", "/auth/export", "/api/ingest/export", "/candidates.png"])
      expect((await updateSession(request(path))).status).toBe(
        path.startsWith("/api/") ? 401 : 307
      );
  });
  it("requires verified email and explicit workspace membership", async () => {
    provider.getUser.mockResolvedValue({
      data: { user: { id: "u1", email_confirmed_at: "2026-10-17" } },
      error: null,
    });
    expect((await updateSession(request("/api/ops/candidate"))).status).toBe(403);
    provider.maybeSingle.mockResolvedValue({ data: { workspace_id: "w1" }, error: null });
    const allowed = await updateSession(request("/candidates"));
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("cache-control")).toContain("no-store");
    provider.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    expect((await updateSession(request("/api/ops/candidate"))).status).toBe(401);
  });
  it("rejects cross-origin browser writes before authentication or mutation", async () => {
    const response = await updateSession(
      request("/api/ops/candidate", {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      })
    );
    expect(response.status).toBe(403);
  });
  it("keeps only the exact login/recovery and independently authenticated ingestion entry points reachable", async () => {
    for (const path of [
      "/login",
      "/auth/callback",
      "/api/auth/sign-in",
      "/api/auth/recover",
      "/api/ingest/run",
    ])
      expect((await updateSession(request(path))).status).toBe(200);
  });
});
