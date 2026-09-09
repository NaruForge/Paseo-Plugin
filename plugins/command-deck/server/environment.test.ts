import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { findPowerShell, resolveDirectory } from "./environment";
describe("Windows execution environment", () => {
  it("rejects unsupported hosts and missing PowerShell without launching a process", async () => {
    await expect(findPowerShell("linux", {})).rejects.toThrow("Windows");
    await expect(findPowerShell("win32", { PATH: "relative;.;" })).rejects.toThrow("not found");
  });
  it("rejects drive-relative and root-relative paths", async () => {
    for (const value of ["C:folder", "C:", "\\folder", "/folder"]) {
      await expect(resolveDirectory("C:\\repo", value)).rejects.toThrow("complete Windows");
    }
  });
  it.skipIf(process.platform !== "win32")("resolves real Unicode/spaced directories and rejects missing paths", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "command-deck-path-"));
    const child = path.join(root, "한글 space"); await mkdir(child);
    expect(await resolveDirectory(root, "한글 space")).toBe(child);
    expect(await resolveDirectory(root, child)).toBe(child);
    expect(await resolveDirectory(root, "")).toBe(root);
    await expect(resolveDirectory(root, "does-not-exist")).rejects.toThrow("does not exist");
    // Empty test directories only; avoid recursive filesystem operations.
    const { rmdir } = await import("node:fs/promises"); await rmdir(child); await rmdir(root);
  });
});
