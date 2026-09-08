import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run through npm test.");
for (const entry of await readdir(new URL("../plugins/", import.meta.url), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const args = [npm, "test", "--workspace", entry.name];
  if (entry.name === "file-browser" && process.platform !== "win32") {
    console.log("File Browser: portable configuration, archive-filter and view tests only; Windows filesystem/transport suites require Windows.");
    args.push("--", "configuration.server.test.ts", "archive-filter.server.test.ts", "file-browser.view.test.ts");
  }
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit", windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
