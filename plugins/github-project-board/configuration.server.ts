import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_PROJECT_OWNER = "@me";
export function createProjectOwnerReader(readOwner = readProjectOwner): () => string {
  let configuredOwner: string | undefined;
  return () => configuredOwner ??= readOwner();
}

export const configuredProjectOwner = createProjectOwnerReader();

export function validateProjectOwner(value: unknown): string {
  if (typeof value !== "string" || !(value === "@me" || /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value))) {
    throw new Error("GitHub owner must be @me or a GitHub user/organization login.");
  }
  return value;
}

export function readProjectOwner(file = join(homedir(), ".config", "paseo-plugins", "github-project-board.json")): string {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_PROJECT_OWNER;
    throw new Error("Cannot read ~/.config/paseo-plugins/github-project-board.json on the daemon host.");
  }
  try {
    if (Buffer.byteLength(text) > 16_384) throw new Error();
    const config: unknown = JSON.parse(text.replace(/^\uFEFF/, ""));
    if (!config || typeof config !== "object" || Array.isArray(config) || Object.keys(config).some((key) => key !== "owner")) throw new Error();
    return validateProjectOwner((config as { owner?: unknown }).owner);
  } catch {
    throw new Error('Invalid ~/.config/paseo-plugins/github-project-board.json. Expected {"owner":"@me"} or a GitHub login.');
  }
}
