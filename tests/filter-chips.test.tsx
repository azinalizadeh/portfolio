import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilterChips } from "@/components/site/filter-chips";
import { setReducedMotion } from "./match-media";

const options = ["Docker", "Go", "React", "TypeScript"].map((value) => ({ value, label: value }));

function Chips({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (v: string[]) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <FilterChips
      aria-label="Technology"
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const chip = (name: string) => screen.getByRole("button", { name });

afterEach(() => setReducedMotion(false));

describe("FilterChips", () => {
  it("is a labelled toolbar of toggle buttons named once by their label", () => {
    render(<Chips initial={["Go"]} />);
    expect(screen.getByRole("toolbar", { name: "Technology" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(chip("Go")).toHaveAttribute("aria-pressed", "true");
    expect(chip("React")).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles on click and reports the selection in option order", async () => {
    const onChange = vi.fn();
    render(<Chips onChange={onChange} />);
    const user = userEvent.setup();

    await user.click(chip("TypeScript"));
    await user.click(chip("Docker"));
    expect(onChange).toHaveBeenLastCalledWith(["Docker", "TypeScript"]);
    expect(chip("Docker")).toHaveAttribute("aria-pressed", "true");

    await user.click(chip("TypeScript"));
    expect(onChange).toHaveBeenLastCalledWith(["Docker"]);
    expect(chip("TypeScript")).toHaveAttribute("aria-pressed", "false");
  });

  it("never reorders chips when the selection changes", async () => {
    render(<Chips />);
    await userEvent.setup().click(chip("React"));
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(
      options.map((option) => option.label.repeat(3)),
    );
  });

  it("is one Tab stop; arrow keys, Home and End move focus without toggling", async () => {
    const onChange = vi.fn();
    render(<Chips onChange={onChange} />);
    const user = userEvent.setup();

    await user.tab();
    expect(chip("Docker")).toHaveFocus();
    expect(screen.getAllByRole("button").map((button) => button.tabIndex)).toEqual([0, -1, -1, -1]);

    await user.keyboard("{ArrowRight}");
    expect(chip("Go")).toHaveFocus();
    expect(chip("Go").tabIndex).toBe(0);

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(chip("TypeScript")).toHaveFocus();

    await user.keyboard("{Home}");
    expect(chip("Docker")).toHaveFocus();
    await user.keyboard("{End}");
    expect(chip("TypeScript")).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles the focused chip with Space and Enter", async () => {
    render(<Chips />);
    const user = userEvent.setup();

    await user.tab();
    await user.keyboard("{ArrowRight} ");
    expect(chip("Go")).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Enter}");
    expect(chip("Go")).toHaveAttribute("aria-pressed", "false");
  });

  it("goes straight to the end state with reduced motion", async () => {
    setReducedMotion(true);
    render(<Chips />);
    await userEvent.setup().click(chip("React"));

    const button = chip("React");
    expect(button).toHaveAttribute("data-selected", "true");
    for (const part of button.querySelectorAll("[data-ink], [data-roll], [data-check]")) {
      expect(part.getAttribute("style") ?? "").toBe("");
    }
  });
});
