import { describe, expect, it, vi } from "vitest";
import { createPromptSender } from "./prompt-send";
function deferred<T>() { let resolve!: (v: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
describe("prompt sending", () => {
  it("blocks synchronous double taps including validation time", async () => {
    const s = createPromptSender(), validation = deferred<boolean>(), submit = vi.fn(async () => {});
    const first = s.send(() => validation.promise, submit);
    expect(s.pending).toBe(true);
    expect(await s.send(async () => true, submit)).toBe("blocked");
    validation.resolve(true);
    expect(await first).toBe("sent");
    expect(submit).toHaveBeenCalledTimes(1);
    expect(s.pending).toBe(false);
  });
  it("does not submit after a Host/Agent teardown during validation", async () => {
    const s = createPromptSender(), validation = deferred<boolean>(), submit = vi.fn();
    const request = s.send(() => validation.promise, submit);
    s.dispose(); validation.resolve(true);
    expect(await request).toBe("unavailable"); expect(submit).not.toHaveBeenCalled();
  });
  it("allows retry when validation failed before submission", async () => {
    const s = createPromptSender(), submit = vi.fn(async () => {});
    expect(await s.send(async () => { throw Error("offline"); }, submit)).toBe("unavailable");
    expect(await s.send(async () => false, submit)).toBe("unavailable");
    expect(submit).not.toHaveBeenCalled();
    expect(await s.send(async () => true, submit)).toBe("sent");
  });
  it("latches delivery uncertainty until explicit acknowledgement, without retrying", async () => {
    const s = createPromptSender(), submit = vi.fn(async () => { throw Error("private transport detail"); });
    expect(await s.send(async () => true, submit)).toBe("unknown");
    expect(s.uncertain).toBe(true);
    expect(await s.send(async () => true, submit)).toBe("blocked");
    expect(submit).toHaveBeenCalledTimes(1);
    s.acknowledge();
    expect(await s.send(async () => true, async () => {})).toBe("sent");
  });
  it("stays pending until acceptance, independently of turn completion", async () => {
    const s = createPromptSender(), accepted = deferred<void>();
    const request = s.send(async () => true, () => accepted.promise);
    await Promise.resolve();
    expect(s.pending).toBe(true);
    accepted.resolve();
    expect(await request).toBe("sent");
  });
  it("exposes pending transitions to pills and releases listeners on teardown", async () => {
    const s = createPromptSender(), listener = vi.fn();
    const off = s.subscribe(listener);
    await s.send(async () => true, async () => {});
    expect(listener).toHaveBeenCalledTimes(2);
    expect(s.snapshot()).toBe(false);
    off();
    await s.send(async () => true, async () => {});
    expect(listener).toHaveBeenCalledTimes(2);
    s.dispose(); s.subscribe(listener);
    expect(await s.send(async () => true, async () => {})).toBe("blocked");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
