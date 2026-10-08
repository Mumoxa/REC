"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CandidateAssignment,
  CandidateOperationalStatus,
  MarketBucket,
  Vacancy,
  WorkspaceSnapshot,
} from "@/lib/data/types";
import {
  EXCLUSION_REASONS,
  MAX_REASON_DETAIL_LENGTH,
  VACANCY_CLOSE_REASONS,
  hasMeaningfulText,
} from "@/lib/ops/validation";
import {
  sanitizeViewState,
  type JobTab,
  type WorkspaceArchiveFilter,
  type WorkspaceDensity,
} from "@/lib/workspace/view-state";
import { displayMarketCounts, marketFilterCount } from "@/lib/workspace/market-stats";

type Toast = { id: number; message: string; tone?: "error" | "info" };

// P1: debounce helper — avoids O(n) filter on every keystroke (150 ms)
// Clears immediately when value is empty so Clear-all / × feels instant
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    if (typeof value === "string" && (value as string).trim() === "") {
      setDebounced(value);
      return;
    }
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

type MobilePane = "VACANCIES" | "INTELLIGENCE" | "CANDIDATES";

const channelLabels: Record<string, string> = {
  AGREED_CLIENTS: "Agreed Clients",
  AGENCY_SITES: "Agencies",
  LINKEDIN: "LinkedIn",
  JOB_BOARDS: "Job Boards",
};

/** Research buckets — evidence, never changed by a recruiter click. */
const marketLabels: Record<MarketBucket, string> = {
  TOP_10: "Top 10",
  STRONG_MARKET: "Strongest Market",
  LONGLIST: "Longlist",
  UNREVIEWED: "Unreviewed",
  EXCLUDED: "Excluded",
};

/**
 * Filter labels make the research/recruiter split explicit. `TOP_10` is the
 * evidence-backed research bucket; the Excluded grouping follows the recruiter
 * workflow status, exactly as the prototype does.
 */
const marketFilterLabels: Record<MarketBucket | "ALL", string> = {
  ALL: "All buckets",
  TOP_10: "Research Top 10",
  STRONG_MARKET: "Strongest Market",
  LONGLIST: "Longlist",
  UNREVIEWED: "Unreviewed",
  EXCLUDED: "Excluded",
};

/**
 * Recruiter workflow progression. Actions never roll the workflow backwards:
 * earlier actions are disabled once the assignment has progressed past them,
 * and un-toggling returns exactly one step (golden case
 * recruiter_workflow_actions_do_not_regress_lifecycle).
 */
const WORKFLOW_ORDER: CandidateOperationalStatus[] = [
  "SURFACED",
  "RELEVANT",
  "EARMARKED",
  "TOP_10",
  "APPROACH",
  "ENGAGED",
  "SUBMITTED",
];

const workflowLabels: Record<CandidateOperationalStatus, string> = {
  SURFACED: "Surfaced",
  RELEVANT: "Relevant",
  EARMARKED: "Earmarked",
  TOP_10: "Recruiter Top 10",
  APPROACH: "Approach",
  ENGAGED: "Engaged",
  SUBMITTED: "Submitted",
  EXCLUDED: "Excluded",
};

function workflowPosition(status: CandidateOperationalStatus) {
  if (status === "EXCLUDED") return -1;
  return WORKFLOW_ORDER.indexOf(status);
}

const closeReasonLabels: Record<string, string> = {
  FILLED: "FILLED — role filled",
  EXPIRED: "EXPIRED — advert expired",
  CLIENT_NO_LONGER_HIRING: "CLIENT_NO_LONGER_HIRING",
  NOT_COMMERCIALLY_RELEVANT: "NOT_COMMERCIALLY_RELEVANT",
  DUPLICATE: "DUPLICATE",
  CANCELLED: "CANCELLED",
  OTHER: "OTHER",
};

