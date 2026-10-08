import type { CandidateAssignment, CandidateMarketSummary, MarketBucket } from "@/lib/data/types";

export interface ResearchBucketCounts {
  credible: number;
  longlist: number;
  strongest: number;
  top10: number;
  unreviewed: number;
  researchExcluded: number;
  recruiterExcluded: number;
}

const EMPTY_COUNTS: ResearchBucketCounts = {
  credible: 0,
  longlist: 0,
  strongest: 0,
  top10: 0,
  unreviewed: 0,
  researchExcluded: 0,
  recruiterExcluded: 0,
};

/**
 * Credible market is LONGLIST + STRONG_MARKET + TOP_10.
 * UNREVIEWED and research-EXCLUDED are not credible. Recruiter exclusion is a
 * separate workflow fact and must not be counted as a research exclusion.
 */
export function countResearchBuckets(candidates: CandidateAssignment[]): ResearchBucketCounts {
  const counts = { ...EMPTY_COUNTS };
  for (const candidate of candidates) {
    if (
      candidate.marketBucket === "LONGLIST" ||
      candidate.marketBucket === "STRONG_MARKET" ||
      candidate.marketBucket === "TOP_10"
    ) {
      counts.credible += 1;
    }
    if (candidate.marketBucket === "LONGLIST") counts.longlist += 1;
    if (candidate.marketBucket === "STRONG_MARKET" || candidate.marketBucket === "TOP_10") {
      counts.strongest += 1;
    }
    if (candidate.marketBucket === "TOP_10") counts.top10 += 1;
    if (candidate.marketBucket === "UNREVIEWED") counts.unreviewed += 1;
    if (candidate.marketBucket === "EXCLUDED") counts.researchExcluded += 1;
    if (candidate.operationalStatus === "EXCLUDED") counts.recruiterExcluded += 1;
  }
  return counts;
}

export interface DisplayMarketCounts {
  credible: number;
  strongest: number;
  top10: number;
  longlist: number;
  executedQueries: number | null;
}

/**
 * Prefer the persisted coverage summary (the full researched market) but never
 * report fewer people than the assignment rows actually loaded.
 */
export function displayMarketCounts(
  candidates: CandidateAssignment[],
  summary?: CandidateMarketSummary | null,
  executedQueryFallback?: number,
): DisplayMarketCounts {
  const computed = countResearchBuckets(candidates);
  return {
    credible: Math.max(summary?.credibleMarketCount ?? 0, computed.credible),
    strongest: Math.max(summary?.strongestMarketCount ?? 0, computed.strongest),
    top10: Math.max(summary?.top10Count ?? 0, computed.top10),
    longlist: computed.longlist,
    executedQueries: summary?.executedQueryCount ?? executedQueryFallback ?? null,
  };
}

export function marketFilterCount(
  candidates: CandidateAssignment[],
  bucket: MarketBucket | "ALL",
): number {
  if (bucket === "ALL") return candidates.length;
  if (bucket === "EXCLUDED") {
    return candidates.filter(
      (candidate) =>
        candidate.operationalStatus === "EXCLUDED" || candidate.marketBucket === "EXCLUDED",
    ).length;
  }
  return candidates.filter((candidate) => candidate.marketBucket === bucket).length;
}
