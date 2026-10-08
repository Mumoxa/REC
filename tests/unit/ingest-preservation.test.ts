import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  nextResearchLifecycle,
  preserveClientStatus,
  preserveFirstSeen,
  preserveProvenance,
} from "../../supabase/functions/ingest-run/preservation";

describe("idempotent publication preservation", () => {
  it("does not let a weaker republish erase an agreed client", () => {
    expect(preserveClientStatus("AGREED_CLIENT", "UNKNOWN")).toBe("AGREED_CLIENT");
    expect(preserveClientStatus("UNKNOWN", "AGREED_CLIENT")).toBe("AGREED_CLIENT");
    expect(preserveClientStatus("PAST_CLIENT", "TARGET_PROSPECT")).toBe("PAST_CLIENT");
    expect(preserveClientStatus(null, "TARGET_PROSPECT")).toBe("TARGET_PROSPECT");
  });

  it("keeps the earliest first-seen timestamp", () => {
    expect(
      preserveFirstSeen("2026-10-01T08:00:00Z", "2026-10-06T08:00:00Z", "2026-10-07T00:00:00Z")
    ).toBe("2026-10-01T08:00:00Z");
    expect(preserveFirstSeen(null, "not-a-date", "2026-10-07T00:00:00Z")).toBe(
      "2026-10-07T00:00:00Z"
    );
  });

  it("retains original channel provenance", () => {
    expect(preserveProvenance("AGENCY_SITES", "JOB_BOARDS", "LINKEDIN")).toBe("AGENCY_SITES");
    expect(preserveProvenance(null, "LINKEDIN", "JOB_BOARDS")).toBe("LINKEDIN");
  });

  it("advances research lifecycle without reopening or closing via ingestion", () => {
    expect(nextResearchLifecycle("DISCOVERED", "MARKET_READY", false)).toBe("MARKET_READY");
    expect(nextResearchLifecycle("MARKET_READY", "DISCOVERED", false)).toBeNull();
    expect(nextResearchLifecycle("MARKET_READY", "VERIFYING", true)).toBe("VERIFYING");
    expect(nextResearchLifecycle("CLOSED", "MARKET_READY", true)).toBeNull();
    expect(nextResearchLifecycle("QUALIFIED", "CLOSED", true)).toBeNull();
    expect(nextResearchLifecycle(null, "EMPLOYER_RESOLVED", false)).toBe("EMPLOYER_RESOLVED");
  });

  it("is actually used by the ingestion function, and recruiter workflow stays sticky", () => {
    const source = fs.readFileSync(
      path.resolve("supabase/functions/ingest-run/index.ts"),
      "utf8"
    );
    expect(source).toContain("preserveClientStatus");
    expect(source).toContain("preserveFirstSeen");
    expect(source).toContain("nextResearchLifecycle");
    expect(source).toContain('from("qa_reviews")');
    expect(source).toMatch(/from\("qa_reviews"\)\.update/);
    expect(source).toMatch(
      /from\("candidate_operations"\)[\s\S]{0,400}ignoreDuplicates: true/
    );
    expect(source).not.toMatch(
      /from\("vacancy_operations"\)[\s\S]{0,240}ignoreDuplicates: true/
    );
  });
});
