import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-next";
import { countResearchBuckets, displayMarketCounts, marketFilterCount } from "@/lib/workspace/market-stats";
import { sanitizeViewState } from "@/lib/workspace/view-state";
import type { CandidateAssignment } from "@/lib/data/types";
import { fetchAllRows } from "@/lib/data/repository";

function candidate(partial: Partial<CandidateAssignment>): CandidateAssignment {
  return {
    assignmentId: "a",
    candidateId: "c",
    name: "Person",
    currentTitle: "Title",
    currentEmployer: "Employer",
    location: "Cape Town",
    marketBucket: "LONGLIST",
    operationalStatus: "SURFACED",
    qaStatus: "PASS",
    whyFit: "Fit",
    claims: [],
    evidenceGaps: [],
    ...partial,
  };
}

describe("auth next path", () => {
  const origin = "https://rec-phi-weld.vercel.app";

  it("keeps same-origin paths and drops open redirects", () => {
    expect(safeNextPath("/qa", origin)).toBe("/qa");
    expect(safeNextPath("/companies?tab=1", origin)).toBe("/companies?tab=1");
    expect(safeNextPath("//evil.com", origin)).toBe("/");
    expect(safeNextPath("/\\evil.com", origin)).toBe("/");
    expect(safeNextPath("https://evil.com", origin)).toBe("/");
    expect(safeNextPath("/%0d%0aSet-Cookie:%20x", origin)).toBe("/");
  });
});

describe("market counts", () => {
  const rows = [
    candidate({ candidateId: "1", marketBucket: "TOP_10", operationalStatus: "EARMARKED" }),
    candidate({ candidateId: "2", marketBucket: "UNREVIEWED", operationalStatus: "SURFACED" }),
    candidate({ candidateId: "3", marketBucket: "LONGLIST", operationalStatus: "EXCLUDED", excludedReason: "CLIENT_INSTRUCTED" }),
    candidate({ candidateId: "4", marketBucket: "EXCLUDED", operationalStatus: "SURFACED" }),
  ];

  it("does not treat unreviewed or recruiter-excluded people as extra credible market", () => {
    const counts = countResearchBuckets(rows);
    expect(counts.credible).toBe(2);
    expect(counts.top10).toBe(1);
    expect(counts.unreviewed).toBe(1);
    expect(counts.recruiterExcluded).toBe(1);
    expect(counts.researchExcluded).toBe(1);
  });

  it("shows a recruiter exclusion in the Excluded grouping without moving the research bucket", () => {
    expect(marketFilterCount(rows, "EXCLUDED")).toBe(2);
    expect(marketFilterCount(rows, "LONGLIST")).toBe(1);
    expect(marketFilterCount(rows, "TOP_10")).toBe(1);
  });

  it("prefers the persisted coverage summary when it is larger than the loaded rows", () => {
    const display = displayMarketCounts(rows, {
      coverageStatus: "COMPLETE",
      credibleMarketCount: 50,
      strongestMarketCount: 22,
      top10Count: 10,
      executedQueryCount: 6,
    });
    expect(display.credible).toBe(50);
    expect(display.strongest).toBe(22);
    expect(display.top10).toBe(10);
  });
});

describe("saved view restore", () => {
  it("drops unknown facets and out-of-vocabulary values", () => {
    const state = sanitizeViewState({
      channelFilter: "FIFTH_CHANNEL",
      archiveFilter: "ARCHIVED",
      density: "COMPACT",
      marketFilter: "TOP_10",
      jobTab: "NOT_A_TAB",
      globalSearch: "Finance",
      evidence: "CONFIRMED",
    });
    expect(state.channelFilter).toBe("ALL");
    expect(state.archiveFilter).toBe("ARCHIVED");
    expect(state.density).toBe("COMPACT");
    expect(state.marketFilter).toBe("TOP_10");
    expect(state.jobTab).toBe("OVERVIEW");
    expect(state.globalSearch).toBe("Finance");
    expect("evidence" in state).toBe(false);
  });
});

describe("repository paging", () => {
  it("follows pages until a short page and surfaces the first error", async () => {
    const pages = [
      { data: [{ id: "1" }, { id: "2" }], error: null },
      { data: [{ id: "3" }], error: null },
    ];
    const result = await fetchAllRows(async (from) => {
      if (from === 0) return { data: Array.from({ length: 1000 }, (_, index) => ({ id: String(index) })), error: null };
      return pages[1];
    });
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1001);

    const failed = await fetchAllRows(async () => ({ data: null, error: { message: "boom" } }));
    expect(failed.error?.message).toBe("boom");
    expect(failed.data).toEqual([]);
  });
});
