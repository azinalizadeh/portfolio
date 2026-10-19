import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SwapPanel } from "@/components/site/swap-panel";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";
import { setReducedMotion } from "./match-media";

afterEach(() => setReducedMotion(false));

function Probe() {
  return <p>{useReducedMotion() ? "reduced" : "full"}</p>;
}

describe("useReducedMotion", () => {
  it("follows the media query, including changes while mounted", () => {
    render(<Probe />);
    expect(screen.getByText("full")).toBeInTheDocument();

    act(() => setReducedMotion(true));
    expect(screen.getByText("reduced")).toBeInTheDocument();
    expect(prefersReducedMotion()).toBe(true);

    act(() => setReducedMotion(false));
    expect(screen.getByText("full")).toBeInTheDocument();
  });
});

describe("SwapPanel", () => {
  const panel = (key: string) => (
    <SwapPanel swapKey={key} data-testid="panel">
      <p>{key} one</p>
      <p>{key} two</p>
    </SwapPanel>
  );

  it("swaps at once with reduced motion", () => {
    setReducedMotion(true);
    const { rerender } = render(panel("a"));
    rerender(panel("b"));
    expect(screen.getByText("b one")).toBeInTheDocument();
    expect(screen.queryByText("a one")).toBeNull();
  });

  it("keeps the old content while it leaves, then shows the new content", async () => {
    const { rerender } = render(panel("a"));
    rerender(panel("b"));
    expect(screen.getByText("a one")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("b one")).toBeInTheDocument());
    expect(screen.queryByText("a one")).toBeNull();
  });

  it("shows new children right away when the key is unchanged", () => {
    const { rerender } = render(
      <SwapPanel swapKey="a">
        <p>first</p>
      </SwapPanel>,
    );
    rerender(
      <SwapPanel swapKey="a">
        <p>second</p>
      </SwapPanel>,
    );
    expect(screen.getByText("second")).toBeInTheDocument();
  });
});
