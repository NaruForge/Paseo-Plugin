import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseFileBrowserRoots, readFileBrowserRoots } from "./configuration.server";

const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true })));
const config = (path: string) => JSON.stringify({ roots: [{ id: "work", label: "Work", path }] });

describe("daemon file allowlist configuration", () => {
  it("accepts explicit local folders and preserves Unicode names", () => {
    expect(parseFileBrowserRoots(config("D:\\팀 프로젝트"))).toEqual([{ id: "work", label: "Work", path: "D:\\팀 프로젝트" }]);
  });

  it("rejects broad, relative, network, device and reserved paths", () => {
    for (const path of ["C:\\", "C:\\work\\..", "..\\work", "C:work", "\\\\server\\share", "\\\\?\\C:\\work", "C:\\work:stream", "C:\\CON", "C:\\folder.", "C:\\work\nsecret"]) {
      expect(() => parseFileBrowserRoots(config(path)), path).toThrow();
    }
    expect(() => parseFileBrowserRoots('{"roots":[]}')).toThrow();
    expect(() => parseFileBrowserRoots(JSON.stringify({ roots: Array(2).fill({ id: "work", label: "Work", path: "C:\\work" }) }))).toThrow();
    expect(() => parseFileBrowserRoots('{"roots":[],"allowAll":true}')).toThrow();
  });

  it("never silently falls back when the configuration is missing or invalid", () => {
    const directory = mkdtempSync(join(tmpdir(), "paseo-roots-"));
    temporary.push(directory);
    const file = join(directory, "roots.json");
    expect(() => readFileBrowserRoots(file)).toThrow("exposes no folders");
    writeFileSync(file, '{"roots":"C:\\\\Projects"}');
    expect(() => readFileBrowserRoots(file)).toThrow("exposes no folders");
    writeFileSync(file, '\uFEFF' + config("C:\\work"));
    expect(readFileBrowserRoots(file)[0]?.path).toBe("C:\\work");
  });
});