export function RecruitmentWorkspace({ initialSnapshot }: { initialSnapshot: WorkspaceSnapshot }) {
  const initialSavedViews = initialSnapshot.savedViews || [];
  const [vacancies, setVacancies] = useState(initialSnapshot.vacancies);
  const [selectedId, setSelectedId] = useState(initialSnapshot.vacancies[0]?.id ?? "");
  const [globalSearch, setGlobalSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [density, setDensity] = useState<WorkspaceDensity>("EXPANDED");
  const [candidateFocus, setCandidateFocus] = useState(false);
  const [jobTab, setJobTab] = useState<JobTab>("OVERVIEW");
  const [marketFilter, setMarketFilter] = useState<MarketBucket | "ALL">("ALL");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [archiveFilter, setArchiveFilter] = useState<WorkspaceArchiveFilter>("ACTIVE");
  const [savedViews, setSavedViews] = useState(initialSavedViews);
  const [loadedViewName, setLoadedViewName] = useState<string>("");
  const [saveName, setSaveName] = useState<string>("");
  const [savingView, setSavingView] = useState(false);
  const [exclusionTarget, setExclusionTarget] = useState<{ candidateId: string; name: string } | null>(null);
  // No default reason: an exclusion reason must be an explicit recruiter choice.
  const [excludeReason, setExcludeReason] = useState<string>("");
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("FILLED");
  const [closeReasonDetail, setCloseReasonDetail] = useState("");
  const [mobilePane, setMobilePane] = useState<MobilePane>("VACANCIES");
  // P1: toast replaces alert() — announced via role=alert
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeqRef = useRef(0);
  const toastTimersRef = useRef<number[]>([]);
  const showToast = (message: string, tone: Toast["tone"] = "error") => {
    const id = ++toastSeqRef.current;
    setToasts((p) => [...p, { id, message, tone }]);
    const timer = window.setTimeout(
      () => setToasts((p) => p.filter((t) => t.id !== id)),
      4500
    );
    toastTimersRef.current.push(timer);
  };
  const dismissToast = (id: number) => setToasts((p) => p.filter((t) => t.id !== id));

  // Never let a queued toast timer fire after unmount.
  useEffect(
    () => () => {
      toastTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      toastTimersRef.current = [];
    },
    []
  );

  // P1: debounced search (150 ms) — filters use debounced, inputs stay immediate
  const debouncedGlobalSearch = useDebouncedValue(globalSearch, 150);
  const debouncedCandidateSearch = useDebouncedValue(candidateSearch, 150);

  // P1: virtualization state — active only when >80 vacancies
  const [vacancyScrollTop, setVacancyScrollTop] = useState(0);
  const [vacancyViewportH, setVacancyViewportH] = useState(0);

  const vacancyListRef = useRef<HTMLDivElement>(null);
  const candidateListRef = useRef<HTMLDivElement>(null);
  const closeConfirmRef = useRef<HTMLButtonElement>(null);
  const excludeConfirmRef = useRef<HTMLButtonElement>(null);
  const closeDrawerRef = useRef<HTMLDivElement>(null);
  const excludeDrawerRef = useRef<HTMLDivElement>(null);

  const filteredVacancies = useMemo(() => {
    const q = debouncedGlobalSearch.trim().toLowerCase();
    return vacancies.filter((vacancy) => {
      const matchesQuery =
        !q ||
        [
          vacancy.title,
          vacancy.employerName,
          vacancy.location,
          vacancy.roleFamily,
          vacancy.sourceLabel,
          vacancy.requirements.map((r) => `${r.label} ${r.value}`).join(" "),
          vacancy.stakeholders.map((person) => `${person.name} ${person.title ?? ""} ${person.relevance ?? ""} ${person.observedBusinessEmail ?? ""} ${person.probableBusinessEmail ?? ""}`).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesChannel = channelFilter === "ALL" || vacancy.searchChannel === channelFilter;
      const matchesRegion = regionFilter === "ALL" || vacancy.region === regionFilter;
      const matchesArchive =
        archiveFilter === "ALL" ||
        (archiveFilter === "ACTIVE" && vacancy.lifecycleStatus !== "CLOSED") ||
        (archiveFilter === "ARCHIVED" && vacancy.lifecycleStatus === "CLOSED");
      return matchesQuery && matchesChannel && matchesRegion && matchesArchive;
    });
  }, [vacancies, debouncedGlobalSearch, channelFilter, regionFilter, archiveFilter]);

  // The selected vacancy must always be the one the recruiter can actually see:
  // prefer the visible inbox, then fall back to the first visible row.
  const selectedVacancyId = useMemo(() => {
    if (filteredVacancies.some((vacancy) => vacancy.id === selectedId)) return selectedId;
    return filteredVacancies[0]?.id ?? "";
  }, [filteredVacancies, selectedId]);

  const selected = selectedVacancyId
    ? vacancies.find((vacancy) => vacancy.id === selectedVacancyId)
    : undefined;

  // If filters hide the previously selected vacancy, follow the visible inbox
  // so keyboard navigation and the detail pane cannot disagree.
  useEffect(() => {
    if (selectedVacancyId && selectedVacancyId !== selectedId) {
      setSelectedId(selectedVacancyId);
    }
  }, [selectedVacancyId, selectedId]);

  const visibleCandidates = useMemo(() => {
    if (!selected) return [];
    const q = debouncedCandidateSearch.trim().toLowerCase();
    return selected.candidates
      .filter((candidate) => {
        if (marketFilter === "ALL") return true;
        // The Excluded grouping unions the recruiter workflow exclusion with the
        // research bucket so nothing is silently hidden; every other grouping
        // follows the research market bucket only.
        if (marketFilter === "EXCLUDED") {
          return (
            candidate.operationalStatus === "EXCLUDED" ||
            candidate.marketBucket === "EXCLUDED"
          );
        }
        return candidate.marketBucket === marketFilter;
      })
      .filter((candidate) => {
        if (!q) return true;
        return [
          candidate.name,
          candidate.currentTitle,
          candidate.currentEmployer,
          candidate.location,
          candidate.whyFit,
          candidate.claims.map((claim) => `${claim.name} ${claim.value} ${claim.status}`).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  }, [selected, debouncedCandidateSearch, marketFilter]);

  const selectedCandidate =
    selected?.candidates.find((candidate) => candidate.candidateId === selectedCandidateId) ?? null;

  /**
   * Research buckets count research evidence. The Excluded grouping unions the
   * recruiter workflow exclusion with the research bucket so nothing is hidden.
   */
  const bucketCounts = useMemo(() => {
    const candidates = selected?.candidates ?? [];
    return {
      ALL: marketFilterCount(candidates, "ALL"),
      TOP_10: marketFilterCount(candidates, "TOP_10"),
      STRONG_MARKET: marketFilterCount(candidates, "STRONG_MARKET"),
      LONGLIST: marketFilterCount(candidates, "LONGLIST"),
      UNREVIEWED: marketFilterCount(candidates, "UNREVIEWED"),
      EXCLUDED: marketFilterCount(candidates, "EXCLUDED"),
    };
  }, [selected]);

  const selectedMarket = useMemo(
    () =>
      displayMarketCounts(
        selected?.candidates ?? [],
        selected?.candidateMarketSummary,
        selected?.researchQueries.filter((query) => query.executionStatus === "EXECUTED").length
      ),
    [selected]
  );

  const regions = useMemo(
    () => Array.from(new Set(vacancies.map((v) => v.region))).filter(Boolean),
    [vacancies]
  );

  const counts = useMemo(() => {
    const active = vacancies.filter((v) => v.lifecycleStatus !== "CLOSED");
    return {
      active: active.length,
      new: active.filter((v) => v.unread).length,
      needsResearch: active.filter((v) => v.qaStatus === "FAIL_RESEARCH_REQUIRED").length,
      marketReady: active.filter((v) => v.candidateMapStatus === "READY").length,
    };
  }, [vacancies]);

  // P1: virtualization — estimate row height by density, activate >80
  const estimatedRowHeight = density === "EXPANDED" ? 136 : density === "COMPACT" ? 88 : 56;
  const shouldVirtualize = filteredVacancies.length > 80;

  const virtualRange = useMemo(() => {
    if (!shouldVirtualize) return null;
    const overscan = 6;
    const start = Math.max(0, Math.floor(vacancyScrollTop / estimatedRowHeight) - overscan);
    const vp = vacancyViewportH || 480;
    const visibleCount = Math.ceil(vp / estimatedRowHeight) + overscan * 2;
    const end = Math.min(filteredVacancies.length, start + visibleCount);
    return {
      start,
      end,
      offsetY: start * estimatedRowHeight,
      totalHeight: filteredVacancies.length * estimatedRowHeight,
    };
  }, [shouldVirtualize, vacancyScrollTop, vacancyViewportH, estimatedRowHeight, filteredVacancies.length]);

  // Attach scroll + resize when virtualizing
  useEffect(() => {
    if (!shouldVirtualize) return;
    const el = vacancyListRef.current;
    if (!el) return;
    const onScroll = () => setVacancyScrollTop(el.scrollTop);
    const onResize = () => setVacancyViewportH(el.clientHeight);
    onResize();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [shouldVirtualize]);

  // Reset scroll when density or filter set changes height/count
  useEffect(() => {
    if (vacancyListRef.current) {
      vacancyListRef.current.scrollTop = 0;
      setVacancyScrollTop(0);
      setVacancyViewportH(vacancyListRef.current.clientHeight);
    }
  }, [density, filteredVacancies.length]);

  // Keep selected row visible for ArrowUp/Down when virtualized
  useEffect(() => {
    if (!shouldVirtualize || !vacancyListRef.current || !selected) return;
    const idx = filteredVacancies.findIndex((v) => v.id === selected.id);
    if (idx === -1) return;
    const el = vacancyListRef.current;
    const top = idx * estimatedRowHeight;
    const bottom = top + estimatedRowHeight;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + el.clientHeight) el.scrollTop = bottom - el.clientHeight;
  }, [selected?.id, shouldVirtualize, filteredVacancies, estimatedRowHeight]);

  // Active filter chips — removable pills above vacancy list
  // True when the active vacancy option exists in the DOM for aria-activedescendant.
  const selectedIsRendered = useMemo(() => {
    if (!selected) return false;
    if (!shouldVirtualize || !virtualRange) return true;
    return filteredVacancies
      .slice(virtualRange.start, virtualRange.end)
      .some((vacancy) => vacancy.id === selected.id);
  }, [selected, shouldVirtualize, virtualRange, filteredVacancies]);

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
    if (channelFilter !== "ALL") {
      chips.push({ key: "channel", label: channelLabels[channelFilter] ?? channelFilter, onClear: () => setChannelFilter("ALL") });
    }
    if (regionFilter !== "ALL") {
      chips.push({ key: "region", label: regionFilter, onClear: () => setRegionFilter("ALL") });
    }
    if (archiveFilter !== "ACTIVE") {
      const label = archiveFilter === "ARCHIVED" ? "Archived" : "All statuses";
      chips.push({ key: "archive", label, onClear: () => setArchiveFilter("ACTIVE") });
    }
    if (globalSearch.trim()) {
      chips.push({ key: "search", label: `Search: "${globalSearch.trim()}"`, onClear: () => setGlobalSearch("") });
    }
    if (candidateSearch.trim()) {
      chips.push({ key: "csearch", label: `Candidates: "${candidateSearch.trim()}"`, onClear: () => setCandidateSearch("") });
    }
    return chips;
  }, [channelFilter, regionFilter, archiveFilter, globalSearch, candidateSearch]);

  const clearAllFilters = () => {
    setChannelFilter("ALL");
    setRegionFilter("ALL");
    setArchiveFilter("ACTIVE");
    setGlobalSearch("");
    setCandidateSearch("");
    setMarketFilter("ALL");
    setLoadedViewName("");
  };

  // Focus management for drawers — explicit focus on Confirm
  useEffect(() => {
    if (closeConfirmOpen && closeConfirmRef.current) {
      closeConfirmRef.current.focus();
    }
  }, [closeConfirmOpen]);

  useEffect(() => {
    if (exclusionTarget && excludeConfirmRef.current) {
      excludeConfirmRef.current.focus();
    }
  }, [exclusionTarget]);

  useFocusTrap(closeConfirmOpen, closeDrawerRef);
  useFocusTrap(Boolean(exclusionTarget), excludeDrawerRef);

  // "/" focuses vacancy search unless the recruiter is already typing or a drawer is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (closeConfirmOpen || exclusionTarget) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      event.preventDefault();
      document.querySelector<HTMLInputElement>(".global-search")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeConfirmOpen, exclusionTarget]);

  // Escape closes drawers; Tab cycles inside the open drawer.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (exclusionTarget) {
          resetExclusionDrawer();
          return;
        }
        if (closeConfirmOpen) {
          setCloseConfirmOpen(false);
          return;
        }
        if (selectedCandidateId) {
          setSelectedCandidateId(null);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exclusionTarget, closeConfirmOpen, selectedCandidateId]);

  // Keyboard navigation for vacancy list: Arrow keys + Enter
  const handleVacancyKeyDown = (e: React.KeyboardEvent) => {
    if (!filteredVacancies.length) return;
    const idx = filteredVacancies.findIndex((v) => v.id === (selectedVacancyId || selectedId));
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = filteredVacancies[Math.min(idx + 1, filteredVacancies.length - 1)];
      if (next) { setSelectedId(next.id); setSelectedCandidateId(null); setJobTab("OVERVIEW"); }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = filteredVacancies[Math.max(idx - 1, 0)];
      if (prev) { setSelectedId(prev.id); setSelectedCandidateId(null); setJobTab("OVERVIEW"); }
    } else if (e.key === "Enter") {
      // Enter already selects via click; ensure focus
      (e.target as HTMLElement)?.click();
    }
  };

  // Keyboard navigation for candidate list: Arrow keys navigate, Enter toggles, Escape closes
  const handleCandidateKeyDown = (e: React.KeyboardEvent) => {
    if (!visibleCandidates.length) return;
    const idx = visibleCandidates.findIndex((c) => c.candidateId === selectedCandidateId);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = visibleCandidates[Math.min(idx + 1 >= 0 ? idx + 1 : 0, visibleCandidates.length - 1)];
      if (next) setSelectedCandidateId(next.candidateId);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = visibleCandidates[Math.max(idx - 1, 0)];
      if (prev) setSelectedCandidateId(prev.candidateId);
    }
  };

  function resetExclusionDrawer() {
    setExclusionTarget(null);
    setExcludeReason("");
  }

  async function updateCandidateStatus(
    candidate: CandidateAssignment,
    status: CandidateOperationalStatus,
    reason?: string
  ) {
    if (!selected) return;

    // Contract: exclusion carries an explicit, non-blank reason.
    if (status === "EXCLUDED" && !hasMeaningfulText(reason)) {
      showToast("A reason is required before a candidate can be excluded.", "error");
      return;
    }

    const previousStatus = candidate.operationalStatus;
    const previousReason = candidate.excludedReason ?? null;
    const nextReason = status === "EXCLUDED" ? (reason as string).trim() : null;

    setSaving(`candidate:${candidate.candidateId}`);
    setVacancies((current) =>
      current.map((vacancy) =>
        vacancy.id !== selected.id
          ? vacancy
          : {
              ...vacancy,
              candidates: vacancy.candidates.map((item) =>
                item.candidateId === candidate.candidateId
                  ? {
                      ...item,
                      // Recruiter workflow only: marketBucket, claims, QA and
                      // evidence gaps are never touched here.
                      operationalStatus: status,
                      excludedReason: nextReason,
                    }
                  : item
              ),
            }
      )
    );

    if (!initialSnapshot.demoMode) {
      try {
        const res = await fetch("/api/ops/candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: selected.id,
            candidateId: candidate.candidateId,
            operationalStatus: status,
            ...(nextReason ? { reason: nextReason } : {}),
          }),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
      } catch {
        setVacancies((current) =>
          current.map((vacancy) =>
            vacancy.id !== selected.id
              ? vacancy
              : {
                  ...vacancy,
                  candidates: vacancy.candidates.map((item) =>
                    item.candidateId === candidate.candidateId
                      ? {
                          ...item,
                          operationalStatus: previousStatus,
                          excludedReason: previousReason,
                        }
                      : item
                  ),
                }
          )
        );
        showToast("Failed to save candidate operation. Change was not saved.", "error");
        setSaving(null);
        return;
      }
    }
    setSaving(null);
    if (status === "EXCLUDED" && exclusionTarget) {
      resetExclusionDrawer();
    }
  }

  function restoreSavedView(view: typeof savedViews[0]) {
    if (!view) return;
    // Restore every facet together, but only after validating it: a corrupted
    // or hand-edited saved view must never put the UI into an unreachable state.
    const state = sanitizeViewState(view.viewState);
    setGlobalSearch(state.globalSearch);
    setCandidateSearch(state.candidateSearch);
    setChannelFilter(state.channelFilter);
    setRegionFilter(state.regionFilter);
    setArchiveFilter(state.archiveFilter);
    setDensity(state.density);
    setMarketFilter(state.marketFilter);
    setJobTab(state.jobTab);
    setSelectedCandidateId(null);
    setLoadedViewName(view.name);
  }

  async function saveCurrentView() {
    if (!saveName.trim()) return;
    setSavingView(true);
    const payload = {
      name: saveName.trim(),
      viewState: sanitizeViewState({
        globalSearch,
        channelFilter,
        regionFilter,
        archiveFilter,
        density,
        marketFilter,
        jobTab,
        candidateSearch,
      }),
    };
    if (initialSnapshot.demoMode) {
      const saved = {
        id: `demo-${payload.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: payload.name,
        viewState: { ...payload.viewState } as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
      };
      setSavedViews((prev) => {
        const idx = prev.findIndex((view) => view.name === payload.name);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...saved };
          return copy;
        }
        return [...prev, saved];
      });
      setLoadedViewName(payload.name);
      setSaveName("");
      setSavingView(false);
      showToast("View saved for this demo session. It is not written to REC.", "info");
      return;
    }
    try {
      const res = await fetch("/api/ops/saved-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (json.savedView) {
        setSavedViews((prev) => {
          const idx = prev.findIndex((v) => v.name === json.savedView.name);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...json.savedView, viewState: json.savedView.view_state || payload.viewState };
            return copy;
          }
          return [...prev, { ...json.savedView, viewState: json.savedView.view_state || payload.viewState }];
        });
        setLoadedViewName(saveName.trim());
      }
      setSaveName("");
    } catch {
      showToast("Failed to save view.", "error");
    } finally {
      setSavingView(false);
    }
  }

  async function confirmCloseVacancy(reason: string, reasonDetail: string) {
    if (!selected) return;

    // Contract: OTHER must carry a non-blank explanation.
    if (reason === "OTHER" && !hasMeaningfulText(reasonDetail)) {
      showToast("An explanation is required when closing a vacancy with reason OTHER.", "error");
      return;
    }

    const detail = reason === "OTHER" ? reasonDetail.trim() : null;

    setSaving(`vacancy:${selected.id}`);
    const previousStatus = selected.lifecycleStatus;
    const previousDetail = selected.closeReasonDetail ?? null;
    const previousReason = selected.closedReason ?? null;
    setVacancies((current) =>
      current.map((vacancy) =>
        vacancy.id === selected.id
          ? { ...vacancy, lifecycleStatus: "CLOSED", closedReason: reason, closeReasonDetail: detail }
          : vacancy
      )
    );

    if (!initialSnapshot.demoMode) {
      try {
        const res = await fetch("/api/ops/vacancy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: selected.id,
            action: "CLOSE",
            reason,
            ...(detail ? { reasonDetail: detail } : {}),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch {
        setVacancies((current) =>
          current.map((vacancy) =>
            vacancy.id === selected.id
              ? {
                  ...vacancy,
                  lifecycleStatus: previousStatus,
                  closedReason: previousReason,
                  closeReasonDetail: previousDetail,
                }
              : vacancy
          )
        );
        showToast("Failed to close vacancy. Change was not saved.", "error");
        setSaving(null);
        return;
      }
    }

    const next = filteredVacancies.find((v) => v.id !== selected.id && v.lifecycleStatus !== "CLOSED");
    if (next) {
      setSelectedId(next.id);
      setSelectedCandidateId(null);
      setJobTab("OVERVIEW");
    }
    setSaving(null);
    setCloseConfirmOpen(false);
    setCloseReason("FILLED");
    setCloseReasonDetail("");
  }

  const exclusionCandidate = exclusionTarget ? selected?.candidates.find((c) => c.candidateId === exclusionTarget.candidateId) ?? null : null;

  return (
    <main className="app-shell">
      <a href="#vacancy-list" className="skip-link">Skip to vacancies</a>
      <header className="topbar" role="banner">
        <div className="brand-block">
          <a href="https://talenttree.co.za" className="brand-logo-link" aria-label="Talent Tree home">
            {/* Official high-res logo from Mumoxa/tt-website — Talent Tree Logo 2026 (1).png (132×108) */}
            <img
              src="/talent-tree-logo.png"
              alt="Talent Tree"
              className="brand-logo-img"
              width={132}
              height={108}
              loading="eager"
            />
            <span className="brand-lockup">
              <span className="brand-name">Talent Tree</span>
              <span className="brand-subtitle">Recruitment Intelligence</span>
            </span>
          </a>
        </div>

        <div className="global-search-wrap">
          <span className="search-glyph" aria-hidden="true">⌕</span>
          <input
            aria-label="Global vacancy search"
            className="global-search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search vacancies, employers, systems, requirements…"
          />
          {globalSearch && (
            <button className="clear-search" onClick={() => setGlobalSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="topbar-meta">
          <nav className="workspace-nav" aria-label="Workspace sections">
            <Link href="/">Vacancies</Link>
            <Link href="/companies">Companies</Link>
            <Link href="/runs">Runs</Link>
            <Link href="/qa">QA</Link>
          </nav>
          {initialSnapshot.demoMode ? (
            <span className="mode-badge demo">Demo mode</span>
          ) : (
            <span className="mode-badge live">Live</span>
          )}
          <span className="timestamp">
            Updated {new Date(initialSnapshot.generatedAt).toLocaleString()}
          </span>
        </div>
      </header>

      <section className="summary-strip" aria-label="Workspace summary">
        <SummaryStat label="Active vacancies" value={counts.active} />
        <SummaryStat label="New" value={counts.new} accent />
        <SummaryStat label="Needs research" value={counts.needsResearch} warn />
        <SummaryStat label="Candidate markets ready" value={counts.marketReady} />
        <div className="summary-spacer" />
        <button
          className={`focus-toggle ${candidateFocus ? "active" : ""}`}
          onClick={() => setCandidateFocus((value) => !value)}
          aria-pressed={candidateFocus}
          aria-label={candidateFocus ? "Exit candidate focus" : "Enter candidate focus"}
        >
          <span aria-hidden="true">{candidateFocus ? "◧" : "◫"}</span>
          {candidateFocus ? "Exit focus" : "Candidate focus"}
        </button>
      </section>

      {/* Mobile pane switcher — visible only at 768px and below */}
      <nav className="mobile-pane-switch" aria-label="Mobile workspace panes">
        <button className={mobilePane === "VACANCIES" ? "active" : ""} onClick={() => setMobilePane("VACANCIES")} aria-pressed={mobilePane === "VACANCIES"}>
          Vacancies
        </button>
        <button className={mobilePane === "INTELLIGENCE" ? "active" : ""} onClick={() => setMobilePane("INTELLIGENCE")} aria-pressed={mobilePane === "INTELLIGENCE"}>
          Intelligence
        </button>
        <button className={mobilePane === "CANDIDATES" ? "active" : ""} onClick={() => setMobilePane("CANDIDATES")} aria-pressed={mobilePane === "CANDIDATES"}>
          Candidates
        </button>
      </nav>

      {selected && (
        <div className="mobile-breadcrumb" aria-label="Selected vacancy breadcrumb">
          <span>{selected.title}</span>
          <span aria-hidden="true">·</span>
          <span>{selected.employerName}</span>
          <button onClick={() => setMobilePane("VACANCIES")} aria-label="Back to vacancy list">Change</button>
        </div>
      )}

      <section
        className={`workspace-grid ${candidateFocus ? "candidate-focus" : ""}`}
        data-mobile-pane={mobilePane}
        aria-label="Three-pane workspace"
      >
        {/* Pane 1 — Vacancy */}
        <aside className="vacancy-pane" aria-label="Vacancy inbox">
          {/* collapsed edge bar for candidate focus */}
          {candidateFocus && (
            <div className="candidate-focus-edge" aria-hidden="true">
              <span>Vacancies</span>
              <span>·</span>
              <span>{filteredVacancies.length}</span>
              <button
                onClick={() => setCandidateFocus(false)}
                style={{ writingMode: "horizontal-tb", transform: "rotate(90deg)", marginTop:12, border:"1px solid var(--line)", background:"#fff", borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:800, cursor:"pointer" }}
                aria-label="Exit candidate focus"
              >
                Exit focus
              </button>
            </div>
          )}
          <div className="vacancy-pane-inner" style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0, width:"100%" }}>
          <div className="pane-header">
            <div>
              <div className="eyebrow">Vacancies</div>
              <h1>Intelligence Inbox</h1>
            </div>
            <span className="count-pill" aria-label={`${filteredVacancies.length} vacancies`}>{filteredVacancies.length}</span>
          </div>

          <div className="filter-row" role="group" aria-label="Vacancy filters">
            <label className="sr-only" htmlFor="channel-filter">Channel filter</label>
            <select id="channel-filter" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} aria-label="Filter by channel">
              <option value="ALL">All channels</option>
              <option value="AGREED_CLIENTS">Agreed Clients</option>
              <option value="AGENCY_SITES">Agencies</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="JOB_BOARDS">Job Boards</option>
            </select>
            <label className="sr-only" htmlFor="region-filter">Region filter</label>
            <select id="region-filter" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} aria-label="Filter by region">
              <option value="ALL">All regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="saved-view-select">Saved view</label>
            <select id="saved-view-select" value={loadedViewName} onChange={(e) => {
              const view = savedViews.find((v) => v.name === e.target.value);
              if (view) restoreSavedView(view);
              else setLoadedViewName("");
            }} aria-label="Load saved view">
              <option value="">— Load view —</option>
              {savedViews.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
            <div className="save-view-row">
              <label className="sr-only" htmlFor="save-view-input">Saved view name</label>
              <input id="save-view-input" aria-label="Saved view name" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="View name" />
              <button className="btn-primary" disabled={savingView || !saveName.trim()} onClick={saveCurrentView} aria-label="Save current view">Save</button>
            </div>
            <label className="sr-only" htmlFor="archive-filter">Archive filter</label>
            <select id="archive-filter" value={archiveFilter} onChange={(event) => setArchiveFilter(event.target.value as typeof archiveFilter)} aria-label="Archive filter">
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="ALL">All</option>
            </select>
            <span style={{ display:"flex", alignItems:"center", fontSize:10, color:"var(--stone-500)", fontWeight:700, paddingLeft:4 }} aria-live="polite">
              {loadedViewName ? `Viewing: ${loadedViewName}` : ""}
            </span>
          </div>

          {/* Filter chips — removable pills above list */}
          {activeFilters.length > 0 && (
            <div className="filter-chips" role="group" aria-label="Active filters">
              {activeFilters.map((chip) => (
                <span key={chip.key} className="chip">
                  {chip.label}
                  <button onClick={chip.onClear} aria-label={`Remove filter ${chip.label}`}>×</button>
                </span>
              ))}
              <button className="chip clear-all" onClick={clearAllFilters} aria-label="Clear all filters">Clear all ×</button>
            </div>
          )}

          {/* Saved view banner — persistent state indicator */}
          {loadedViewName && (
            <div className="saved-view-banner" role="status" aria-live="polite" aria-label="Loaded saved view">
              <span>Viewing: <strong>{loadedViewName}</strong> — filters and density restored from saved view.</span>
              <button onClick={() => setLoadedViewName("")} aria-label="Clear saved view">Clear</button>
            </div>
          )}

          <div className="density-control" role="group" aria-label="Vacancy card density">
            {([
              { id:"EXPANDED", label:"Full", icon:"◫" },
              { id:"COMPACT", label:"Compact", icon:"◧" },
              { id:"MINIMAL", label:"Titles", icon:"≡" },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => setDensity(item.id as WorkspaceDensity)}
                className={density === item.id ? "active" : ""}
                aria-pressed={density === item.id}
                aria-label={`Density ${item.label}`}
              >
                <span className="density-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* aria-activedescendant must only reference an option that is
              actually rendered: a virtualized window may not contain it. */}
          <div
            className="vacancy-list"
            id="vacancy-list"
            ref={vacancyListRef}
            role="listbox"
            aria-label="Vacancy list"
            aria-activedescendant={
              selected && selectedIsRendered ? `vacancy-${selected.id}` : undefined
            }
            tabIndex={0}
            onKeyDown={handleVacancyKeyDown}
          >
            {shouldVirtualize && virtualRange ? (
              filteredVacancies.length === 0 ? (
                <div className="empty-state" role="status">No active vacancies match these filters. Try clearing filters or use Archive filter to see closed roles.</div>
              ) : (
                <div className="vacancy-list-virtual-spacer" style={{ height: virtualRange.totalHeight }}>
                  <div className="vacancy-list-virtual-window" style={{ transform: `translateY(${virtualRange.offsetY}px)` }}>
                    {filteredVacancies.slice(virtualRange.start, virtualRange.end).map((vacancy) => (
                      <VacancyCard
                        key={vacancy.id}
                        vacancy={vacancy}
                        density={density}
                        selected={selected?.id === vacancy.id}
                        onSelect={() => {
                          setSelectedId(vacancy.id);
                          setSelectedCandidateId(null);
                          setJobTab("OVERVIEW");
                          setMobilePane("INTELLIGENCE");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : (
              <>
                {filteredVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    vacancy={vacancy}
                    density={density}
                    selected={selected?.id === vacancy.id}
                    onSelect={() => {
                      setSelectedId(vacancy.id);
                      setSelectedCandidateId(null);
                      setJobTab("OVERVIEW");
                      setMobilePane("INTELLIGENCE");
                    }}
                  />
                ))}
                {filteredVacancies.length === 0 && (
                  <div className="empty-state" role="status">No active vacancies match these filters. Try clearing filters or use Archive filter to see closed roles.</div>
                )}
              </>
            )}
          </div>
          </div>
        </aside>

        {/* Pane 2 — Job (always visible, even in candidate focus per brief) */}
        {selected && (
          <section className="job-pane" aria-label="Vacancy intelligence">
            <div className="job-header">
              <div>
                <div className="job-title-row">
                  <h2>{selected.title}</h2>
                  {selected.clientStatus === "AGREED_CLIENT" && (
                    <span className="client-badge">Agreed client</span>
                  )}
                </div>
                <div className="job-employer">{selected.employerName}</div>
                <div className="job-meta">
                  <span>{selected.location}</span>
                  <span aria-hidden="true">•</span>
                  <span>{channelLabels[selected.searchChannel]}</span>
                  <span aria-hidden="true">•</span>
                  <span>{selected.sourceLabel}</span>
                </div>
              </div>
              <button
                className="close-job-button"
                onClick={() => {
                  setCloseReason("FILLED");
                  setCloseReasonDetail("");
                  setCloseConfirmOpen(true);
                }}
                disabled={saving === `vacancy:${selected.id}`}
                aria-label="Close vacancy"
                aria-haspopup="dialog"
              >
                Close job
              </button>
            </div>

            <div className="status-line" role="group" aria-label="Vacancy status">
              <StatusPill
                text={
                  selected.lifecycleStatus === "CLOSED" && selected.closedReason
                    ? `CLOSED · ${selected.closedReason.replaceAll("_", " ")}`
                    : lifecycleLabel(selected.lifecycleStatus)
                }
              />
              <QaPill status={selected.qaStatus} />
              <StatusPill text={`Employer: ${selected.employerStatus}`} subtle />
              <StatusPill text={`Map: ${selected.candidateMapStatus.replaceAll("_", " ")}`} subtle />
            </div>

            {selected.lifecycleStatus === "CLOSED" && selected.closeReasonDetail && (
              <div className="drawer-note" role="note">
                Closed with explanation: {selected.closeReasonDetail}
              </div>
            )}

            <div className="date-line">
              <span>First seen {formatDate(selected.firstSeen)}</span>
              {selected.lastVerified && <span>Last verified {formatDate(selected.lastVerified)}</span>}
              <span>{selected.sources.length} source{selected.sources.length === 1 ? "" : "s"}</span>
            </div>

            <nav className="job-tabs" role="tablist" aria-label="Vacancy details">
              {(["OVERVIEW", "HIRING_TEAM", "REQUIREMENTS", "SOURCES", "SEARCH_LOG", "QA"] as JobTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={jobTab === tab}
                    aria-controls={`panel-${tab}`}
                    className={jobTab === tab ? "active" : ""}
                    onClick={() => setJobTab(tab)}
                  >
                    {tab === "SEARCH_LOG" ? "Search log" : tab === "HIRING_TEAM" ? "Hiring team" : tab[0] + tab.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </nav>

            <div className="job-content" id={`panel-${jobTab}`} role="tabpanel">
              {jobTab === "OVERVIEW" && <Overview vacancy={selected} />}
              {jobTab === "HIRING_TEAM" && <HiringTeam vacancy={selected} />}
              {jobTab === "REQUIREMENTS" && <Requirements vacancy={selected} />}
              {jobTab === "SOURCES" && <Sources vacancy={selected} />}
              {jobTab === "SEARCH_LOG" && <SearchLog vacancy={selected} />}
              {jobTab === "QA" && <QaPanel vacancy={selected} />}
            </div>
          </section>
        )}

        {/* Pane 3 — Candidate */}
        <section className="candidate-pane" aria-label="Candidate market">
          {selected ? (
            <>
              <div className="candidate-header">
                <div>
                  <div className="eyebrow">Candidate market</div>
                  <h2>{selectedMarket.credible} credible candidates in this market</h2>
                  {/* Context label stays visible at top of candidate pane in focus mode */}
                  <div className="candidate-context" aria-live="polite">
                    {candidateFocus ? (
                      <><strong>{selected.title}</strong> · {selected.employerName} — candidate focus</>
                    ) : (
                      <>{selected.title} · {selected.employerName}</>
                    )}
                  </div>
                  {candidateFocus && (
                    <button
                      onClick={() => setCandidateFocus(false)}
                      className="btn-subtle"
                      style={{ marginTop:8, height:28, fontSize:11 }}
                      aria-label="Exit candidate focus"
                    >
                      ← Exit focus
                    </button>
                  )}
                </div>
                <div className="candidate-counts" aria-label="Market counts">
                  <span>{selectedMarket.credible} credible market</span>
                  <span>{selectedMarket.strongest} strongest market</span>
                  <span>{selectedMarket.top10} research Top 10</span>
                  <span>{selected.candidates.length} loaded</span>
                </div>
              </div>

              <div className="candidate-search-row" role="search" aria-label="Candidate market search">
                <label className="sr-only" htmlFor="candidate-search">Search candidate market</label>
                <input
                  id="candidate-search"
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="Search this candidate market…"
                  aria-label="Search candidate market"
                />
                <label className="sr-only" htmlFor="market-filter">Market bucket filter</label>
                <select id="market-filter" value={marketFilter} onChange={(event) => setMarketFilter(event.target.value as MarketBucket | "ALL")} aria-label="Filter by market bucket">
                  <option value="ALL">All buckets</option>
                  {(Object.keys(marketLabels) as MarketBucket[]).map((bucket) => (
                    <option key={bucket} value={bucket}>
                      {marketFilterLabels[bucket]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="market-tabs" role="group" aria-label="Market buckets">
                <button className={marketFilter === "ALL" ? "active" : ""} onClick={() => setMarketFilter("ALL")} aria-pressed={marketFilter === "ALL"}>
                  {marketFilterLabels.ALL} <span>{bucketCounts.ALL}</span>
                </button>
                {(Object.keys(marketLabels) as MarketBucket[]).map((bucket) => (
                  <button
                    key={bucket}
                    className={marketFilter === bucket ? "active" : ""}
                    onClick={() => setMarketFilter(bucket)}
                    aria-pressed={marketFilter === bucket}
                    aria-label={`Filter ${marketFilterLabels[bucket]}`}
                  >
                    {marketFilterLabels[bucket]} <span>{bucketCounts[bucket]}</span>
                  </button>
                ))}
              </div>

              <div
                className="candidate-list"
                ref={candidateListRef}
                role="list"
                aria-label="Candidate list"
                tabIndex={0}
                onKeyDown={handleCandidateKeyDown}
              >
                {visibleCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.assignmentId}
                    candidate={candidate}
                    selected={selectedCandidate?.candidateId === candidate.candidateId}
                    saving={saving === `candidate:${candidate.candidateId}`}
                    onOpen={() =>
                      setSelectedCandidateId((current) =>
                        current === candidate.candidateId ? null : candidate.candidateId
                      )
                    }
                    onStatus={(status, reason) => updateCandidateStatus(candidate, status, reason)}
                    onExcludeStart={(id, name) => { setExclusionTarget({ candidateId: id, name }); setExcludeReason(""); }}
                  />
                ))}
                {visibleCandidates.length === 0 && (
                  <div className="empty-state" role="status">
                    {selected.candidates.length === 0
                      ? "Candidate market mapping has not started for this vacancy."
                      : "No candidates match this filter."}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" role="status">Select a vacancy to open its candidate market.</div>
          )}
        </section>
      </section>

      {/* Close vacancy drawer — intentional workflow step with preview + reason */}
      {closeConfirmOpen && selected && (
        <div
          className="drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Close vacancy confirmation"
          onClick={(e) => { if (e.target === e.currentTarget) setCloseConfirmOpen(false); }}
        >
          <div className="drawer" ref={closeDrawerRef} role="document">
            <div className="drawer-header">
              <div>
                <h3>Close vacancy</h3>
                <p>Closing removes this role from the active inbox. Intelligence, candidates and QA history are preserved and remain searchable.</p>
              </div>
              <button className="drawer-close-x" onClick={() => setCloseConfirmOpen(false)} aria-label="Close dialog">×</button>
            </div>
            <div className="drawer-body">
              <div className="drawer-preview" aria-label="Vacancy preview">
                <strong>{selected.title}</strong>
                <span>{selected.employerName} · {selected.location} · {channelLabels[selected.searchChannel]}</span>
                <span>QA: {selected.qaStatus} · Map: {selected.candidateMapStatus.replaceAll("_"," ")} · {selected.candidates.length} candidates</span>
              </div>
              <div className="drawer-field">
                <label htmlFor="close-reason-drawer">Reason for closing <span aria-hidden="true" style={{ color:"var(--red)"}}>*</span></label>
                <select id="close-reason-drawer" value={closeReason} onChange={(e) => setCloseReason(e.target.value)}>
                  {VACANCY_CLOSE_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {closeReasonLabels[reason] ?? reason}
                    </option>
                  ))}
                </select>
              </div>
              {closeReason === "OTHER" && (
                <div className="drawer-field">
                  <label htmlFor="close-reason-detail">
                    Explanation for OTHER <span aria-hidden="true" style={{ color:"var(--red)"}}>*</span>
                  </label>
                  <input
                    id="close-reason-detail"
                    value={closeReasonDetail}
                    maxLength={MAX_REASON_DETAIL_LENGTH}
                    onChange={(e) => setCloseReasonDetail(e.target.value)}
                    placeholder="Why is this role being closed?"
                    aria-describedby="close-reason-detail-hint"
                  />
                  <small id="close-reason-detail-hint" style={{ color:"var(--stone-500)", fontSize:10 }}>
                    Required. Stored as closed_reason_detail with the close event.
                  </small>
                </div>
              )}
              {archiveFilter !== "ARCHIVED" && archiveFilter !== "ALL" && (
                <div className="drawer-note" role="note">
                  This vacancy will move to archived. Use Archive filter (Archived / All) to retrieve it.
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <button
                className="btn-cancel"
                onClick={() => { setCloseConfirmOpen(false); setCloseReasonDetail(""); }}
                aria-label="Cancel close"
              >
                Cancel
              </button>
              <button
                ref={closeConfirmRef}
                className="btn-confirm"
                onClick={() => confirmCloseVacancy(closeReason, closeReasonDetail)}
                disabled={
                  saving === `vacancy:${selected.id}` ||
                  (closeReason === "OTHER" && !hasMeaningfulText(closeReasonDetail))
                }
                aria-label="Confirm close vacancy"
              >
                {saving === `vacancy:${selected.id}` ? "Closing…" : "Confirm close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exclusion drawer — asks for reason with preview */}
      {exclusionTarget && selected && (
        <div
          className="drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Exclude candidate confirmation"
          onClick={(e) => { if (e.target === e.currentTarget) resetExclusionDrawer(); }}
        >
          <div className="drawer" ref={excludeDrawerRef} role="document">
            <div className="drawer-header">
              <div>
                <h3>Exclude candidate</h3>
                <p>Exclusion is vacancy-specific and does not alter the person&apos;s evidence. A reason is required.</p>
              </div>
              <button className="drawer-close-x" onClick={resetExclusionDrawer} aria-label="Close dialog">×</button>
            </div>
            <div className="drawer-body">
              <div className="drawer-preview" aria-label="Exclusion preview">
                <strong>{exclusionCandidate?.name ?? exclusionTarget.name}</strong>
                <span>{exclusionCandidate?.currentTitle ?? ""} {exclusionCandidate?.currentEmployer ? `· ${exclusionCandidate.currentEmployer}` : ""}</span>
                <span>Vacancy: <strong style={{ color:"var(--slate)" }}>{selected.title}</strong> · {selected.employerName}</span>
                {exclusionCandidate && (
                  <span>Bucket: {marketLabels[exclusionCandidate.marketBucket]} · QA: {exclusionCandidate.qaStatus}</span>
                )}
              </div>
              <div className="drawer-field">
                <label htmlFor="exclude-reason-drawer">Reason for exclusion <span aria-hidden="true" style={{ color:"var(--red)"}}>*</span></label>
                <select
                  id="exclude-reason-drawer"
                  value={excludeReason}
                  onChange={(e) => setExcludeReason(e.target.value)}
                  aria-describedby="exclude-reason-hint"
                >
                  <option value="">Select a reason…</option>
                  {EXCLUSION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                <small id="exclude-reason-hint" style={{ color:"var(--stone-500)", fontSize:10 }}>
                  Stored as excluded_reason on the operational record. Research evidence is unchanged.
                </small>
              </div>
              <div className="drawer-note" role="note">
                The candidate will move to the Excluded bucket for this vacancy only. Other vacancy assignments are unchanged.
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn-cancel" onClick={resetExclusionDrawer} aria-label="Cancel exclusion">Cancel</button>
              <button
                ref={excludeConfirmRef}
                className="btn-confirm danger"
                onClick={() => {
                  const candidate =
                    exclusionCandidate ??
                    selected?.candidates.find(
                      (item) => item.candidateId === exclusionTarget?.candidateId
                    ) ??
                    null;
                  if (candidate) updateCandidateStatus(candidate, "EXCLUDED", excludeReason);
                }}
                disabled={!hasMeaningfulText(excludeReason)}
                aria-label="Confirm exclusion"
              >
                Confirm exclusion
              </button>
            </div>
          </div>
        </div>
      )}
      {/* P1: toast stack — replaces alert(), role=alert live */}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} role="alert" className={`toast ${t.tone === "error" ? "toast-error" : ""}`}>
            <span>{t.message}</span>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only" aria-label="Error notifications">
        {toasts.filter((t) => t.tone === "error").map((t) => t.message).join(" ")}
      </div>
    </main>
  );
}

function VacancyCard({
  vacancy,
  density,
  selected,
  onSelect,
}: {
  vacancy: Vacancy;
  density: WorkspaceDensity;
  selected: boolean;
  onSelect: () => void;
}) {
  const market = displayMarketCounts(vacancy.candidates, vacancy.candidateMarketSummary);
  const top10 = market.top10;
  const strongest = market.strongest;
  const credible = market.credible;
  return (
    <button
      id={`vacancy-${vacancy.id}`}
      role="option"
      aria-selected={selected}
      className={`vacancy-card ${selected ? "selected" : ""} ${density.toLowerCase()}`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
    >
      <div className="vacancy-card-top">
        <div className="vacancy-title">{vacancy.title}</div>
        {vacancy.unread && <span className="new-dot" title="New" aria-label="New vacancy" />}
      </div>
      {density !== "MINIMAL" && (
        <div className="vacancy-employer">{vacancy.employerName}</div>
      )}
      {density === "EXPANDED" && (
        <>
          <div className="vacancy-detail-line" aria-label="Location and source">
            <span>{vacancy.location}</span>
            <span aria-hidden="true">·</span>
            <span>{vacancy.sourceLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{channelLabels[vacancy.searchChannel]}</span>
          </div>
          <div className="vacancy-badges">
            {vacancy.clientStatus === "AGREED_CLIENT" && <span className="mini-badge client">Agreed</span>}
            {vacancy.unread && <span className="mini-badge unread" aria-label="Unread">New</span>}
            <span className={`mini-badge qa ${vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "fail" : ""}`}>
              {vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "Research required" : "QA ✓"}
            </span>
          </div>
          <div className="vacancy-stats" aria-label="Candidate market stats">
            <span>{credible} credible</span>
            <span>{strongest} strongest</span>
            <span>{top10} Top 10</span>
          </div>
        </>
      )}
      {density === "COMPACT" && (
        <>
          <div className="vacancy-detail-line">
            <span>{vacancy.location}</span>
            <span aria-hidden="true">·</span>
            <span>{credible} market</span>
            <span aria-hidden="true">·</span>
            <span>{channelLabels[vacancy.searchChannel]}</span>
          </div>
          <div className="vacancy-badges" style={{ marginTop:6 }}>
            {vacancy.clientStatus === "AGREED_CLIENT" && <span className="mini-badge client" style={{ fontSize:9, padding:"2px 5px" }}>Agreed</span>}
            <span className={`mini-badge qa ${vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "fail" : ""}`} style={{ fontSize:9, padding:"2px 5px" }}>
              {vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ? "Research" : "QA ✓"}
            </span>
          </div>
        </>
      )}
      {density === "MINIMAL" && (
        <div className="vacancy-detail-line" style={{ marginTop:4, fontSize:10 }}>
          <span>{vacancy.location}</span>
          <span aria-hidden="true">·</span>
          <span>{channelLabels[vacancy.searchChannel]}</span>
        </div>
      )}
    </button>
  );
}

function Overview({ vacancy }: { vacancy: Vacancy }) {
  const market = displayMarketCounts(
    vacancy.candidates,
    vacancy.candidateMarketSummary,
    vacancy.researchQueries.filter((query) => query.executionStatus === "EXECUTED").length
  );
  return (
    <div className="stack-lg">
      <p className="summary-copy">{vacancy.summary}</p>
      <div className="section-title">Priority requirements</div>
      <div className="requirements-grid">
        {vacancy.requirements.slice(0, 6).map((requirement) => (
          <div className="requirement-card" key={requirement.id}>
            <div className="requirement-label">{requirement.label}</div>
            <div className="requirement-value">{requirement.value}</div>
            <EvidencePill status={requirement.status} />
          </div>
        ))}
      </div>
      <div className="section-title">Candidate market progress</div>
      <div className="market-funnel-note">
        <div>
          Research target: broad discovery → 50+ credible candidates where the market supports it → strongest market of roughly 20–25 → final Top 10.
          These are depth targets, not quotas.
        </div>
        <div className="market-coverage-line">
          <StatusPill text={`Coverage: ${vacancy.candidateMarketSummary.coverageStatus.replaceAll("_", " ")}`} subtle />
          {vacancy.candidateMarketSummary.rawProfilesReviewed != null && (
            <span>{vacancy.candidateMarketSummary.rawProfilesReviewed} raw profiles reviewed</span>
          )}
        </div>
        {vacancy.candidateMarketSummary.coverageNote && (
          <div className="market-coverage-note">{vacancy.candidateMarketSummary.coverageNote}</div>
        )}
      </div>
      <div className="progress-grid">
        <MetricCard label="Queries run" value={market.executedQueries ?? 0} />
        <MetricCard label="Credible market" value={market.credible} />
        <MetricCard label="Longlist" value={market.longlist} />
        <MetricCard label="Strongest market" value={market.strongest} />
        <MetricCard label="Research Top 10" value={market.top10} />
        <MetricCard label="Hiring team" value={vacancy.stakeholders.length} />
      </div>
    </div>
  );
}

function HiringTeam({ vacancy }: { vacancy: Vacancy }) {
  const intel = vacancy.companyEmailIntelligence;
  const statusLabel = vacancy.stakeholderMapStatus.replaceAll("_", " ");

  return (
    <div className="stack-lg hiring-team-panel">
      <div className="hiring-team-status">
        <div>
          <div className="section-title">Hiring-team research</div>
          <p className="summary-copy">
            Named people who are likely to own, influence or execute hiring for this vacancy.
            Observed business emails are kept separate from pattern-inferred probable addresses.
          </p>
        </div>
        <StatusPill text={statusLabel} subtle />
      </div>

      {vacancy.stakeholderMapNote && (
        <div className="contact-research-note">{vacancy.stakeholderMapNote}</div>
      )}

      <div className="section-title">Company email intelligence</div>
      <div className="email-intel-grid">
        <div className="email-intel-card">
          <span>Website domain</span>
          <strong>{intel?.websiteDomain || "Unknown"}</strong>
          <small style={{ opacity:.7 }}>Company website</small>
        </div>
        <div className="email-intel-card">
          <span>Employee email domain</span>
          <strong>{intel?.employeeEmailDomain || "Unknown"}</strong>
          <small>{intel?.domainStatus || "UNKNOWN"}</small>
        </div>
        <div className="email-intel-card">
          <span>Detected pattern</span>
          <strong>{intel?.detectedPattern || "Unknown"}</strong>
          <small>{intel?.patternStatus || "UNKNOWN_PATTERN"}</small>
        </div>
        <div className="email-intel-card">
          <span>Observed examples</span>
          <strong>{intel?.observedPatternExamplesCount ?? 0}</strong>
          <small>{intel?.observedBusinessEmailExamples?.join(" · ") || "No public examples stored"}</small>
        </div>
      </div>

      {!!intel?.patternBasis?.length && (
        <div className="contact-pattern-basis">
          <strong>Pattern basis</strong>
          <span>{intel.patternBasis.join(" · ")}</span>
        </div>
      )}

      <div className="section-title">Hiring stakeholders</div>
      {vacancy.stakeholders.length === 0 ? (
        <div className="empty-state">
          {vacancy.stakeholderMapStatus === "NOT_STARTED"
            ? "Hiring-team research has not started for this vacancy."
            : vacancy.stakeholderMapStatus === "IN_PROGRESS"
              ? "Hiring-team research is in progress; no stakeholder has been resolved yet."
              : "No stakeholder was resolved. Review the research note and evidence before outreach."}
        </div>
      ) : (
        <div className="stakeholder-list">
          {vacancy.stakeholders.map((person) => (
            <article className="stakeholder-card" key={person.id} aria-label={`${person.name} stakeholder card`}>
              <div className="stakeholder-head">
                <div className="stakeholder-identity">
                  <div className="stakeholder-avatar" aria-hidden="true">
                    {initials(person.name)}
                  </div>
                  <div>
                    <strong>{person.name}</strong>
                    <div className="muted">{person.title || "Title unresolved"}</div>
                  </div>
                </div>
                <div className="stakeholder-pills">
                  {person.relevance && <StatusPill text={person.relevance.replaceAll("_", " ")} subtle />}
                  <EvidencePill status={person.evidenceStatus} />
                </div>
              </div>

              {person.reasonRelevant && <p>{person.reasonRelevant}</p>}

              <div className="stakeholder-grid">
                <div>
                  <span>Employment</span>
                  <strong>{person.currentEmploymentStatus?.replaceAll("_", " ") || "Unknown"}</strong>
                </div>
                <div className="observed">
                  <span><span className="icon" aria-hidden="true">✓</span> Observed business email</span>
                  <strong>{person.observedBusinessEmail || "—"}</strong>
                </div>
                <div className="probable">
                  <span><span className="icon" aria-hidden="true">◐</span> Probable business email</span>
                  <strong>{person.probableBusinessEmail || "—"}</strong>
                  {person.probableBusinessEmail && <small style={{ fontSize:9, color:"var(--stone-500)", marginTop:2 }}>Pattern-inferred · requires verification</small>}
                </div>
                <div>
                  <span>Email status</span>
                  <strong>{person.emailStatus?.replaceAll("_", " ") || "UNKNOWN"}</strong>
                </div>
              </div>

              {(person.emailPatternBasis || person.emailConfidenceNote) && (
                <div className="stakeholder-evidence-note">
                  {person.emailPatternBasis && <span><b>Pattern:</b> {person.emailPatternBasis}</span>}
                  {person.emailConfidenceNote && <span><b>Confidence:</b> {person.emailConfidenceNote}</span>}
                </div>
              )}

              <div className="stakeholder-links">
                {person.profileUrl && (
                  <a href={person.profileUrl} target="_blank" rel="noreferrer" aria-label={`Open profile for ${person.name}`}>Profile ↗</a>
                )}
                {person.lastVerified && <span>Verified {formatDate(person.lastVerified)}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Requirements({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="data-table" role="table" aria-label="Requirements">
      <div className="data-row header" role="row">
        <span role="columnheader">Requirement</span><span role="columnheader">Value</span><span role="columnheader">Type</span><span role="columnheader">Evidence</span>
      </div>
      {vacancy.requirements.map((r) => (
        <div className="data-row" key={r.id} role="row">
          <strong role="cell">{r.label}</strong><span role="cell">{r.value}</span><span role="cell">{r.type}</span><span role="cell"><EvidencePill status={r.status} /></span>
        </div>
      ))}
    </div>
  );
}

function Sources({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="source-list">
      {vacancy.sources.map((source) => (
        <div className="source-item" key={source.id}>
          <div>
            <strong>{source.name}</strong>
            <div className="muted">{source.type.replaceAll("_", " ")}</div>
          </div>
          <div className="source-meta">
            <EvidencePill status={source.evidenceStatus} />
            {source.postedAt && <span>{formatDate(source.postedAt)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchLog({ vacancy }: { vacancy: Vacancy }) {
  if (!vacancy.researchQueries.length) {
    return <div className="empty-state">No candidate research queries have been executed yet.</div>;
  }
  return (
    <div className="query-list">
      {vacancy.researchQueries.map((query) => (
        <div className="query-item" key={query.id}>
          <code>{query.query}</code>
          <div className="query-meta">
            <span>{query.source}</span>
            <span>{query.family.replaceAll("_", " ")}</span>
            <span className={query.executionStatus === "EXECUTED" ? "success-text" : "warn-text"}>
              {query.executionStatus}
            </span>
            <span>{query.candidatesSurfaced ?? 0} candidates</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function QaPanel({ vacancy }: { vacancy: Vacancy }) {
  return (
    <div className="qa-panel">
      <div className="qa-hero">
        <QaPill status={vacancy.qaStatus} />
        <div>
          <strong>Discovery / opportunity QA</strong>
          <p>
            The workspace never upgrades unknown information because it would make the record easier to use.
            Evidence status remains visible through downstream candidate work.
          </p>
        </div>
      </div>
      <div className="section-title">Current unresolved areas</div>
      <div className="unknown-list">
        {vacancy.employerStatus !== "CONFIRMED" && <span>Employer: {vacancy.employerStatus}</span>}
        {vacancy.requirements.filter((r) => r.status === "UNKNOWN" || r.status === "HYPOTHESIS").map((r) => (
          <span key={r.id}>{r.label}: {r.status}</span>
        ))}
        {vacancy.qaStatus === "PASS" && vacancy.employerStatus === "CONFIRMED" && (
          <span>No material discovery-level unknowns currently block the workflow.</span>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  saving,
  onOpen,
  onStatus,
  onExcludeStart,
}: {
  candidate: CandidateAssignment;
  selected: boolean;
  saving: boolean;
  onOpen: () => void;
  onStatus: (status: CandidateOperationalStatus, reason?: string) => void;
  onExcludeStart?: (candidateId: string, name: string) => void;
}) {
  const rankLabel = candidate.rank ? `#${candidate.rank}` : candidate.comparableTier ? `T${candidate.comparableTier}` : "•";
  const position = workflowPosition(candidate.operationalStatus);
  const excluded = candidate.operationalStatus === "EXCLUDED";
  const earmarked = position >= 2;
  const recruiterTop10 = position >= 3;
  const approachStarted = position >= 4;
  return (
    <article className={`candidate-card ${selected ? "open" : ""} ${excluded ? "is-excluded" : ""}`} aria-label={`Candidate ${candidate.name}`}>
      <button
        className="candidate-main"
        onClick={onOpen}
        aria-expanded={selected}
        aria-label={`${candidate.name}, ${candidate.currentTitle} at ${candidate.currentEmployer}. Press Enter to ${selected ? "collapse" : "expand"} details.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
          if (e.key === "Escape" && selected) {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <div className="candidate-rank" aria-hidden="true">{rankLabel}</div>
        <div className="candidate-identity">
          <div className="candidate-name">{candidate.name}</div>
          <div className="candidate-role">{candidate.currentTitle}</div>
          <div className="candidate-company">{candidate.currentEmployer} · {candidate.location}</div>
        </div>
        <div className="candidate-side">
          <span className={`bucket-badge ${candidate.marketBucket.toLowerCase()}`}>{marketLabels[candidate.marketBucket]}</span>
          <span className={`workflow-badge ${excluded ? "excluded" : "active"}`}>
            Recruiter · {workflowLabels[candidate.operationalStatus]}
          </span>
          <QaPill status={candidate.qaStatus} compact />
        </div>
      </button>

      <div className="candidate-actions" role="group" aria-label={`Actions for ${candidate.name}`}>
        <button
          disabled={saving || excluded || position > 2}
          onClick={() => onStatus(candidate.operationalStatus === "EARMARKED" ? "RELEVANT" : "EARMARKED")}
          className={earmarked ? "active" : ""}
          aria-pressed={earmarked}
          aria-label={earmarked ? "Unmark earmarked candidate" : "Earmark candidate"}
          title={
            excluded
              ? "Restore this candidate before changing workflow status."
              : position > 2
                ? "This candidate has progressed beyond Earmarked; the workflow will not be rolled backward."
                : undefined
          }
        >
          {earmarked ? "Earmarked" : "Earmark"}
        </button>
        <button
          disabled={saving || excluded || position > 3}
          onClick={() => onStatus(candidate.operationalStatus === "TOP_10" ? "EARMARKED" : "TOP_10")}
          className={recruiterTop10 ? "active" : ""}
          aria-pressed={recruiterTop10}
          aria-label={recruiterTop10 ? "Remove from recruiter Top 10" : "Add to Top 10"}
          title={
            excluded
              ? "Restore this candidate before changing workflow status."
              : position > 3
                ? "This candidate has progressed beyond Recruiter Top 10; the workflow will not be rolled backward."
                : "Recruiter workflow only; does not alter the research-recommended Top 10"
          }
        >
          {recruiterTop10 ? "Recruiter Top 10" : "Top 10"}
        </button>
        <button
          disabled={saving || excluded || approachStarted}
          onClick={() => onStatus("APPROACH")}
          className={candidate.operationalStatus === "APPROACH" ? "active" : ""}
          aria-pressed={candidate.operationalStatus === "APPROACH"}
          aria-label="Mark for approach"
        >
          {approachStarted ? "Approach started" : "Approach"}
        </button>
        {excluded ? (
          <button
            disabled={saving}
            onClick={() => onStatus("RELEVANT")}
            className="restore-lite"
            aria-label="Restore candidate to relevant"
          >
            Restore
          </button>
        ) : (
          <button disabled={saving} onClick={() => onExcludeStart?.(candidate.candidateId, candidate.name)} className="danger-lite" aria-label="Exclude candidate" aria-haspopup="dialog">
            Exclude
          </button>
        )}
      </div>

      {selected && (
        <div className="candidate-detail">
          {excluded && (
            <div className="excluded-note" role="note">
              <strong>Excluded from this vacancy</strong>
              <span>
                {candidate.excludedReason
                  ? `Reason: ${candidate.excludedReason}`
                  : "No exclusion reason recorded."}{" "}
                Evidence, QA and research ranking are unchanged; other vacancy assignments are
                unaffected.
              </span>
            </div>
          )}
          <p className="why-fit">{candidate.whyFit}</p>
          <div className="claim-grid" role="table" aria-label="Evidence claims">
            {candidate.claims.map((claim) => (
              <div className="claim-row" key={`${claim.name}-${claim.value}`} role="row">
                <span role="cell">{claim.name}</span><strong role="cell">{claim.value}</strong><span role="cell"><EvidencePill status={claim.status} /></span>
              </div>
            ))}
          </div>
          {!!candidate.evidenceGaps.length && (
            <>
              <div className="section-title small">Still unknown</div>
              <div className="gap-list">{candidate.evidenceGaps.map((gap) => <span key={gap}>{gap}</span>)}</div>
            </>
          )}
          {candidate.lastVerified && <div className="verified-line">Verified {formatDate(candidate.lastVerified)}</div>}
        </div>
      )}
    </article>
  );
}

function SummaryStat({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return <div className={`summary-stat ${accent ? "accent" : ""} ${warn ? "warn" : ""}`}><strong>{value}</strong><span>{label}</span></div>;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>;
}

function StatusPill({ text, subtle }: { text: string; subtle?: boolean }) {
  return <span className={`status-pill ${subtle ? "subtle" : ""}`}>{text}</span>;
}

function QaPill({ status, compact }: { status: string; compact?: boolean }) {
  const className = status === "PASS" ? "pass" : status === "FAIL_RESEARCH_REQUIRED" ? "fail" : "unknowns";
  const label = status === "PASS_WITH_UNKNOWNS" ? "PASS + unknowns" : status === "FAIL_RESEARCH_REQUIRED" ? "Research required" : "QA passed";
  return <span className={`qa-pill ${className} ${compact ? "compact" : ""}`} aria-label={`QA status ${label}`}>{label}</span>;
}

function EvidencePill({ status }: { status: string }) {
  // Larger, color-coded with text + dot, never color alone
  const normalized = status.toUpperCase();
  const className = normalized.toLowerCase();
  // Keep original label visible plus dot; color via CSS class
  return <span className={`evidence-pill ${className}`} aria-label={`Evidence ${normalized}`}>{normalized}</span>;
}

function lifecycleLabel(status: Vacancy["lifecycleStatus"]) {
  return status.replaceAll("_", " ");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useFocusTrap(active: boolean, containerRef: { current: HTMLElement | null }) {
  useEffect(() => {
    if (!active) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (!container) return;

    const focusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
