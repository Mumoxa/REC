import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// An isolated local provider fixture exercises the real Supabase SDK and Next
// cookie/proxy boundary. No live credentials, email, or database is used.
const memberId = "00000000-0000-4000-8000-000000000001";
const outsiderId = "00000000-0000-4000-8000-000000000002";
let currentPassword = "fixture-password-only";
let nonce = 0;
const sessions = new Map();
const providerRequests = [];
const userFor = (id) => ({
  id,
  aud: "authenticated",
  role: "authenticated",
  email: id === memberId ? "member@example.test" : "outsider@example.test",
  email_confirmed_at: "2026-10-17T00:00:00Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: "2026-10-17T00:00:00Z",
});
const issue = (id) => {
  const now = Math.floor(Date.now() / 1000);
  const jwt = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(
      JSON.stringify({
        sub: id,
        aud: "authenticated",
        role: "authenticated",
        exp: now + 3600,
        iat: now,
        session_id: `test-${++nonce}`,
      })
    ).toString("base64url"),
    "fixture-signature",
  ].join(".");
  sessions.set(jwt, id);
  return {
    access_token: jwt,
    refresh_token: `fixture-refresh-${nonce}`,
    token_type: "bearer",
    expires_in: 3600,
    user: userFor(id),
  };
};
const fixture = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  let raw = "";
  for await (const chunk of request) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const token = (request.headers.authorization || "").replace(/^Bearer /, "");
  const id = sessions.get(token);
  const send = (status, value) => {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(value));
  };
  providerRequests.push({ method: request.method, path: url.pathname });
  if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "password") {
    if (
      body.password === currentPassword &&
      ["member@example.test", "outsider@example.test"].includes(body.email)
    )
      return send(200, issue(body.email === "member@example.test" ? memberId : outsiderId));
    return send(400, {
      error: "invalid_grant",
      error_code: "invalid_credentials",
      msg: "Invalid login credentials",
    });
  }
  if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "pkce")
    return send(200, issue(memberId));
  if (url.pathname === "/auth/v1/recover") return send(200, {});
  if (url.pathname === "/auth/v1/user") {
    if (!id) return send(401, { msg: "Invalid session", code: "bad_jwt" });
    if (request.method === "PUT") currentPassword = body.password;
    return send(200, userFor(id));
  }
  if (url.pathname === "/auth/v1/logout") {
    sessions.delete(token);
    response.writeHead(204);
    return response.end();
  }
  if (url.pathname.startsWith("/rest/v1/")) {
    if (!id) return send(401, { message: "Unauthorized" });
    const table = url.pathname.split("/").at(-1);
    if (table === "workspace_members")
      return send(
        200,
        id === memberId ? [{ workspace_id: "w1", workspaces: { slug: "talent-tree" } }] : []
      );
    if (table === "vacancies")
      return send(
        200,
        id === memberId
          ? [
              {
                id: "00000000-0000-4000-8000-000000000003",
                workspace_id: "w1",
                canonical_key: "auth-fixture-vacancy",
                title: "CONFIDENTIAL_AUTH_FIXTURE_VACANCY",
                employer_name: "Private fixture employer",
                employer_status: "CONFIRMED",
                first_seen: "2026-10-17T00:00:00Z",
                search_channel: "AGREED_CLIENTS",
                qa_status: "PASS_WITH_UNKNOWNS",
                location: "Cape Town",
                summary: "Synthetic private record used only for access-control tests.",
              },
            ]
          : []
      );
    if (table === "workspaces")
      return send(200, id === memberId ? [{ id: "w1", name: "AUTH_TEST_PRIVATE_WORKSPACE" }] : []);
    return send(200, []);
  }
  return send(404, { message: "Unknown fixture endpoint" });
});
fixture.listen(0, "127.0.0.1");
await once(fixture, "listening");
const providerUrl = `http://127.0.0.1:${fixture.address().port}`;
const appPort = process.env.REC_AUTH_TEST_PORT || "3317";
const base = `http://127.0.0.1:${appPort}`;
const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_SUPABASE_URL: providerUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_fixture_only",
  NEXT_PUBLIC_DEMO_MODE: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  AUTH_PASSWORD_RESET_SECRET: "fixture-only-reset-signing-secret-32chars",
};
const output = process.env.REC_AUTH_REPORT_DIR || "/tmp/rec-private-auth";
await fs.mkdir(output, { recursive: true });
const report = { checks: [], accessibility: [], pageErrors: [] };
let app, browser;
const run = async (args) => {
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", ...args], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (b) => {
    log += b;
  });
  child.stderr.on("data", (b) => {
    log += b;
  });
  const [code] = await once(child, "exit");
  await fs.writeFile(`${output}/build.log`, log);
  assert.equal(code, 0, log.slice(-5000));
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  await run(["build"]);
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", appPort],
    { env, stdio: ["ignore", "pipe", "pipe"] }
  );
  let appLog = "";
  app.stdout.on("data", (b) => {
    appLog += b;
  });
  app.stderr.on("data", (b) => {
    appLog += b;
  });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${base}/login`)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for the isolated application server to listen. */
    }
    await pause(100);
  }
  assert.ok(ready, appLog);
  const routes = [
    "/",
    "/intelligence",
    "/companies",
    "/candidates",
    "/stakeholders",
    "/qa",
    "/runs",
    "/account/password",
    "/candidates.png",
    "/login-export",
  ];
  for (const route of routes) {
    const result = await fetch(`${base}${route}`, { redirect: "manual" });
    assert.equal(result.status, 307, route);
    assert.equal(new URL(result.headers.get("location"), base).pathname, "/login");
    assert.match(result.headers.get("cache-control"), /no-store/);
    const anonymousBody = await result.text();
    assert.ok(!anonymousBody.includes("AUTH_TEST_PRIVATE_WORKSPACE"));
    assert.ok(!anonymousBody.includes("CONFIDENTIAL_AUTH_FIXTURE_VACANCY"));
    const rsc = await fetch(`${base}${route}`, { headers: { RSC: "1" } });
    assert.equal(new URL(rsc.url).pathname, "/login", `${route} RSC gate`);
    const anonymousRsc = await rsc.text();
    assert.ok(!anonymousRsc.includes("AUTH_TEST_PRIVATE_WORKSPACE"));
    assert.ok(!anonymousRsc.includes("CONFIDENTIAL_AUTH_FIXTURE_VACANCY"));
  }
  for (const route of [
    "/api/ops/candidate",
    "/api/ops/vacancy",
    "/api/ops/saved-view",
    "/api/auth/password",
  ])
    assert.equal((await fetch(`${base}${route}`)).status, 401, route);
  assert.equal(
    (
      await fetch(`${base}/api/auth/sign-in`, {
        method: "POST",
        headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
        body: "{}",
      })
    ).status,
    403
  );
  report.checks.push(
    "Production ignores demo=true; anonymous HTML/RSC/API and suffix/prefix probes cannot reach records; cross-origin login denied"
  );

  browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  await page.goto(`${base}/login`);
  const audit = async (name) => {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.accessibility.push({
      name,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        targets: v.nodes.map((n) => n.target),
      })),
    });
    assert.deepEqual(
      result.violations.map((v) => v.id),
      [],
      name
    );
  };
  await audit("password login");
  await page.screenshot({ path: `${output}/password-login.png`, fullPage: true });
  await page.setViewportSize({ width: 375, height: 900 });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= 375),
    "Mobile password login reflows"
  );
  await audit("mobile password login");
  await page.screenshot({ path: `${output}/password-login-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const login = async (email, password) => {
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
  };
  await login("member@example.test", "wrong-password");
  await page.locator(".login-message.error").waitFor();
  await login("outsider@example.test", currentPassword);
  await page.locator(".login-message.error").waitFor();
  assert.equal((await context.request.get(`${base}/api/ops/candidate`)).status(), 401);
  await login("member@example.test", currentPassword);
  await page.locator(".utility-topbar").waitFor();
  assert.match(await page.locator("body").innerText(), /AUTH_TEST_PRIVATE_WORKSPACE/);
  assert.match(await page.locator("body").innerText(), /CONFIDENTIAL_AUTH_FIXTURE_VACANCY/);
  const sessionCookies = (await context.cookies()).filter((cookie) =>
    cookie.name.includes("auth-token")
  );
  assert.ok(sessionCookies.length > 0);
  assert.ok(
    sessionCookies.every((cookie) => cookie.httpOnly && cookie.secure && cookie.sameSite === "Lax")
  );
  assert.ok(!(await page.evaluate(() => document.cookie)).includes("auth-token"));
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  assert.equal(
    (
      await context.request.post(`${base}/api/auth/password`, {
        headers: { Origin: base },
        data: { password: "stolen session cannot reset password" },
      })
    ).status(),
    403
  );
  report.checks.push(
    "Invalid password and non-member rejected; member signs in via real SSR SDK; session cookies Secure/HttpOnly/SameSite; no token storage or ordinary-session password reset"
  );
  await page.setViewportSize({ width: 375, height: 900 });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= 375),
    "Authenticated mobile workspace reflows with sign-out control"
  );
  await audit("authenticated mobile workspace");
  const second = await context.newPage();
  await second.goto(`${base}/qa`);
  await second.locator(".utility-topbar").waitFor();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(`${base}/login`);
  await second.waitForURL(`${base}/login`);
  assert.equal((await context.request.get(`${base}/api/ops/candidate`)).status(), 401);
  report.checks.push(
    "Sign-out clears authenticated access and signs out the other open workspace tab"
  );
  await second.close();

  await page.getByRole("button", { name: "Forgot password?" }).click();
  await page.getByLabel("Work email").fill("member@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("status").waitFor();
  await page.goto(`${base}/auth/callback?code=fixture-recovery-code`);
  await page.getByRole("heading", { name: "Set your password" }).waitFor();
  await audit("password setup");
  await page.getByLabel("New password", { exact: true }).fill("new fixture passphrase 2026");
  await page.getByLabel("Confirm password").fill("new fixture passphrase 2026");
  await page.getByRole("button", { name: "Save password" }).click();
  await page.waitForURL(`${base}/login`);
  assert.equal(currentPassword, "new fixture passphrase 2026");
  await login("member@example.test", currentPassword);
  await page.locator(".utility-topbar").waitFor();
  report.checks.push(
    "Recovery establishes a session-bound grant; setup updates password, signs out, and new-password login succeeds"
  );
  assert.deepEqual(report.pageErrors, []);
  report.providerRequests = providerRequests;
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      { checks: report.checks, accessibility: report.accessibility, pageErrors: report.pageErrors },
      null,
      2
    )
  );
} finally {
  await browser?.close();
  if (app && app.exitCode === null) {
    app.kill("SIGTERM");
    await once(app, "exit");
  }
  fixture.closeAllConnections();
  fixture.close();
}
