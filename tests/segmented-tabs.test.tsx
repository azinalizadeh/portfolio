import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SegmentedTabs, segmentedTabId } from "@/components/site/segmented-tabs";
import { setReducedMotion } from "./match-media";

const options = [
  { value: "all", label: "All", count: 4 },
  { value: "work", label: "Work", count: 2 },
  { value: "side", label: "Side", count: 2 },
] as const;
type Value = (typeof options)[number]["value"];

function Tabs({ initial = "all", onChange }: { initial?: Value; onChange?: (v: Value) => void }) {
  const [value, setValue] = useState<Value>(initial);
  return (
    <SegmentedTabs
      id="type"
      aria-label="Project type"
      panelId="panel"
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const indicatorIn = (tab: HTMLElement) => tab.querySelector('[data-flip-id="type-indicator"]');

afterEach(() => setReducedMotion(false));

describe("SegmentedTabs", () => {
  it("exposes a labelled tablist with one selected tab", () => {
    render(<Tabs initial="work" />);
    expect(screen.getByRole("tablist", { name: "Project type" })).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    for (const tab of tabs) expect(tab).toHaveAttribute("aria-controls", "panel");
    expect(screen.getByRole("tab", { name: /^Work/ })).toHaveAttribute(
      "id",
      segmentedTabId("type", "work"),
    );
  });

  it("keeps only the selected tab in the Tab order", () => {
    render(<Tabs initial="side" />);
    expect(screen.getAllByRole("tab").map((tab) => tab.tabIndex)).toEqual([-1, -1, 0]);
  });

  it("selects on click and ignores clicks on the selected tab", async () => {
    const onChange = vi.fn();
    render(<Tabs onChange={onChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("tab", { name: /All/ }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("tab", { name: /Side/ }));
    expect(onChange).toHaveBeenCalledWith("side");
    expect(screen.getByRole("tab", { name: /Side/ })).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus and selection with arrow keys, Home and End, wrapping at the ends", async () => {
    render(<Tabs />);
    const user = userEvent.setup();
    const tab = (name: RegExp) => screen.getByRole("tab", { name });

    await user.tab();
    expect(tab(/All/)).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tab(/Work/)).toHaveFocus();
    expect(tab(/Work/)).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(tab(/All/)).toHaveFocus();
    expect(tab(/All/)).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}");
    expect(tab(/Side/)).toHaveFocus();

    await user.keyboard("{Home}");
    expect(tab(/All/)).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(tab(/Side/)).toHaveAttribute("aria-selected", "true");
    expect(tab(/Side/)).toHaveFocus();
  });

  it("renders the shared fill only inside the selected tab", async () => {
    render(<Tabs />);
    await userEvent.setup().click(screen.getByRole("tab", { name: /Work/ }));

    const [all, work, side] = screen.getAllByRole("tab") as [HTMLElement, HTMLElement, HTMLElement];
    expect(indicatorIn(all)).toBeNull();
    expect(indicatorIn(side)).toBeNull();
    expect(indicatorIn(work)).not.toBeNull();
  });

  it("snaps the fill with reduced motion, leaving no inline animation styles", async () => {
    setReducedMotion(true);
    render(<Tabs />);
    await userEvent.setup().click(screen.getByRole("tab", { name: /Side/ }));

    const indicator = indicatorIn(screen.getByRole("tab", { name: /Side/ }));
    expect(indicator).not.toBeNull();
    expect(indicator?.getAttribute("style") ?? "").toBe("");
  });
});
