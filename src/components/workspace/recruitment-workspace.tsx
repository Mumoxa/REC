"use client";

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
import { AppHeader } from "@/components/shell/app-header";
import { PageHeader } from "@/components/ui/primitives";
import {
  AlignLeft,
  ArrowRight,
  Bookmark as BookmarkIcon,
  BriefcaseBusiness,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  Clock3,
  Filter,
  Focus,
  LayoutList,
  Rows3,
  Save,
  Search,
  ShieldCheck as ShieldIcon,
  UsersRound,
  X,
} from "lucide-react";
import {
  CandidateCard,
  channelLabels,
  EvidencePill,
  formatDate,
  HiringTeam,
  marketFilterLabels,
  marketLabels,
  Overview,
  QaPanel,
  QaPill,
  Requirements,
  SearchLog,
  Sources,
  StatusPill,
  SummaryStat,
  VacancyCard,
} from "./workspace-panels";

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

const closeReasonLabels: Record<string, string> = {
  FILLED: "FILLED — role filled",
  EXPIRED: "EXPIRED — advert expired",
  CLIENT_NO_LONGER_HIRING: "CLIENT_NO_LONGER_HIRING",
  NOT_COMMERCIALLY_RELEVANT: "NOT_COMMERCIALLY_RELEVANT",
  DUPLICATE: "DUPLICATE",
  CANCELLED: "CANCELLED",
  OTHER: "OTHER",
};

/**
 * Optional deep-link state from the URL (`/?q=` and `/?vacancy=`). Used by the
 * Companies and QA pages so a link opens the matching records instead of the
 * unfiltered inbox. Unknown ids fall back to the default selection.
 */
