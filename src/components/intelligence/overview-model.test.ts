import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { buildIntelligenceOverview, researchPriorities } from "./overview-model";

describe("intelligence count scopes", () => {
  it("keeps lifecycle counts disjoint and loaded people separate from vacancy memberships", () => {
    const base = demoSnapshot.vacancies[0];
    const snapshot = {
      ...demoSnapshot,
      vacancies: [base, { ...base, id: "second", lifecycleStatus: "CLOSED" as const }],
    };
    const result = buildIntelligenceOverview(snapshot);
    expect(result.active.length).toBe(1);
    expect(result.newCount).toBe(1);
    expect(result.candidateCount).toBe(base.candidates.length);
    expect(result.market.credible).toBe(base.candidateMarketSummary.credibleMarketCount);
    expect(result.lifecycle.reduce((n, item) => n + item.count, 0)).toBe(1);
    expect(result.lifecycle.find((item) => item.status === base.lifecycleStatus)?.count).toBe(1);
  });

  it("shows each real blocker without deriving a false completion percentage", () => {
    const base = demoSnapshot.vacancies[0];
    const reasons = researchPriorities({
      ...base,
      employerStatus: "PROBABLE",
      qaStatus: "FAIL_RESEARCH_REQUIRED",
      candidateMapStatus: "IN_PROGRESS",
      stakeholderMapStatus: "BLOCKED_WITH_EVIDENCE",
    });
    expect(reasons).toHaveLength(4);
    expect(
      researchPriorities({
        ...base,
        employerStatus: "CONFIRMED",
        qaStatus: "PASS",
        candidateMapStatus: "READY",
        stakeholderMapStatus: "READY",
      })
    ).toEqual([]);
  });
});
