/**
 * Shared operational-operation validation.
 *
 * These rules are the machine-readable arm of the workspace operational-state
 * contract (`schemas/workspace-operational-state.schema.json`) and of the
 * golden cases in `tests/workspace-ui-golden-cases.yaml`:
 *
 * - `close_requires_reason_and_timestamp`
 * - `close_other_reason_requires_explanation`
 * - `exclude_requires_reason`
 *
 * They are deliberately pure and isomorphic so that the API routes and the
 * browser workspace apply exactly the same rule set, and so the rules can be
 * unit-tested without a database.
 */

export const CANDIDATE_OPERATIONAL_STATUSES = [
  "SURFACED",
  "RELEVANT",
  "EARMARKED",
  "TOP_10",
  "APPROACH",
  "ENGAGED",
  "SUBMITTED",
  "EXCLUDED",
] as const;

export type OperationalStatusValue = (typeof CANDIDATE_OPERATIONAL_STATUSES)[number];

export const EXCLUSION_REASONS = [
  "NOT_SUBMITTED",
  "NO_LONGER_RELEVANT",
  "COMPETITOR_EXCLUSIVE",
  "CLIENT_INSTRUCTED",
  "OTHER",
] as const;

export type ExclusionReasonValue = (typeof EXCLUSION_REASONS)[number];

export const VACANCY_CLOSE_REASONS = [
  "FILLED",
  "EXPIRED",
  "CLIENT_NO_LONGER_HIRING",
  "NOT_COMMERCIALLY_RELEVANT",
  "DUPLICATE",
  "CANCELLED",
  "OTHER",
] as const;

export type CloseReasonValue = (typeof VACANCY_CLOSE_REASONS)[number];

export const MAX_SAVED_VIEW_NAME_LENGTH = 80;
export const MAX_SAVED_VIEW_STATE_BYTES = 20_000;
export const MAX_VIEW_STATE_STRING_LENGTH = 200;
export const MAX_REASON_DETAIL_LENGTH = 500;
export const MAX_ID_LENGTH = 200;

/**
 * True only for a non-empty, non-whitespace string.
 * Whitespace-only reasons/explanations are rejected by the contract.
 */
export function hasMeaningfulText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function isBoundedId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_ID_LENGTH
  );
}

export interface CandidateOperationInput {
  vacancyId: string;
  candidateId: string;
  operationalStatus: OperationalStatusValue;
  /** Persisted only for EXCLUDED; always null for every other status. */
  excludedReason: string | null;
}

export function validateCandidateOperation(
  body: unknown
): ValidationResult<CandidateOperationInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid candidate operation payload." };
  }

  const { vacancyId, candidateId, operationalStatus, reason } = body as Record<
    string,
    unknown
  >;

  if (!isBoundedId(vacancyId) || !isBoundedId(candidateId)) {
    return {
      ok: false,
      error: "Invalid candidate operation: vacancy/candidate id missing.",
    };
  }

  if (
    typeof operationalStatus !== "string" ||
    !CANDIDATE_OPERATIONAL_STATUSES.includes(
      operationalStatus as OperationalStatusValue
    )
  ) {
    return { ok: false, error: "Invalid candidate operation status." };
  }

  const status = operationalStatus as OperationalStatusValue;

  if (status === "EXCLUDED") {
    if (!hasMeaningfulText(reason)) {
      return {
        ok: false,
        error: "Candidate exclusion requires a reason.",
      };
    }
    if (reason.trim().length > MAX_REASON_DETAIL_LENGTH) {
      return { ok: false, error: "Candidate exclusion reason is too long." };
    }
    return {
      ok: true,
      value: {
        vacancyId,
        candidateId,
        operationalStatus: status,
        excludedReason: reason.trim(),
      },
    };
  }

  return {
    ok: true,
    value: { vacancyId, candidateId, operationalStatus: status, excludedReason: null },
  };
}

export interface VacancyCloseInput {
  vacancyId: string;
  reason: CloseReasonValue;
  /** Required (non-blank) when reason is OTHER, null otherwise. */
  reasonDetail: string | null;
}

export function validateVacancyOperation(
  body: unknown
): ValidationResult<VacancyCloseInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid vacancy operation payload." };
  }

  const { vacancyId, action, reason, reasonDetail } = body as Record<string, unknown>;

  if (!isBoundedId(vacancyId)) {
    return { ok: false, error: "Invalid vacancy operation: vacancy id missing." };
  }

  if (action !== "CLOSE") {
    return { ok: false, error: "Invalid vacancy operation action." };
  }

  if (
    typeof reason !== "string" ||
    !VACANCY_CLOSE_REASONS.includes(reason as CloseReasonValue)
  ) {
    return { ok: false, error: "Invalid vacancy close reason." };
  }

  const closeReason = reason as CloseReasonValue;

  if (closeReason === "OTHER") {
    if (!hasMeaningfulText(reasonDetail)) {
      return {
        ok: false,
        error: "Closing a vacancy with reason OTHER requires an explanation.",
      };
    }
    if (reasonDetail.trim().length > MAX_REASON_DETAIL_LENGTH) {
      return { ok: false, error: "Vacancy close explanation is too long." };
    }
    return {
      ok: true,
      value: { vacancyId, reason: closeReason, reasonDetail: reasonDetail.trim() },
    };
  }

  return { ok: true, value: { vacancyId, reason: closeReason, reasonDetail: null } };
}

export interface SavedViewInput {
  name: string;
  viewState: Record<string, unknown>;
}

export function validateSavedView(body: unknown): ValidationResult<SavedViewInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid saved view payload." };
  }

  const { name, viewState } = body as Record<string, unknown>;

  if (!hasMeaningfulText(name)) {
    return { ok: false, error: "Invalid view name." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length > MAX_SAVED_VIEW_NAME_LENGTH) {
    return { ok: false, error: "Invalid view name." };
  }

  if (!viewState || typeof viewState !== "object" || Array.isArray(viewState)) {
    return { ok: false, error: "Invalid viewState." };
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(viewState);
  } catch {
    return { ok: false, error: "Invalid viewState." };
  }

  if (typeof serialized !== "string") {
    return { ok: false, error: "Invalid viewState." };
  }

  if (serialized.length > MAX_SAVED_VIEW_STATE_BYTES) {
    return { ok: false, error: "viewState too large (max 20KB)." };
  }

  return {
    ok: true,
    value: { name: trimmedName, viewState: viewState as Record<string, unknown> },
  };
}

/**
 * Reads a JSON request body without ever throwing. Returns null for malformed,
 * empty or oversized bodies so routes can answer 400 instead of a 500 crash.
 */
export async function readJsonBody(
  request: Request,
  maxBytes = 1_000_000
): Promise<unknown | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return null;
  }
  try {
    const text = await request.text();
    if (!text.trim()) return null;
    if (text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Constant-time string comparison for shared-secret checks. */
export function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  // Length is not secret-critical here, but avoid early-exit deep comparisons.
  let mismatch = left.length === right.length ? 0 : 1;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return mismatch === 0;
}
