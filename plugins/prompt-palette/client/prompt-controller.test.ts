import { expect, it, vi } from "vitest";
import { createPromptController } from "./prompt-controller";
it("notifies once per transition and cannot reopen after cleanup", () => {
  const c = createPromptController(), listener = vi.fn();
  const off = c.subscribe(listener);
  c.open(); c.open();
  expect(listener).toHaveBeenCalledTimes(1);
  expect(c.snapshot()).toBe(true);
  c.close(); expect(c.snapshot()).toBe(false);
  off(); c.open(); expect(listener).toHaveBeenCalledTimes(2);
  c.dispose(); c.open(); expect(c.snapshot()).toBe(false);
  const after = vi.fn(); c.subscribe(after); c.open(); expect(after).not.toHaveBeenCalled();
});

