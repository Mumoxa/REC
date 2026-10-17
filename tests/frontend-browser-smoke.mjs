import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// This runner intentionally requires the existing synthetic demo and blocks writes.
const base = process.env.REC_TEST_BASE_URL || "http://localhost:3000";
const output = process.env.REC_SCREENSHOT_DIR || "/tmp/rec-browser-qa";
const widths = [375, 430, 768, 1024, 1280, 1440, 1920];
const routes = [
  ["/intelligence", "intelligence"],
  ["/", "vacancies"],
  ["/companies", "organisations"],
  ["/candidates", "candidates"],
  ["/stakeholders", "stakeholders"],
  ["/qa", "evidence-qa"],
  ["/runs", "runs"],
  ["/login", "login"],
];
const report = {
  viewports: [],
  accessibility: [],
  interactions: [],
  pageErrors: [],
  blockedWrites: [],
};
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
});
const context = await browser.newContext();
await context.route("**/api/ops/**", async (route) => {
  report.blockedWrites.push(route.request().url());
  await route.abort();
});

async function open(page, route) {
  const response = await page.goto(`${base}${route}`, { waitUntil: "load" });
  assert.equal(response.status(), 200, route);
  await page.locator(route.startsWith("/login") ? ".login-form" : ".utility-topbar").waitFor();
  if (!route.startsWith("/login")) {
    assert.equal(
      await page.locator(".env-badge").innerText(),
      "Demo data",
      "Browser tests require synthetic demo mode"
    );
  }
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some((button) =>
      Object.keys(button).some((key) => key.startsWith("__reactProps$"))
    )
  );
}
function observe(page) {
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
}
async function settleMotion(page) {
  await page.evaluate(async () => {
    const animations = document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
  });
}

