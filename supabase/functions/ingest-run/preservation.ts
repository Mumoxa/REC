/**
 * Idempotent-publication rules for REC ingestion.
 *
 * Checkpoints republish the same canonical keys. A later, weaker payload must
 * not erase a stronger client relationship, the original channel provenance,
 * or the earliest first-seen timestamp. Recruiter closes are sticky: research
 * ingestion never reopens or closes a vacancy.
 */

const CLIENT_STATUS_RANK: Record<string, number> = {
  UNKNOWN: 0,
  TARGET_PROSPECT: 1,
  PAST_CLIENT: 2,
  AGREED_GROUP_ENTITY: 3,
  AGREED_CLIENT: 4,
};

const LIFECYCLE_RANK: Record<string, number> = {
  DISCOVERED: 0,
  VERIFYING: 1,
  QUALIFIED: 2,
  EMPLOYER_RESOLVED: 3,
  CANDIDATE_MAPPING: 4,
  MARKET_READY: 5,
  CLIENT_ACTION: 6,
};

export function preserveClientStatus(
  existing: string | null | undefined,
  incoming: string | null | undefined,
): string {
  const current = existing && existing in CLIENT_STATUS_RANK ? existing : "UNKNOWN";
  const next = incoming && incoming in CLIENT_STATUS_RANK ? incoming : "UNKNOWN";
  return CLIENT_STATUS_RANK[next] >= CLIENT_STATUS_RANK[current] ? next : current;
}

export function preserveFirstSeen(
  existing: string | null | undefined,
  incoming: string | null | undefined,
  now: string,
): string {
  const timestamps = [existing, incoming].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value)),
  );
  if (timestamps.length === 0) return now;
  return timestamps.reduce((earliest, value) =>
    Date.parse(value) < Date.parse(earliest) ? value : earliest,
  );
}

/** Keep the channel/source that first established the canonical record. */
export function preserveProvenance(
  existing: string | null | undefined,
  incoming: string | null | undefined,
  fallback: string,
): string {
  if (typeof existing === "string" && existing.trim()) return existing;
  if (typeof incoming === "string" && incoming.trim()) return incoming;
  return fallback;
}

/**
 * Returns the lifecycle to write, or null when the existing recruiter/research
 * state must be left untouched.
 *
 * - CLOSED is sticky and is never written by ingestion.
 * - An explicit payload lifecycle may move research state, including backwards
 *   to VERIFYING when new evidence fails QA.
 * - An inferred lifecycle may only advance, so a partial checkpoint cannot
 *   wipe a later research stage.
 */
export function nextResearchLifecycle(
  existing: string | null | undefined,
  incoming: string | null | undefined,
  explicit: boolean,
): string | null {
  if (!incoming || incoming === "CLOSED" || !(incoming in LIFECYCLE_RANK)) return null;
  if (!existing) return incoming;
  if (existing === "CLOSED") return null;
  if (explicit) return incoming === existing ? null : incoming;
  const existingRank = LIFECYCLE_RANK[existing] ?? -1;
  if (LIFECYCLE_RANK[incoming] > existingRank) return incoming;
  return null;
}