export function RecruitmentWorkspace({
  initialSnapshot,
  initialQuery = "",
  initialVacancyId,
  initialCandidateId,
}: {
  initialSnapshot: WorkspaceSnapshot;
  initialQuery?: string;
  initialVacancyId?: string;
  initialCandidateId?: string;
}) {
  const initialSavedViews = initialSnapshot.savedViews || [];
  const deepLinkVacancy = initialVacancyId
    ? initialSnapshot.vacancies.find((vacancy) => vacancy.id === initialVacancyId)
    : initialCandidateId
      ? initialSnapshot.vacancies.find((vacancy) =>
          vacancy.candidates.some((candidate) => candidate.candidateId === initialCandidateId)
        )
      : undefined;
  const [vacancies, setVacancies] = useState(initialSnapshot.vacancies);
  const [selectedId, setSelectedId] = useState(
    deepLinkVacancy?.id ?? initialSnapshot.vacancies[0]?.id ?? ""
  );
  const [globalSearch, setGlobalSearch] = useState(initialQuery);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [density, setDensity] = useState<WorkspaceDensity>("EXPANDED");
  const [relationshipFilter, setRelationshipFilter] = useState("ALL");
  const [researchFilter, setResearchFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DEFAULT");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [candidateFocus, setCandidateFocus] = useState(false);
  const [jobTab, setJobTab] = useState<JobTab>("OVERVIEW");
  const [marketFilter, setMarketFilter] = useState<MarketBucket | "ALL">("ALL");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    deepLinkVacancy?.candidates.some((candidate) => candidate.candidateId === initialCandidateId)
      ? (initialCandidateId ?? null)
      : null
  );
  const [saving, setSaving] = useState<string | null>(null);
  // A deep link to a closed vacancy must not land on an empty, filtered-out row.
  const [archiveFilter, setArchiveFilter] = useState<WorkspaceArchiveFilter>(
    deepLinkVacancy?.lifecycleStatus === "CLOSED" ? "ALL" : "ACTIVE"
  );
  const [savedViews, setSavedViews] = useState(initialSavedViews);
  const [loadedViewName, setLoadedViewName] = useState<string>("");
  const [saveName, setSaveName] = useState<string>("");
  const [savingView, setSavingView] = useState(false);
  const [exclusionTarget, setExclusionTarget] = useState<{
    candidateId: string;
    name: string;
  } | null>(null);
  // No default reason: an exclusion reason must be an explicit recruiter choice.
  const [excludeReason, setExcludeReason] = useState<string>("");
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<Vacancy | null>(null);
  const [closingVacancyId, setClosingVacancyId] = useState<string | null>(null);
  const closePendingRef = useRef(false);
  const candidatePendingRef = useRef(false);
  const [closeReason, setCloseReason] = useState("FILLED");
  const [closeReasonDetail, setCloseReasonDetail] = useState("");
  const [mobilePane, setMobilePane] = useState<MobilePane>(
    initialCandidateId ? "CANDIDATES" : initialVacancyId ? "INTELLIGENCE" : "VACANCIES"
  );
  // P1: toast replaces alert() — announced via role=alert
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeqRef = useRef(0);
  const toastTimersRef = useRef<number[]>([]);
  const showToast = (message: string, tone: Toast["tone"] = "error") => {
    const id = ++toastSeqRef.current;
    setToasts((p) => [...p, { id, message, tone }]);
    const timer = window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
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
    return vacancies
      .filter((vacancy) => {
        const matchesQuery =
          !q ||
          [
            vacancy.title,
            vacancy.employerName,
            vacancy.location,
            vacancy.roleFamily,
            vacancy.sourceLabel,
            vacancy.requirements.map((r) => `${r.label} ${r.value}`).join(" "),
            vacancy.stakeholders
              .map(
                (person) =>
                  `${person.name} ${person.title ?? ""} ${person.relevance ?? ""} ${person.observedBusinessEmail ?? ""} ${person.probableBusinessEmail ?? ""}`
              )
              .join(" "),
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
        const matchesRelationship =
          relationshipFilter === "ALL" ||
          (relationshipFilter === "AGREED"
            ? ["AGREED_CLIENT", "AGREED_GROUP_ENTITY"].includes(vacancy.clientStatus)
            : vacancy.clientStatus === relationshipFilter);
        const matchesResearch =
          researchFilter === "ALL" ||
          (researchFilter === "NEEDS_RESEARCH"
            ? vacancy.qaStatus === "FAIL_RESEARCH_REQUIRED" ||
              vacancy.employerStatus !== "CONFIRMED"
            : vacancy.candidateMapStatus === researchFilter);
        return (
          matchesQuery &&
          matchesChannel &&
          matchesRegion &&
          matchesArchive &&
          matchesRelationship &&
          matchesResearch
        );
      })
      .sort((a, b) => {
        if (sortOrder === "TITLE") return a.title.localeCompare(b.title);
        if (sortOrder === "RECENT")
          return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime();
        if (sortOrder === "VERIFIED")
          return new Date(b.lastVerified ?? 0).getTime() - new Date(a.lastVerified ?? 0).getTime();
        if (sortOrder === "MARKET")
          return (
            displayMarketCounts(b.candidates, b.candidateMarketSummary).credible -
            displayMarketCounts(a.candidates, a.candidateMarketSummary).credible
          );
        return 0;
      });
  }, [
    vacancies,
    debouncedGlobalSearch,
    channelFilter,
    regionFilter,
    archiveFilter,
    relationshipFilter,
    researchFilter,
    sortOrder,
  ]);

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
            candidate.operationalStatus === "EXCLUDED" || candidate.marketBucket === "EXCLUDED"
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
  const estimatedRowHeight = density === "EXPANDED" ? 276 : density === "COMPACT" ? 146 : 72;
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
  }, [
    shouldVirtualize,
    vacancyScrollTop,
    vacancyViewportH,
    estimatedRowHeight,
    filteredVacancies.length,
  ]);

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
      chips.push({
        key: "channel",
        label: channelLabels[channelFilter] ?? channelFilter,
        onClear: () => setChannelFilter("ALL"),
      });
    }
    if (regionFilter !== "ALL") {
      chips.push({ key: "region", label: regionFilter, onClear: () => setRegionFilter("ALL") });
    }
    if (archiveFilter !== "ACTIVE") {
      const label = archiveFilter === "ARCHIVED" ? "Archived" : "All statuses";
      chips.push({ key: "archive", label, onClear: () => setArchiveFilter("ACTIVE") });
    }
    if (globalSearch.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${globalSearch.trim()}"`,
        onClear: () => setGlobalSearch(""),
      });
    }
    if (candidateSearch.trim()) {
      chips.push({
        key: "csearch",
        label: `Candidates: "${candidateSearch.trim()}"`,
        onClear: () => setCandidateSearch(""),
      });
    }
    if (relationshipFilter !== "ALL")
      chips.push({
        key: "relationship",
        label:
          relationshipFilter === "AGREED"
            ? "Agreed relationships"
            : relationshipFilter.replaceAll("_", " "),
        onClear: () => setRelationshipFilter("ALL"),
      });
    if (researchFilter !== "ALL")
      chips.push({
        key: "research",
        label: researchFilter.replaceAll("_", " "),
        onClear: () => setResearchFilter("ALL"),
      });
    return chips;
  }, [
    channelFilter,
    regionFilter,
    archiveFilter,
    globalSearch,
    candidateSearch,
    relationshipFilter,
    researchFilter,
  ]);

  const clearAllFilters = () => {
    setChannelFilter("ALL");
    setRegionFilter("ALL");
    setArchiveFilter("ACTIVE");
    setGlobalSearch("");
    setCandidateSearch("");
    setMarketFilter("ALL");
    setLoadedViewName("");
    setRelationshipFilter("ALL");
    setResearchFilter("ALL");
  };

  useFocusTrap(closeConfirmOpen, closeDrawerRef);
  useFocusTrap(Boolean(exclusionTarget), excludeDrawerRef);

  useEffect(() => {
    if (closingVacancyId) closeDrawerRef.current?.focus();
  }, [closingVacancyId]);

  // Capture the trigger before the initial focus effect moves into the drawer.
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

  // "/" focuses vacancy search unless the recruiter is already typing or a drawer is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (closeConfirmOpen || exclusionTarget) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable)
        return;
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
          if (closePendingRef.current) return;
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
      if (next) {
        setSelectedId(next.id);
        setSelectedCandidateId(null);
        setJobTab("OVERVIEW");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = filteredVacancies[Math.max(idx - 1, 0)];
      if (prev) {
        setSelectedId(prev.id);
        setSelectedCandidateId(null);
        setJobTab("OVERVIEW");
      }
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
      const next =
        visibleCandidates[Math.min(idx + 1 >= 0 ? idx + 1 : 0, visibleCandidates.length - 1)];
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
    if (!selected || candidatePendingRef.current || closePendingRef.current) return;

    // Contract: exclusion carries an explicit, non-blank reason.
    if (status === "EXCLUDED" && !hasMeaningfulText(reason)) {
      showToast("A reason is required before a candidate can be excluded.", "error");
      return;
    }

    const previousStatus = candidate.operationalStatus;
    const previousReason = candidate.excludedReason ?? null;
    const nextReason = status === "EXCLUDED" ? (reason as string).trim() : null;

    candidatePendingRef.current = true;
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
        candidatePendingRef.current = false;
        setSaving(null);
        return;
      }
    }
    candidatePendingRef.current = false;
    setSaving(null);
    showToast(
      `${initialSnapshot.demoMode ? "Demo session: " : ""}${candidate.name} workflow updated. Research evidence is unchanged.`,
      "info"
    );
    if (status === "EXCLUDED" && exclusionTarget) {
      resetExclusionDrawer();
    }
  }

  function restoreSavedView(view: (typeof savedViews)[0]) {
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
    setRelationshipFilter(state.relationshipFilter);
    setResearchFilter(state.researchFilter);
    setSortOrder(state.sortOrder);
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
        relationshipFilter,
        researchFilter,
        sortOrder,
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
            copy[idx] = {
              ...json.savedView,
              viewState: json.savedView.view_state || payload.viewState,
            };
            return copy;
          }
          return [
            ...prev,
            { ...json.savedView, viewState: json.savedView.view_state || payload.viewState },
          ];
        });
        setLoadedViewName(saveName.trim());
        showToast("View saved.", "info");
      }
      setSaveName("");
    } catch {
      showToast("Failed to save view.", "error");
    } finally {
      setSavingView(false);
    }
  }

  async function confirmCloseVacancy(reason: string, reasonDetail: string) {
    const target = closeTarget;
    if (!target || closePendingRef.current || candidatePendingRef.current) return;

    // Contract: OTHER must carry a non-blank explanation.
    if (reason === "OTHER" && !hasMeaningfulText(reasonDetail)) {
      showToast("An explanation is required when closing a vacancy with reason OTHER.", "error");
      return;
    }

    const detail = reason === "OTHER" ? reasonDetail.trim() : null;

    closePendingRef.current = true;
    setClosingVacancyId(target.id);
    setSaving(`vacancy:${target.id}`);
    const previousStatus = target.lifecycleStatus;
    const previousDetail = target.closeReasonDetail ?? null;
    const previousReason = target.closedReason ?? null;
    setVacancies((current) =>
      current.map((vacancy) =>
        vacancy.id === target.id
          ? {
              ...vacancy,
              lifecycleStatus: "CLOSED",
              closedReason: reason,
              closeReasonDetail: detail,
            }
          : vacancy
      )
    );

    if (!initialSnapshot.demoMode) {
      try {
        const res = await fetch("/api/ops/vacancy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: target.id,
            action: "CLOSE",
            reason,
            ...(detail ? { reasonDetail: detail } : {}),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch {
        setVacancies((current) =>
          current.map((vacancy) =>
            vacancy.id === target.id
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
        setClosingVacancyId(null);
        closePendingRef.current = false;
        setSelectedId(target.id);
        return;
      }
    }

    const next = filteredVacancies.find(
      (v) => v.id !== target.id && v.lifecycleStatus !== "CLOSED"
    );
    if (next) {
      setSelectedId(next.id);
      setSelectedCandidateId(null);
      setJobTab("OVERVIEW");
    }
    setSaving(null);
    setClosingVacancyId(null);
    closePendingRef.current = false;
    setCloseConfirmOpen(false);
    setCloseTarget(null);
    showToast(
      `${initialSnapshot.demoMode ? "Demo session: " : ""}Vacancy archived. Its intelligence and candidate market are preserved.`,
      "info"
    );
    setCloseReason("FILLED");
    setCloseReasonDetail("");
  }

  function switchPane(pane: MobilePane) {
    setMobilePane(pane);
    if (window.innerWidth <= 799) {
      window.requestAnimationFrame(() =>
        document
          .querySelector(".mobile-pane-switch")
          ?.scrollIntoView?.({ block: "start", behavior: "instant" })
      );
    }
  }

  const exclusionCandidate = exclusionTarget
    ? (selected?.candidates.find((c) => c.candidateId === exclusionTarget.candidateId) ?? null)
    : null;

  return (
    <div className="workspace-shell">
      <a href="#vacancy-list" className="skip-link">
        Skip to vacancies
      </a>
      <AppHeader
        current="VACANCIES"
        demoMode={initialSnapshot.demoMode}
        generatedAt={initialSnapshot.generatedAt}
        snapshot={initialSnapshot}
      />
      <main className="page-content workspace-page" id="main-content" tabIndex={-1}>
        <PageHeader
          eyebrow="OPPORTUNITY WORKSPACE"
          title="Vacancies"
          description="From the first hiring signal to an evidence-backed candidate market."
          actions={
            <button
              className={`btn ${candidateFocus ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setCandidateFocus((value) => !value);
                switchPane("CANDIDATES");
              }}
              aria-pressed={candidateFocus}
              aria-label={candidateFocus ? "Exit candidate focus" : "Enter candidate focus"}
            >
              <Focus size={16} />
              {candidateFocus ? "Exit focus" : "Candidate focus"}
            </button>
          }
        />
        <section className="workspace-kpis" aria-label="Workspace summary">
          <SummaryStat label="Active vacancies" value={counts.active} />
          <SummaryStat label="New opportunities" value={counts.new} accent />
          <SummaryStat label="Needs research" value={counts.needsResearch} warn />
          <SummaryStat label="Candidate markets ready" value={counts.marketReady} />
        </section>

        <section
          className="workspace-filterbar surface"
          data-expanded={filtersExpanded}
          aria-label="Workspace controls"
        >
          <div className="global-search-wrap workspace-search">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Global vacancy search"
              className="global-search"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search vacancies, employers, requirements…"
            />
            {globalSearch ? (
              <button onClick={() => setGlobalSearch("")} aria-label="Clear search">
                <X size={16} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </div>
          <div className="workspace-status-tabs" role="group" aria-label="Vacancy lifecycle views">
            <button
              className={archiveFilter === "ACTIVE" ? "active" : ""}
              onClick={() => setArchiveFilter("ACTIVE")}
              aria-pressed={archiveFilter === "ACTIVE"}
            >
              Active <span>{counts.active}</span>
            </button>
            <button
              className={archiveFilter === "ARCHIVED" ? "active" : ""}
              onClick={() => setArchiveFilter("ARCHIVED")}
              aria-pressed={archiveFilter === "ARCHIVED"}
            >
              Archived <span>{vacancies.length - counts.active}</span>
            </button>
            <button
              className={archiveFilter === "ALL" ? "active" : ""}
              onClick={() => setArchiveFilter("ALL")}
              aria-pressed={archiveFilter === "ALL"}
            >
              All vacancies <span>{vacancies.length}</span>
            </button>
          </div>
          <button
            className="workspace-filter-toggle"
            onClick={() => setFiltersExpanded((value) => !value)}
            aria-expanded={filtersExpanded}
            aria-label="Show filters and saved views"
          >
            <Filter size={14} />
            Filters &amp; saved views
            {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
            <ChevronDownIcon size={14} />
          </button>
          <div className="workspace-filter-fields" role="group" aria-label="Vacancy filters">
            <Filter size={16} className="workspace-filter-icon" aria-hidden="true" />
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              aria-label="Filter by channel"
            >
              <option value="ALL">All channels</option>
              <option value="AGREED_CLIENTS">Agreed Clients</option>
              <option value="AGENCY_SITES">Agencies</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="JOB_BOARDS">Job Boards</option>
            </select>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
              aria-label="Filter by region"
            >
              <option value="ALL">All regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <select
              value={relationshipFilter}
              onChange={(event) => setRelationshipFilter(event.target.value)}
              aria-label="Filter by relationship"
            >
              <option value="ALL">All relationships</option>
              <option value="AGREED">Agreed clients / groups</option>
              <option value="TARGET_PROSPECT">Target prospects</option>
              <option value="PAST_CLIENT">Past clients</option>
              <option value="UNKNOWN">Relationship unknown</option>
            </select>
            <select
              value={researchFilter}
              onChange={(event) => setResearchFilter(event.target.value)}
              aria-label="Filter by research stage"
            >
              <option value="ALL">All research stages</option>
              <option value="NEEDS_RESEARCH">Needs research</option>
              <option value="NOT_STARTED">Mapping not started</option>
              <option value="IN_PROGRESS">Mapping in progress</option>
              <option value="READY">Market ready</option>
            </select>
            <select
              value={archiveFilter}
              onChange={(event) => setArchiveFilter(event.target.value as WorkspaceArchiveFilter)}
              aria-label="Archive filter"
            >
              <option value="ACTIVE">Active roles</option>
              <option value="ARCHIVED">Archived roles</option>
              <option value="ALL">All statuses</option>
            </select>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort vacancies"
            >
              <option value="DEFAULT">Queue order</option>
              <option value="RECENT">Newest first</option>
              <option value="VERIFIED">Recently verified</option>
              <option value="TITLE">Title A–Z</option>
              <option value="MARKET">Largest market</option>
            </select>
          </div>
          <div className="workspace-saved-views">
            <div className="workspace-saved-label">
              <BookmarkIcon />
              <span>Saved views</span>
            </div>
            <select
              value={loadedViewName}
              onChange={(event) => {
                const view = savedViews.find((item) => item.name === event.target.value);
                if (view) restoreSavedView(view);
                else setLoadedViewName("");
              }}
              aria-label="Load saved view"
            >
              <option value="">Choose a saved view</option>
              {savedViews.map((view) => (
                <option key={view.id} value={view.name}>
                  {view.name}
                </option>
              ))}
            </select>
            <input
              aria-label="Saved view name"
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              placeholder="Name this view"
            />
            <button
              className="btn btn-secondary"
              disabled={savingView || !saveName.trim()}
              onClick={saveCurrentView}
              aria-label="Save current view"
            >
              <Save size={15} />
              {savingView ? "Saving…" : "Save view"}
            </button>
          </div>
          {activeFilters.length > 0 && (
            <div className="filter-chips" role="group" aria-label="Active filters">
              {activeFilters.map((chip) => (
                <span key={chip.key} className="chip">
                  {chip.label}
                  <button onClick={chip.onClear} aria-label={`Remove filter ${chip.label}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                className="clear-all"
                onClick={clearAllFilters}
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            </div>
          )}
          {loadedViewName && (
            <div
              className="saved-view-banner"
              role="status"
              aria-live="polite"
              aria-label="Loaded saved view"
            >
              <span>
                Viewing: <strong>{loadedViewName}</strong> — filters and density restored from saved
                view.
              </span>
              <button onClick={() => setLoadedViewName("")} aria-label="Clear saved view">
                Clear
              </button>
            </div>
          )}
        </section>

        <nav className="mobile-pane-switch" aria-label="Mobile workspace panes">
          <button
            className={mobilePane === "VACANCIES" ? "active" : ""}
            onClick={() => switchPane("VACANCIES")}
            aria-pressed={mobilePane === "VACANCIES"}
          >
            <BriefcaseBusiness size={15} />
            Vacancies
          </button>
          <button
            className={mobilePane === "INTELLIGENCE" ? "active" : ""}
            onClick={() => switchPane("INTELLIGENCE")}
            aria-pressed={mobilePane === "INTELLIGENCE"}
          >
            <LayoutList size={15} />
            Intelligence
          </button>
          <button
            className={mobilePane === "CANDIDATES" ? "active" : ""}
            onClick={() => switchPane("CANDIDATES")}
            aria-pressed={mobilePane === "CANDIDATES"}
          >
            <UsersRound size={15} />
            Candidates
          </button>
        </nav>
        {selected && (
          <div className="mobile-breadcrumb" aria-label="Selected vacancy breadcrumb">
            <span>
              <strong>{selected.title}</strong> · {selected.employerName}
            </span>
            <button onClick={() => switchPane("VACANCIES")} aria-label="Back to vacancy list">
              Change <ChevronRight size={14} />
            </button>
          </div>
        )}

        <section
          className={`workspace-grid ${candidateFocus ? "candidate-focus" : ""}`}
          data-mobile-pane={mobilePane}
          aria-label="Three-pane workspace"
        >
          <aside className="vacancy-pane surface" aria-label="Vacancy inbox">
            <div className="pane-header">
              <div>
                <div className="eyebrow">YOUR OPPORTUNITY QUEUE</div>
                <h2>
                  Intelligence inbox{" "}
                  <span className="count-pill" aria-label={`${filteredVacancies.length} vacancies`}>
                    {filteredVacancies.length}
                  </span>
                </h2>
              </div>
            </div>
            <div className="density-control" role="group" aria-label="Vacancy card density">
              {(
                [
                  { id: "EXPANDED", label: "Full", Icon: LayoutList },
                  { id: "COMPACT", label: "Compact", Icon: Rows3 },
                  { id: "MINIMAL", label: "Titles", Icon: AlignLeft },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setDensity(id)}
                  className={density === id ? "active" : ""}
                  aria-pressed={density === id}
                  aria-label={`Density ${label}`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
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
                <div
                  className="vacancy-list-virtual-spacer"
                  style={{ height: virtualRange.totalHeight }}
                >
                  <div
                    className="vacancy-list-virtual-window"
                    style={{ transform: `translateY(${virtualRange.offsetY}px)` }}
                  >
                    {filteredVacancies
                      .slice(virtualRange.start, virtualRange.end)
                      .map((vacancy) => (
                        <VacancyCard
                          key={vacancy.id}
                          vacancy={vacancy}
                          density={density}
                          selected={selected?.id === vacancy.id}
                          onSelect={() => {
                            setSelectedId(vacancy.id);
                            setSelectedCandidateId(null);
                            setJobTab("OVERVIEW");
                            switchPane("INTELLIGENCE");
                          }}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                filteredVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    vacancy={vacancy}
                    density={density}
                    selected={selected?.id === vacancy.id}
                    onSelect={() => {
                      setSelectedId(vacancy.id);
                      setSelectedCandidateId(null);
                      setJobTab("OVERVIEW");
                      switchPane("INTELLIGENCE");
                    }}
                  />
                ))
              )}
              {filteredVacancies.length === 0 && (
                <div className="empty-state" role="status">
                  <Search size={28} />
                  <h3>No matching vacancies</h3>
                  <p>Try clearing filters or include archived roles.</p>
                  <button className="btn btn-secondary" onClick={clearAllFilters}>
                    Reset filters
                  </button>
                </div>
              )}
            </div>
            <div className="queue-footnote">
              <ShieldIcon />
              Canonical roles · source lineage preserved
            </div>
          </aside>

          {selected ? (
            <section className="job-pane surface" aria-label="Vacancy intelligence">
              <div className="job-header">
                <div className="job-relationship">
                  <span className="eyebrow">VACANCY INTELLIGENCE</span>
                  {selected.clientStatus === "AGREED_CLIENT" && (
                    <span className="client-badge">Agreed client</span>
                  )}
                </div>
                <h2>{selected.title}</h2>
                <div className="job-employer">
                  {selected.employerName}
                  <EvidencePill status={selected.employerStatus} />
                </div>
                <div className="job-meta">
                  <span>{selected.location}</span>
                  <span>{channelLabels[selected.searchChannel]}</span>
                  <span>{selected.sourceLabel}</span>
                </div>
                <div className="status-line" role="group" aria-label="Vacancy status">
                  <StatusPill
                    text={
                      selected.lifecycleStatus === "CLOSED" && selected.closedReason
                        ? `CLOSED · ${selected.closedReason.replaceAll("_", " ")}`
                        : selected.lifecycleStatus.replaceAll("_", " ")
                    }
                  />
                  <QaPill status={selected.qaStatus} />
                  <StatusPill
                    text={`Map: ${selected.candidateMapStatus.replaceAll("_", " ")}`}
                    subtle
                  />
                </div>
                <div className="job-header-footer">
                  <span>
                    <Clock3 size={13} />
                    {selected.lastVerified
                      ? `Verified ${formatDate(selected.lastVerified)}`
                      : "Verification date unavailable"}
                  </span>
                  <button
                    className="close-job-button"
                    onClick={() => {
                      setCloseReason("FILLED");
                      setCloseReasonDetail("");
                      setCloseTarget(selected);
                      setCloseConfirmOpen(true);
                    }}
                    disabled={Boolean(saving) || selected.lifecycleStatus === "CLOSED"}
                    title={
                      selected.lifecycleStatus === "CLOSED"
                        ? "This vacancy is already archived."
                        : undefined
                    }
                    aria-label="Close vacancy"
                    aria-haspopup="dialog"
                  >
                    {selected.lifecycleStatus === "CLOSED" ? "Archived" : "Close role"}
                  </button>
                </div>
              </div>
              {selected.lifecycleStatus === "CLOSED" && selected.closeReasonDetail && (
                <div className="drawer-note" role="note">
                  Closed with explanation: {selected.closeReasonDetail}
                </div>
              )}
              <nav className="job-tabs" role="tablist" aria-label="Vacancy details">
                {(
                  [
                    "OVERVIEW",
                    "HIRING_TEAM",
                    "REQUIREMENTS",
                    "SOURCES",
                    "SEARCH_LOG",
                    "QA",
                  ] as JobTab[]
                ).map((tab) => (
                  <button
                    key={tab}
                    id={`tab-${tab}`}
                    role="tab"
                    aria-selected={jobTab === tab}
                    aria-controls={`panel-${tab}`}
                    className={jobTab === tab ? "active" : ""}
                    onClick={() => setJobTab(tab)}
                  >
                    {tab === "SEARCH_LOG"
                      ? "Research searches"
                      : tab === "HIRING_TEAM"
                        ? "Stakeholders"
                        : tab[0] + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </nav>
              <div
                className="job-content"
                id={`panel-${jobTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${jobTab}`}
              >
                {jobTab === "OVERVIEW" && <Overview vacancy={selected} />}
                {jobTab === "HIRING_TEAM" && <HiringTeam vacancy={selected} />}
                {jobTab === "REQUIREMENTS" && <Requirements vacancy={selected} />}
                {jobTab === "SOURCES" && <Sources vacancy={selected} />}
                {jobTab === "SEARCH_LOG" && <SearchLog vacancy={selected} />}
                {jobTab === "QA" && <QaPanel vacancy={selected} />}
              </div>
              <div className="workbench-context-action">
                <div>
                  <UsersRound size={17} />
                  <span>
                    <strong>{selectedMarket.credible}</strong> credible ·{" "}
                    <strong>{selectedMarket.top10}</strong> research Top 10
                  </span>
                </div>
                <button onClick={() => switchPane("CANDIDATES")}>
                  Open candidate market <ArrowRight size={15} />
                </button>
              </div>
            </section>
          ) : (
            <section className="job-pane surface">
              <div className="empty-state" role="status">
                <BriefcaseBusiness size={32} />
                <h3>Your next opportunity starts here</h3>
                <p>Select a vacancy from the queue to explore its intelligence.</p>
              </div>
            </section>
          )}

          <section className="candidate-pane surface" aria-label="Candidate market">
            {selected ? (
              <>
                <div className="candidate-header">
                  <div className="candidate-panel-title">
                    <div>
                      <div className="eyebrow">VACANCY-SPECIFIC RESEARCH</div>
                      <h2>Candidate market</h2>
                    </div>
                    <span className="candidate-market-count">{selectedMarket.credible}</span>
                  </div>
                  <p className="candidate-context" aria-live="polite">
                    {selected.title} · {selected.employerName}
                    {candidateFocus ? " — candidate focus" : ""}
                  </p>
                  <div className="candidate-counts" aria-label="Market counts">
                    <span>
                      <strong>{selectedMarket.strongest}</strong> strongest market
                    </span>
                    <span>
                      <strong>{selectedMarket.top10}</strong> research Top 10
                    </span>
                    <span>{selected.candidates.length} loaded</span>
                  </div>
                </div>
                <div
                  className="candidate-search-row"
                  role="search"
                  aria-label="Candidate market search"
                >
                  <div className="candidate-search-field">
                    <Search size={15} aria-hidden="true" />
                    <input
                      id="candidate-search"
                      value={candidateSearch}
                      onChange={(event) => setCandidateSearch(event.target.value)}
                      placeholder="Find a person or skill…"
                      aria-label="Search candidate market"
                    />
                  </div>
                  <select
                    value={marketFilter}
                    onChange={(event) =>
                      setMarketFilter(event.target.value as MarketBucket | "ALL")
                    }
                    aria-label="Filter by market bucket"
                  >
                    <option value="ALL">All buckets</option>
                    {(Object.keys(marketLabels) as MarketBucket[]).map((bucket) => (
                      <option key={bucket} value={bucket}>
                        {marketFilterLabels[bucket]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="market-tabs" role="group" aria-label="Market buckets">
                  <button
                    className={marketFilter === "ALL" ? "active" : ""}
                    onClick={() => setMarketFilter("ALL")}
                    aria-pressed={marketFilter === "ALL"}
                  >
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
                <div className="research-workflow-note">
                  <span className="research-dot" />
                  Research buckets are separate from recruiter workflow.
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
                      actionsDisabled={Boolean(saving)}
                      onOpen={() =>
                        setSelectedCandidateId((current) =>
                          current === candidate.candidateId ? null : candidate.candidateId
                        )
                      }
                      onStatus={(status, reason) =>
                        updateCandidateStatus(candidate, status, reason)
                      }
                      onExcludeStart={(id, name) => {
                        setExclusionTarget({ candidateId: id, name });
                        setExcludeReason("");
                      }}
                    />
                  ))}
                  {visibleCandidates.length === 0 && (
                    <div className="empty-state" role="status">
                      <UsersRound size={28} />
                      <h3>
                        {selected.candidates.length === 0
                          ? "Market mapping awaits research"
                          : "No matching candidates"}
                      </h3>
                      <p>
                        {selected.candidates.length === 0
                          ? "Candidate market mapping has not started for this vacancy."
                          : "Try another search or research bucket."}
                      </p>
                      {selected.candidates.length > 0 && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setCandidateSearch("");
                            setMarketFilter("ALL");
                          }}
                        >
                          Reset candidate filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state" role="status">
                <UsersRound size={30} />
                <h3>Candidate market</h3>
                <p>Select a vacancy to open its candidate market.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      {/* Close vacancy drawer — intentional workflow step with preview + reason */}
      {closeConfirmOpen && closeTarget && (
        <div
          className="drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Close vacancy confirmation"
          aria-busy={Boolean(closingVacancyId)}
          onClick={(e) => {
            if (e.target === e.currentTarget && !closePendingRef.current)
              setCloseConfirmOpen(false);
          }}
        >
          <div className="drawer" ref={closeDrawerRef} role="document" tabIndex={-1}>
            <div className="drawer-header">
              <div>
                <h3>Close vacancy</h3>
                <p>
                  Closing removes this role from the active inbox. Intelligence, candidates and QA
                  history are preserved and remain searchable.
                </p>
              </div>
              <button
                className="drawer-close-x"
                onClick={() => {
                  if (!closePendingRef.current) setCloseConfirmOpen(false);
                }}
                disabled={Boolean(closingVacancyId)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-preview" role="group" aria-label="Vacancy preview">
                <strong>{closeTarget.title}</strong>
                <span>
                  {closeTarget.employerName} · {closeTarget.location} ·{" "}
                  {channelLabels[closeTarget.searchChannel]}
                </span>
                <span>
                  QA: {closeTarget.qaStatus} · Map:{" "}
                  {closeTarget.candidateMapStatus.replaceAll("_", " ")} ·{" "}
                  {closeTarget.candidates.length} candidates
                </span>
              </div>
              <div className="drawer-field">
                <label htmlFor="close-reason-drawer">
                  Reason for closing{" "}
                  <span aria-hidden="true" style={{ color: "var(--red)" }}>
                    *
                  </span>
                </label>
                <select
                  id="close-reason-drawer"
                  value={closeReason}
                  disabled={Boolean(closingVacancyId)}
                  onChange={(e) => setCloseReason(e.target.value)}
                >
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
                    Explanation for OTHER{" "}
                    <span aria-hidden="true" style={{ color: "var(--red)" }}>
                      *
                    </span>
                  </label>
                  <input
                    id="close-reason-detail"
                    value={closeReasonDetail}
                    disabled={Boolean(closingVacancyId)}
                    maxLength={MAX_REASON_DETAIL_LENGTH}
                    onChange={(e) => setCloseReasonDetail(e.target.value)}
                    placeholder="Why is this role being closed?"
                    aria-describedby="close-reason-detail-hint"
                  />
                  <small
                    id="close-reason-detail-hint"
                    style={{ color: "var(--stone-500)", fontSize: 10 }}
                  >
                    Required. Your explanation will be saved with this vacancy closure.
                  </small>
                </div>
              )}
              {archiveFilter !== "ARCHIVED" && archiveFilter !== "ALL" && (
                <div className="drawer-note" role="note">
                  This vacancy will move to archived. Use Archive filter (Archived / All) to
                  retrieve it.
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  if (closePendingRef.current) return;
                  setCloseConfirmOpen(false);
                  setCloseReasonDetail("");
                }}
                disabled={Boolean(closingVacancyId)}
                aria-label="Cancel close"
              >
                Cancel
              </button>
              <button
                ref={closeConfirmRef}
                className="btn-confirm"
                onClick={() => confirmCloseVacancy(closeReason, closeReasonDetail)}
                disabled={
                  Boolean(closingVacancyId) ||
                  (closeReason === "OTHER" && !hasMeaningfulText(closeReasonDetail))
                }
                aria-label="Confirm close vacancy"
              >
                {closingVacancyId ? "Closing…" : "Confirm close"}
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
          onClick={(e) => {
            if (e.target === e.currentTarget) resetExclusionDrawer();
          }}
        >
          <div className="drawer" ref={excludeDrawerRef} role="document" tabIndex={-1}>
            <div className="drawer-header">
              <div>
                <h3>Exclude candidate</h3>
                <p>
                  Exclusion is vacancy-specific and does not alter the person&apos;s evidence. A
                  reason is required.
                </p>
              </div>
              <button
                className="drawer-close-x"
                onClick={resetExclusionDrawer}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-preview" aria-label="Exclusion preview">
                <strong>{exclusionCandidate?.name ?? exclusionTarget.name}</strong>
                <span>
                  {exclusionCandidate?.currentTitle ?? ""}{" "}
                  {exclusionCandidate?.currentEmployer
                    ? `· ${exclusionCandidate.currentEmployer}`
                    : ""}
                </span>
                <span>
                  Vacancy: <strong style={{ color: "var(--slate)" }}>{selected.title}</strong> ·{" "}
                  {selected.employerName}
                </span>
                {exclusionCandidate && (
                  <span>
                    Bucket: {marketLabels[exclusionCandidate.marketBucket]} · QA:{" "}
                    {exclusionCandidate.qaStatus}
                  </span>
                )}
              </div>
              <div className="drawer-field">
                <label htmlFor="exclude-reason-drawer">
                  Reason for exclusion{" "}
                  <span aria-hidden="true" style={{ color: "var(--red)" }}>
                    *
                  </span>
                </label>
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
                <small id="exclude-reason-hint" style={{ color: "var(--stone-500)", fontSize: 10 }}>
                  Your reason will be saved with this assignment. Research evidence is unchanged.
                </small>
              </div>
              <div className="drawer-note" role="note">
                The candidate will move to the Excluded bucket for this vacancy only. Other vacancy
                assignments are unchanged.
              </div>
            </div>
            <div className="drawer-footer">
              <button
                className="btn-cancel"
                onClick={resetExclusionDrawer}
                aria-label="Cancel exclusion"
              >
                Cancel
              </button>
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
                disabled={
                  !hasMeaningfulText(excludeReason) ||
                  saving === `candidate:${exclusionTarget.candidateId}`
                }
                aria-label="Confirm exclusion"
              >
                {saving === `candidate:${exclusionTarget.candidateId}`
                  ? "Excluding…"
                  : "Confirm exclusion"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* P1: toast stack — replaces alert(), role=alert live */}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`toast ${t.tone === "error" ? "toast-error" : ""}`}
          >
            <span>{t.message}</span>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {toasts
          .filter((t) => t.tone === "error")
          .map((t) => t.message)
          .join(" ")}
      </div>
    </div>
  );
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (container.querySelector<HTMLElement>("select") ?? focusable()[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (nodes.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
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
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [active, containerRef]);
}
