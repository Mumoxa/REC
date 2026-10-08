import { describe, expect, it } from "vitest";
import {
  readJsonBody,
  safeEqual,
  validateCandidateOperation,
  validateSavedView,
  validateVacancyOperation,
} from "@/lib/ops/validation";

describe("candidate operation contract", () => {
  it("rejects exclusion without a reason", () => {
    expect(
      validateCandidateOperation({
        vacancyId: "vac-1",
        candidateId: "cand-1",
        operationalStatus: "EXCLUDED",
      }).ok
    ).toBe(false);
  });

  it("rejects a whitespace-only exclusion reason", () => {
    const result = validateCandidateOperation({
      vacancyId: "vac-1",
      candidateId: "cand-1",
      operationalStatus: "EXCLUDED",
      reason: "   ",
    });
    expect(result.ok).toBe(false);
  });

  it("persists a trimmed exclusion reason and no reason for other statuses", () => {
    const excluded = validateCandidateOperation({
      vacancyId: "vac-1",
      candidateId: "cand-1",
      operationalStatus: "EXCLUDED",
      reason: "  CLIENT_INSTRUCTED  ",
    });
    expect(excluded.ok).toBe(true);
    if (excluded.ok) expect(excluded.value.excludedReason).toBe("CLIENT_INSTRUCTED");

    const earmarked = validateCandidateOperation({
      vacancyId: "vac-1",
      candidateId: "cand-1",
      operationalStatus: "EARMARKED",
      reason: "should be ignored",
    });
    expect(earmarked.ok).toBe(true);
    if (earmarked.ok) expect(earmarked.value.excludedReason).toBeNull();
  });

  it("rejects malformed JSON bodies instead of throwing", async () => {
    const request = new Request("http://localhost/api/ops/candidate", {
      method: "POST",
      body: "{",
      headers: { "content-type": "application/json" },
    });
    expect(await readJsonBody(request)).toBeNull();
    expect(validateCandidateOperation(null).ok).toBe(false);
  });
});

describe("vacancy close contract", () => {
  it("requires a non-blank explanation when the reason is OTHER", () => {
    expect(
      validateVacancyOperation({ vacancyId: "vac-1", action: "CLOSE", reason: "OTHER" }).ok
    ).toBe(false);
    expect(
      validateVacancyOperation({
        vacancyId: "vac-1",
        action: "CLOSE",
        reason: "OTHER",
        reasonDetail: " \n ",
      }).ok
    ).toBe(false);
  });

  it("accepts FILLED without an explanation and OTHER with one", () => {
    const filled = validateVacancyOperation({
      vacancyId: "vac-1",
      action: "CLOSE",
      reason: "FILLED",
    });
    expect(filled.ok).toBe(true);
    if (filled.ok) expect(filled.value.reasonDetail).toBeNull();

    const other = validateVacancyOperation({
      vacancyId: "vac-1",
      action: "CLOSE",
      reason: "OTHER",
      reasonDetail: "  Client merged the mandate.  ",
    });
    expect(other.ok).toBe(true);
    if (other.ok) expect(other.value.reasonDetail).toBe("Client merged the mandate.");
  });

  it("rejects unknown actions and reasons", () => {
    expect(
      validateVacancyOperation({ vacancyId: "vac-1", action: "REOPEN", reason: "FILLED" }).ok
    ).toBe(false);
    expect(
      validateVacancyOperation({ vacancyId: "vac-1", action: "CLOSE", reason: "BORED" }).ok
    ).toBe(false);
  });
});

describe("saved view contract", () => {
  it("rejects an empty name and an oversized view state", () => {
    expect(validateSavedView({ name: "   ", viewState: {} }).ok).toBe(false);
    const huge = { viewState: { globalSearch: "x".repeat(21_000) }, name: "Big" };
    expect(validateSavedView(huge).ok).toBe(false);
  });

  it("trims the name and keeps a plain object", () => {
    const result = validateSavedView({ name: "  Western Cape  ", viewState: { channelFilter: "LINKEDIN" } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Western Cape");
      expect(result.value.viewState.channelFilter).toBe("LINKEDIN");
    }
  });
});

describe("safeEqual", () => {
  it("matches equal secrets and rejects a missing bearer", () => {
    expect(safeEqual("Bearer secret-value", "Bearer secret-value")).toBe(true);
    expect(safeEqual("", "Bearer secret-value")).toBe(false);
    expect(safeEqual("Bearer secret-valuE", "Bearer secret-value")).toBe(false);
  });
});
