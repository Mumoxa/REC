/**
 * Workspace view state — the "recruiter UI state" half of the deliberate split
 * described in ARCHITECTURE_GUARD.md:
 *
 * - view state: filters, search, density, selected records, pane state;
 * - operational state: vacancy lifecycle and candidate recruiter workflow;
 * - research evidence: owned by the opportunity / candidate-map / QA schemas.
 *
 * Saved views persist view state only. Nothing here may become evidence, and
 * nothing here may overwrite it. This module is isomorphic so the browser and
 * the saved-view API agree on what a valid view state is.
 */

import { MAX_VIEW_STATE_STRING_LENGTH } from "@/lib/ops/validation";
import type { MarketBucket } from "@/lib/data/types";

export const WORKSPACE_JOB_TABS = [
  "OVERVIEW",
  "HIRING_TEAM",
  "REQUIREMENTS",
  "SOURCES",
  "SEARCH_LOG",
  "QA",
] as const;

export type JobTab = (typeof WORKSPACE_JOB_TABS)[number];

export const WORKSPACE_DENSITIES = ["EXPANDED", "COMPACT", "MINIMAL"] as const;
export type WorkspaceDensity = (typeof WORKSPACE_DENSITIES)[number];

export const WORKSPACE_ARCHIVE_FILTERS = ["ACTIVE", "ARCHIVED", "ALL"] as const;
export type WorkspaceArchiveFilter = (typeof WORKSPACE_ARCHIVE_FILTERS)[number];

export const WORKSPACE_CHANNEL_FILTERS = [
  "ALL",
  "AGREED_CLIENTS",
  "AGENCY_SITES",
  "LINKEDIN",
  "JOB_BOARDS",
] as const;

export const WORKSPACE_MARKET_FILTERS: Array<MarketBucket | "ALL"> = [
  "ALL",
  "TOP_10",
  "STRONG_MARKET",
  "LONGLIST",
  "UNREVIEWED",
  "EXCLUDED",
];

export interface WorkspaceViewState {
  globalSearch: string;
  candidateSearch: string;
  channelFilter: string;
  regionFilter: string;
  archiveFilter: WorkspaceArchiveFilter;
  density: WorkspaceDensity;
  marketFilter: MarketBucket | "ALL";
  jobTab: JobTab;
}

export const DEFAULT_VIEW_STATE: WorkspaceViewState = {
  globalSearch: "",
  candidateSearch: "",
  channelFilter: "ALL",
  regionFilter: "ALL",
  archiveFilter: "ACTIVE",
  density: "EXPANDED",
  marketFilter: "ALL",
  jobTab: "OVERVIEW",
};

function boundedText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value.length > MAX_VIEW_STATE_STRING_LENGTH) {
    return value.slice(0, MAX_VIEW_STATE_STRING_LENGTH);
  }
  return value;
}

function fromList<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * Coerces whatever was persisted in a saved view into a valid view state.
 * Unknown keys, wrong types and out-of-vocabulary values are dropped rather
 * than trusted, so a corrupted or hand-edited saved view cannot put the
 * workspace into an unreachable UI state.
 */
export function sanitizeViewState(value: unknown): WorkspaceViewState {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const globalSearch = boundedText(raw.globalSearch);
  const candidateSearch = boundedText(raw.candidateSearch);
  const channelFilter = fromList(raw.channelFilter, WORKSPACE_CHANNEL_FILTERS);
  const regionFilter = boundedText(raw.regionFilter);
  const archiveFilter = fromList(raw.archiveFilter, WORKSPACE_ARCHIVE_FILTERS);
  const density = fromList(raw.density, WORKSPACE_DENSITIES);
  const marketFilter = fromList(raw.marketFilter, WORKSPACE_MARKET_FILTERS);
  const jobTab = fromList(raw.jobTab, WORKSPACE_JOB_TABS);

  return {
    globalSearch: globalSearch ?? DEFAULT_VIEW_STATE.globalSearch,
    candidateSearch: candidateSearch ?? DEFAULT_VIEW_STATE.candidateSearch,
    channelFilter: channelFilter ?? DEFAULT_VIEW_STATE.channelFilter,
    // Region names are data-driven, so only bound the text.
    regionFilter: regionFilter ?? DEFAULT_VIEW_STATE.regionFilter,
    archiveFilter: archiveFilter ?? DEFAULT_VIEW_STATE.archiveFilter,
    density: density ?? DEFAULT_VIEW_STATE.density,
    marketFilter: marketFilter ?? DEFAULT_VIEW_STATE.marketFilter,
    jobTab: jobTab ?? DEFAULT_VIEW_STATE.jobTab,
  };
}

export function serializeViewState(state: WorkspaceViewState): WorkspaceViewState {
  return sanitizeViewState(state);
}
