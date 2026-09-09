import { usePaseo } from "@getpaseo/plugin/client";
import { useEffect, useState } from "react";
export interface ProjectOption { id: string; name: string; directory: string }
export function useProjectCatalog(enabled = true) {
  const paseo = usePaseo();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [workspaceProjects, setWorkspaceProjects] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void (async () => {
      try {
        const result = await paseo.projects.list();
        const mapping: Record<string, string> = {};
        let cursor: string | undefined;
        const seen = new Set<string>();
        do {
          const page = await paseo.workspaces.list({ page: { limit: 200, cursor } });
          for (const entry of page.entries) mapping[entry.id] = entry.projectId;
          if (page.pageInfo.hasMore && !page.pageInfo.nextCursor) throw new Error("Incomplete Workspace listing");
          cursor = page.pageInfo.hasMore ? page.pageInfo.nextCursor ?? undefined : undefined;
          if (cursor && seen.has(cursor)) throw new Error("Repeated Workspace page");
          if (cursor) seen.add(cursor);
        } while (cursor && active);
        if (!active) return;
        setProjects(result.projects.map(project => ({ id: project.projectId, name: project.projectDisplayName,
          directory: project.projectRootPath })).sort((a, b) => a.name.localeCompare(b.name)));
        setWorkspaceProjects(mapping); setError(null);
      } catch { if (active) setError("Could not load Projects. Retry loading before adding or moving a command."); }
    })();
    return () => { active = false; };
  }, [paseo, refresh, enabled]);
  return { projects, workspaceProjects, error, reload: () => setRefresh(value => value + 1) };
}
