import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import {
  deriveOrganisations,
  filterOrganisations,
  paginateOrganisations,
  safeSourceUrl,
} from "./read-model";

const base = demoSnapshot.vacancies[0];

describe("derived employer directory", () => {
  it("groups label variants without upgrading uncertain employer or client evidence", () => {
    const rows = deriveOrganisations([
      {
        ...base,
        id: "a",
        employerName: "Acme Limited",
        employerStatus: "PROBABLE",
        clientStatus: "TARGET_PROSPECT",
      },
      {
        ...base,
        id: "b",
        employerName: " acme   limited ",
        employerStatus: "CONFIRMED",
        clientStatus: "AGREED_CLIENT",
      },
      { ...base, id: "c", employerName: "Acme Ltd", employerStatus: "HYPOTHESIS" },
    ]);
    expect(rows).toHaveLength(2);
    const acme = rows.find((row) => row.vacancies.length === 2)!;
    expect(acme.employerEvidence).toBe("MIXED");
    expect(acme.employerStatuses).toEqual(["CONFIRMED", "PROBABLE"]);
    expect(acme.clientStatuses).toEqual(["AGREED_CLIENT", "TARGET_PROSPECT"]);
    expect(acme.candidateCount).toBe(base.candidates.length);
  });

  it("keeps unrelated unresolved employers separate and excludes closed roles from active counts", () => {
    const rows = deriveOrganisations([
      {
        ...base,
        id: "a",
        employerName: "Employer unresolved",
        employerStatus: "UNKNOWN",
        unread: true,
      },
      {
        ...base,
        id: "b",
        employerName: "Employer unresolved",
        employerStatus: "UNKNOWN",
        lifecycleStatus: "CLOSED",
        unread: true,
      },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => !row.identified)).toBe(true);
    expect(rows.reduce((count, row) => count + row.activeCount, 0)).toBe(1);
    expect(rows.reduce((count, row) => count + row.newCount, 0)).toBe(1);
  });

  it("filters the same organisation by any recorded relationship and location, then sorts deterministically", () => {
    const rows = deriveOrganisations([
      {
        ...base,
        id: "a",
        employerName: "Alpha",
        location: "Cape Town",
        clientStatus: "PAST_CLIENT",
      },
      {
        ...base,
        id: "b",
        employerName: "Alpha",
        location: "Johannesburg",
        clientStatus: "AGREED_CLIENT",
      },
      {
        ...base,
        id: "c",
        employerName: "Zulu",
        location: "Cape Town",
        clientStatus: "PAST_CLIENT",
      },
    ]);
    expect(
      filterOrganisations(rows, {
        query: "finance",
        relationship: "PAST_CLIENT",
        location: "Cape Town",
        evidence: "ALL",
        sort: "NAME",
      }).map((row) => row.name)
    ).toEqual(["Alpha", "Zulu"]);
    expect(
      filterOrganisations(rows, {
        query: "",
        relationship: "ALL",
        location: "ALL",
        evidence: "CONFIRMED",
        sort: "ACTIVE",
      })[0].name
    ).toBe("Alpha");
    expect(
      filterOrganisations(rows, {
        query: "no match",
        relationship: "ALL",
        location: "ALL",
        evidence: "ALL",
        sort: "NAME",
      })
    ).toEqual([]);
  });

  it("clamps pagination after filtering instead of returning an empty out-of-range page", () => {
    const rows = deriveOrganisations(demoSnapshot.vacancies);
    const result = paginateOrganisations(rows, 50, 2);
    expect(result.page).toBe(3);
    expect(result.items).toHaveLength(1);
    expect(paginateOrganisations([], 99, 2)).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      start: 0,
      end: 0,
    });
  });

  it("opens only web source URLs and treats missing or executable links as unavailable", () => {
    expect(safeSourceUrl("https://example.org/research?q=finance")).toBe(
      "https://example.org/research?q=finance"
    );
    expect(safeSourceUrl("javascript:alert(1)")).toBeNull();
    expect(safeSourceUrl("data:text/html,source")).toBeNull();
    expect(safeSourceUrl("not a URL")).toBeNull();
    expect(safeSourceUrl(null)).toBeNull();
  });
});
