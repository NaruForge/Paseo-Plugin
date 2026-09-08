import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createProjectOwnerReader, readProjectOwner, validateProjectOwner } from "./configuration.server";
import { assertReadOnlyGhArgs, githubProjectViewArgs, listGithubProjects, scanGithubProject } from "./github-project-board.server";

const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true })));

describe("daemon project owner configuration", () => {
  it("pins successful configuration until a new runtime and retries failed loads", () => {
    let value: string | undefined;
    const load = () => { if (!value) throw new Error("Invalid configuration"); return value; };
    const read = createProjectOwnerReader(load);
    expect(read).toThrow("Invalid");
    value = "first-owner";
    expect(read()).toBe("first-owner");
    value = "second-owner";
    expect(read()).toBe("first-owner");
    expect(createProjectOwnerReader(load)()).toBe("second-owner");
  });
  it("defaults to the authenticated user and fails closed for malformed configuration", () => {
    const directory = mkdtempSync(join(tmpdir(), "paseo-owner-"));
    temporary.push(directory);
    const file = join(directory, "owner.json");
    expect(readProjectOwner(file)).toBe("@me");
    writeFileSync(file, '\uFEFF{"owner":"another-org"}');
    expect(readProjectOwner(file)).toBe("another-org");
    for (const text of ['{', '{}', '{"owner":"--help"}', '{"owner":"org","token":"secret"}']) {
      writeFileSync(file, text);
      expect(() => readProjectOwner(file)).toThrow("Invalid");
    }
  });

  it("preserves exact read-only commands for configurable owners", () => {
    expect(() => assertReadOnlyGhArgs(githubProjectViewArgs(1, "another-org"))).not.toThrow();
    expect(() => assertReadOnlyGhArgs([...githubProjectViewArgs(1, "another-org"), "--web"])).toThrow();
    for (const value of ["", "--help", "org/repo", "org;command", "org\nname", "@other"]) {
      expect(() => validateProjectOwner(value)).toThrow();
    }
  });

  it("uses the configured owner for every list and board read", async () => {
    const calls: string[][] = [];
    const gh = async (args: readonly string[]) => {
      calls.push([...args]);
      assertReadOnlyGhArgs(args);
      const data = args[1] === "list" ? { projects: [] }
        : args[1] === "view" ? { title: "Example", url: "https://github.com/orgs/another-org/projects/1", number: 1, owner: { login: "another-org" } }
        : args[1] === "field-list" ? { fields: [] } : { items: [] };
      return { stdout: JSON.stringify(data), stderr: "" };
    };
    await listGithubProjects({ owner: "another-org", gh });
    await scanGithubProject(1, { owner: "another-org", gh });
    expect(calls).toHaveLength(4);
    expect(calls.every((args) => args[args.indexOf("--owner") + 1] === "another-org")).toBe(true);
  });
});
