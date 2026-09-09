import { access, stat } from "node:fs/promises";
import path from "node:path";

export async function resolveDirectory(root: string, requested: string): Promise<string> {
  // Drive-relative and root-relative Windows paths depend on machine-global state.
  if (/^[a-z]:[^\\/]/i.test(requested) || /^[a-z]:$/i.test(requested) || /^[\\/](?![\\/])/.test(requested)) {
    throw new Error("Use a workspace-relative path or a complete Windows absolute path.");
  }
  const cwd = path.win32.resolve(root, requested || ".");
  try { if ((await stat(cwd)).isDirectory()) return cwd; } catch { /* Give a bounded user-facing error. */ }
  throw new Error("Working directory does not exist or is not accessible.");
}

export async function findPowerShell(platform = process.platform, env = process.env): Promise<string> {
  if (platform !== "win32") throw new Error("Command Deck currently supports Windows hosts only.");
  // Never resolve executables from the command's working directory.
  const searchPath = Object.entries(env).find(([key]) => key.toLowerCase() === "path")?.[1] ?? "";
  const directories = [env.ProgramFiles ? path.win32.join(env.ProgramFiles, "PowerShell", "7") : "", ...searchPath.split(";")];
  for (const directory of directories) {
    const clean = directory.replace(/^"|"$/g, "");
    if (!path.win32.isAbsolute(clean)) continue;
    const executable = path.win32.join(clean, "pwsh.exe");
    try { await access(executable); if ((await stat(executable)).isFile()) return executable; } catch { /* Try the next installed location. */ }
  }
  throw new Error("PowerShell 7 (pwsh.exe) was not found on the daemon PATH. Install it or update the daemon environment.");
}
