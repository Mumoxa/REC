import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { OrganisationDirectory } from "./directory";
import { deriveOrganisations } from "./read-model";

describe("organisation intelligence interactions", () => {
  it("searches real employer records and resets filters with no data mutation", async () => {
    const user = userEvent.setup();
    render(<OrganisationDirectory vacancies={demoSnapshot.vacancies} />);
    await user.type(screen.getByRole("searchbox", { name: "Search organisations" }), "SATURC");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("article")).toHaveTextContent("SATURC");
    await user.selectOptions(screen.getByLabelText("Client relationship"), "PAST_CLIENT");
    expect(screen.getByText("No employer groups match your filters")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Reset filters" })[0]);
    expect(screen.getAllByRole("article")).toHaveLength(demoSnapshot.vacancies.length);
    await user.click(screen.getByRole("button", { name: "Table view" }));
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Employer identity" })).toBeInTheDocument();
  });

  it("pages large directories and returns to page one when search changes", async () => {
    const user = userEvent.setup();
    const vacancies = Array.from({ length: 10 }, (_, index) => ({
      ...demoSnapshot.vacancies[0],
      id: `role-${index}`,
      employerName: `Employer ${index}`,
    }));
    render(<OrganisationDirectory vacancies={vacancies} />);
    expect(screen.getAllByRole("article")).toHaveLength(9);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search organisations" }), "Employer 1");
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("preserves vacancy context in candidate detail links and supports keyboard profile tabs", async () => {
    const user = userEvent.setup();
    const key = deriveOrganisations([demoSnapshot.vacancies[0]])[0].key;
    render(<OrganisationDirectory vacancies={[demoSnapshot.vacancies[0]]} selectedKey={key} />);
    await user.click(await screen.findByRole("tab", { name: "Candidate connections" }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("link", { name: "Alicia Daniels" })).toHaveAttribute(
      "href",
      "/candidates?candidate=c-1&vacancy=vac-001"
    );
    expect(within(panel).getByRole("columnheader", { name: "Research layer" })).toBeInTheDocument();
    const candidatesTab = screen.getByRole("tab", { name: "Candidate connections" });
    candidatesTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Research evidence" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Research evidence" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Research source records");
    await user.click(screen.getByRole("tab", { name: "Commercial relationship" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Commercial data not available");
  });

  it("reports a stale employer deep link without displaying another organisation", () => {
    render(
      <OrganisationDirectory vacancies={demoSnapshot.vacancies} selectedKey="missing-group" />
    );
    expect(screen.getByRole("heading", { name: "Employer group not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to organisations" })).toHaveAttribute(
      "href",
      "/companies"
    );
  });
});
