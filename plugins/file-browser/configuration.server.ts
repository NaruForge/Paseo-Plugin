import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, win32 } from "node:path";
import type { FileBrowserRootConfig } from "./file-browser.server";

export function parseFileBrowserRoots(text: string): FileBrowserRootConfig[] {
  const value: unknown = JSON.parse(text.replace(/^\uFEFF/, ""));
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => key !== "roots")) throw new Error("Expected a roots object.");
  const roots = (value as { roots?: unknown }).roots;
  if (!Array.isArray(roots) || roots.length < 1 || roots.length > 16) throw new Error("Configure between 1 and 16 roots.");
  const ids = new Set<string>();
  return roots.map((root: unknown) => {
    if (!root || typeof root !== "object" || Array.isArray(root) || Object.keys(root).some((key) => !["id", "label", "path"].includes(key))) throw new Error("Invalid root.");
    const { id, label, path } = root as Record<string, unknown>;
    if (typeof id !== "string" || !/^[a-z][a-z0-9-]{0,39}$/.test(id) || ids.has(id)) throw new Error("Root IDs must be unique lowercase identifiers.");
    if (typeof label !== "string" || !label.trim() || label.length > 80 || /[\u0000-\u001f]/.test(label)) throw new Error("Invalid root label.");
    if (typeof path !== "string" || !/^[a-z]:[\\/]/i.test(path) || /[\u0000-\u001f<>"|?*]/.test(path) || path.slice(2).includes(":")) throw new Error("Use an absolute local Windows directory path.");
    const normalized = win32.normalize(path);
    if (normalized === win32.parse(normalized).root || normalized.split(/[\\/]/).some((segment, index) => index > 0 && segment && (/[. ]$/.test(segment) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment)))) throw new Error("Drive roots and reserved Windows paths are not allowed.");
    ids.add(id);
    return { id, label: label.trim(), path: normalized };
  });
}

export function readFileBrowserRoots(file = join(homedir(), ".config", "paseo-plugins", "file-browser.json")): FileBrowserRootConfig[] {
  try {
    const text = readFileSync(file, "utf8");
    if (Buffer.byteLength(text) > 16_384) throw new Error();
    return parseFileBrowserRoots(text);
  } catch {
    throw new Error("Configure allowed folders in ~/.config/paseo-plugins/file-browser.json on the Windows daemon host, then retry. See the File Browser README. Missing or invalid configuration exposes no folders.");
  }
}
