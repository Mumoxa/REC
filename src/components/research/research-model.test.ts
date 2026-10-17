import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import type { Vacancy } from "@/lib/data/types";
import {
  buildEvidenceRecords,
  collectStakeholders,
  formatRunDuration,
  runStatusNote,
  safePublicUrl,
} from "./research-model";

const base = demoSnapshot.vacancies[0];

function vacancy(overrides: Partial<Vacancy> = {}): Vacancy {
  return { ...base, ...overrides };
}

describe("research read models", () => {
  it("preserves stakeholder mappings with repeated keys in different vacancies", () => {
    const stakeholder = {
      id: "person-1",
      key: "repeated-key",
      name: "Alex One",
      evidenceStatus: "CONFIRMED" as const,
    };
    const rows = collectStakeholders([
      vacancy({ id: "vacancy-a", stakeholders: [stakeholder] }),
      vacancy({ id: "vacancy-b", stakeholders: [{ ...stakeholder, name: "Alex Two" }] }),
    ]);
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.id)).size).toBe(2);
    expect(rows[1].person.name).toBe("Alex Two");
  });

  it("includes candidate failed gates, unknown claims and explicit gaps with exact assignment context", () => {
    const candidate = {
      ...base.candidates[0],
      candidateId: "candidate & 1",
      assignmentId: "assignment-a",
      qaStatus: "FAIL_RESEARCH_REQUIRED" as const,
      claims: [{ name: "Leadership", value: "Unverified", status: "UNKNOWN" as const }],
      evidenceGaps: ["Direct-report scope"],
    };
    const records = buildEvidenceRecords([vacancy({ id: "vacancy & 1", candidates: [candidate] })]);
    const gate = records.find((record) => record.kind === "CANDIDATE_QA");
    expect(gate?.status).toBe("FAIL_RESEARCH_REQUIRED");
    expect(gate?.entityHref).toBe(
      "/candidates?candidate=candidate%20%26%201&vacancy=vacancy%20%26%201"
    );
    expect(records.find((record) => record.kind === "CLAIM")?.status).toBe("UNKNOWN");
    expect(records.find((record) => record.kind === "GAP")?.description).toBe(
      "Direct-report scope"
    );
  });

  it("keeps confirmed vacancy sources in the register without putting them in the review queue", () => {
    const records = buildEvidenceRecords([vacancy({ candidates: [], requirements: [] })]);
    const source = records.find(
      (record) => record.kind === "SOURCE" && record.status === "CONFIRMED"
    );
    expect(source?.needsReview).toBe(false);
    expect(source?.vacancyId).toBe(base.id);
    expect(records.some((record) => record.kind === "SOURCE" && record.needsReview)).toBe(true);
  });

  it("does not infer publication outcomes from failed or complete run statuses", () => {
    expect(runStatusNote("FAILED")).not.toMatch(/did not publish|no results|nothing published/i);
    expect(runStatusNote("COMPLETE")).not.toMatch(/results published|persistence verified/i);
    expect(runStatusNote("PARTIAL")).toMatch(/partial/i);
  });

  it("uses only recorded timestamps for duration and rejects invalid times", () => {
    expect(formatRunDuration("2026-10-16T08:00:00Z", "2026-10-16T09:18:00Z")).toBe("1h 18m");
    expect(formatRunDuration("bad", "2026-10-16T09:18:00Z")).toBe("Not recorded");
    expect(formatRunDuration("2026-10-16T08:00:00Z", null)).toBe("Not recorded");
    expect(formatRunDuration("2026-10-16T09:00:00Z", "2026-10-16T08:00:00Z")).toBe("Not recorded");
  });

  it("limits external profile and source links to public HTTP URLs", () => {
    expect(safePublicUrl("https://example.com/profile")).toBe("https://example.com/profile");
    expect(safePublicUrl("javascript:alert(1)")).toBeNull();
    expect(safePublicUrl("not a URL")).toBeNull();
  });
});