async function audit(page, name) {
  await settleMotion(page);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
    .analyze();
  const violations = result.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    targets: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
  }));
  report.accessibility.push({ name, violations });
}
async function screenshot(page, name, fullPage = true) {
  await settleMotion(page);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage });
}
async function globalSearch(page, query, kind) {
  await page.getByRole("button", { name: "Search intelligence", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search intelligence", exact: true });
  await dialog.getByRole("searchbox").fill(query);
  const link = dialog
    .locator(".search-results a")
    .filter({ hasText: kind })
    .filter({ hasText: query })
    .first();
  await link.click();
  await dialog.waitFor({ state: "hidden" });
}
try {
  for (const width of process.argv.includes("--details-only") ? [] : widths) {
    for (const [route, name] of routes) {
      const page = await context.newPage();
      observe(page);
      await page.setViewportSize({ width, height: 1000 });
      await open(page, route);
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      report.viewports.push({ route, width, documentWidth, http: 200 });
      assert.ok(documentWidth <= width + 1, `${route} overflows at ${width}px: ${documentWidth}`);
      if (width === 375 || width === 1440) await screenshot(page, `rec-${name}-${width}`);
      if (width === 1440) await audit(page, name);
      await page.close();
    }
  }
  const page = await context.newPage();
  observe(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, "/?vacancy=vac-001");
  await globalSearch(page, "Group Accountant", "Vacancy");
  await page.locator(".job-header h2").filter({ hasText: "Group Accountant" }).waitFor();
  await globalSearch(page, "Head of Finance", "Vacancy");
  await page.locator(".job-header h2").filter({ hasText: "Head of Finance" }).waitFor();
  report.interactions.push(
    "Global search applies exact vacancy targets on same-route client navigation"
  );

  await page.getByLabel("Filter by relationship").selectOption("AGREED");
  await page.getByLabel("Filter by research stage").selectOption("IN_PROGRESS");
  await page.getByLabel("Sort vacancies").selectOption("TITLE");
  await page.getByLabel("Saved view name").fill("Browser QA view");
  await page.getByRole("button", { name: "Save current view" }).click();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await page.getByLabel("Sort vacancies").selectOption("RECENT");
  await page.getByLabel("Load saved view").selectOption("Browser QA view");
  assert.equal(await page.getByLabel("Filter by relationship").inputValue(), "AGREED");
  assert.equal(await page.getByLabel("Sort vacancies").inputValue(), "TITLE");
  assert.equal(
    await page.getByRole("listbox", { name: "Vacancy list" }).getByRole("option").count(),
    1
  );
  report.interactions.push("Saved views round-trip relationship, research stage and ordering");

  await open(page, "/companies");
  await page.locator(".org-card h3 a").first().click();
  const tabs = page.getByRole("tablist", { name: "Organisation intelligence" });
  for (const label of [
    "Overview",
    "Vacancies",
    "Hiring stakeholders",
    "Candidate connections",
    "Research evidence",
    "Commercial relationship",
    "Hiring history",
  ]) {
    const tab = tabs.getByRole("tab", { name: label, exact: true });
    await tab.click();
    assert.equal(await tab.getAttribute("aria-selected"), "true");
  }
  await tabs.getByRole("tab", { name: "Overview", exact: true }).click();
  await screenshot(page, "rec-organisation-detail-1440");
  await audit(page, "organisation detail");
  report.interactions.push("Organisation detail exposes seven functional canonical-data tabs");

  await open(page, "/candidates?candidate=c-1&vacancy=vac-001");
  const candidate = page.getByRole("dialog", { name: "Candidate intelligence", exact: true });
  await candidate.getByRole("heading", { name: "Alicia Daniels" }).waitFor();
  await screenshot(page, "rec-candidate-detail-1440", false);
  await audit(page, "candidate detail");
  await candidate
    .getByRole("combobox", { name: "Recruiter workflow status" })
    .selectOption("APPROACH");
  await candidate.getByRole("button", { name: "Update workflow", exact: true }).click();
  assert.match(
    await candidate.getByRole("group", { name: "Current recruiter stage" }).innerText(),
    /Approach/
  );
  assert.match(
    await candidate.locator(".candidate-association-list").innerText(),
    /Research Top 10/
  );
  await page.keyboard.press("Escape");
  await candidate.waitFor({ state: "hidden" });
  report.interactions.push(
    "Candidate demo workflow changes retain independent research Top 10; Escape closes detail"
  );

  await open(page, "/runs");
  await globalSearch(page, "RUN-20261004-001", "Research run");
  await page.waitForFunction(
    () =>
      document.querySelector('.research-run-surface input[type="search"]')?.value ===
      "RUN-20261004-001"
  );
  assert.equal(await page.getByLabel("Search research runs").inputValue(), "RUN-20261004-001");
  await globalSearch(page, "RUN-20261004-002", "Research run");
  await page.waitForFunction(
    () =>
      document.querySelector('.research-run-surface input[type="search"]')?.value ===
      "RUN-20261004-002"
  );
  assert.equal(await page.getByLabel("Search research runs").inputValue(), "RUN-20261004-002");
  await page.getByRole("button", { name: "Inspect run RUN-20261004-002" }).click();
  await screenshot(page, "rec-run-detail-1440", false);
  await audit(page, "run detail");
  await page.keyboard.press("Escape");
  report.interactions.push("Run search updates same-route state and opens recorded metrics");

  await page.setViewportSize({ width: 375, height: 1000 });
  await open(page, "/intelligence");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const navigation = page.getByRole("dialog", { name: "Navigation", exact: true });
  await navigation.getByRole("navigation", { name: "Primary" }).waitFor();
  await audit(page, "mobile navigation");
  await page.keyboard.press("Escape");
  assert.equal(await trigger.evaluate((el) => el === document.activeElement), true);
  await trigger.click();
  await navigation.getByRole("link", { name: /Vacancies/ }).click();
  await page
    .getByRole("listbox", { name: "Vacancy list" })
    .getByRole("option", { name: /Head of Finance/ })
    .click();
  assert.equal(
    await page.locator(".workspace-grid").getAttribute("data-mobile-pane"),
    "INTELLIGENCE"
  );
  await page.getByRole("button", { name: "Candidates", exact: true }).click();
  await page.getByLabel("Search candidate market").fill("Alicia");
  await page.getByRole("button", { name: "Intelligence", exact: true }).click();
  await page.getByRole("button", { name: "Candidates", exact: true }).click();
  assert.equal(await page.getByLabel("Search candidate market").inputValue(), "Alicia");
  report.interactions.push(
    "Mobile drawer restores focus; vacancy/pane navigation preserves selection and candidate search"
  );

  await open(page, "/?vacancy=vac-001");
  await page.getByRole("button", { name: "Close vacancy", exact: true }).click();
  const close = page.getByRole("dialog", { name: "Close vacancy confirmation", exact: true });
  await close.getByLabel("Reason for closing").selectOption("OTHER");
  assert.equal(
    await close.getByRole("button", { name: "Confirm close vacancy" }).isDisabled(),
    true
  );
  await close.getByLabel("Explanation for OTHER").fill("Synthetic browser test only");
  await screenshot(page, "rec-vacancy-confirmation-375", false);
  await audit(page, "vacancy closure confirmation");
  await close.getByRole("button", { name: "Cancel close" }).click();
  await screenshot(page, "rec-vacancy-detail-375");
  report.interactions.push(
    "Vacancy closure requires an explanation for OTHER and supports safe cancellation"
  );

  await open(page, "/candidates?candidate=c-1&vacancy=vac-001");
  await screenshot(page, "rec-candidate-detail-375", false);
  await page.keyboard.press("Escape");
  await open(page, "/companies");
  await page.locator(".org-card h3 a").first().click();
  await screenshot(page, "rec-organisation-detail-375");
  assert.deepEqual(
    report.accessibility.filter((scan) => scan.violations.length),
    [],
    "Accessibility violations found"
  );
  assert.deepEqual(report.pageErrors, [], "Browser reported JavaScript errors");
  assert.deepEqual(report.blockedWrites, [], "Synthetic demo attempted a backend operation");
  console.log(
    `Browser checks passed: ${report.viewports.length} viewport/route combinations, ${report.accessibility.length} accessibility scans, ${report.interactions.length} interaction groups.`
  );
} finally {
  await fs.writeFile(path.join(output, "browser-report.json"), JSON.stringify(report, null, 2));
  await browser.close();
}
