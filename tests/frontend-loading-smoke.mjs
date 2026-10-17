import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.REC_TEST_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const route of ["/", "/candidates", "/companies"]) {
    // A new context keeps every measurement a cold browser load.
    const context = await browser.newContext();
    const page = await context.newPage();
    const prefetched = [];
    const scripts = new Set();
    page.on("request", (request) => {
      if (request.headers()["next-router-prefetch"])
        prefetched.push(new URL(request.url()).pathname);
      if (request.resourceType() === "script") scripts.add(request.url());
    });
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".env-badge").innerText(), "Demo data");
    const metrics = await page.evaluate(() => ({
      scriptBytes: performance
        .getEntriesByType("resource")
        .filter((entry) => entry.initiatorType === "script")
        .reduce((bytes, entry) => bytes + entry.encodedBodySize, 0),
      cssBytes: performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes(".css"))
        .reduce((bytes, entry) => bytes + entry.encodedBodySize, 0),
      loadMs: performance.getEntriesByType("navigation")[0].duration,
    }));
    const initialScripts = scripts.size;
    let detailScripts = 0;
    if (route === "/candidates") {
      await page.getByRole("button", { name: "Open intelligence for Alicia Daniels" }).click();
      await page
        .getByRole("dialog", { name: "Candidate intelligence" })
        .getByRole("heading", { name: "Alicia Daniels" })
        .waitFor();
      detailScripts = scripts.size - initialScripts;
      await page.keyboard.press("Escape");
      await page
        .getByRole("dialog", { name: "Candidate intelligence" })
        .waitFor({ state: "hidden" });
    }
    if (route === "/companies") {
      await page.locator(".org-card h3 a").first().click();
      await page.getByRole("tablist", { name: "Organisation intelligence" }).waitFor();
      detailScripts = scripts.size - initialScripts;
    }
    results.push({ route, ...metrics, initialScripts, detailScripts, prefetched });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
if (process.env.REC_PERFORMANCE_REPORT)
  await fs.writeFile(process.env.REC_PERFORMANCE_REPORT, JSON.stringify(results, null, 2));
for (const result of results)
  assert.deepEqual(result.prefetched, [], `${result.route}: avoid speculative workspace requests`);
for (const route of ["/candidates", "/companies"])
  assert.ok(
    results.find((result) => result.route === route).detailScripts > 0,
    `${route}: detail code must load when the record is opened`
  );
