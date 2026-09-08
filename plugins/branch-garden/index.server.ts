import type { PluginServerContext } from "@getpaseo/plugin/server";
import { branchGardenScan } from "./shared/branch-garden";
import { scanBranchGarden } from "./server/branch-garden";

export default function contribute(server: PluginServerContext) {
  server.handle(branchGardenScan, (_input, { paseo }) =>
    scanBranchGarden({
      projects: {
        async list() {
          const result = await paseo.projects.list();
          return {
            projects: result.projects.map((project) => ({
              id: project.projectId,
              displayName: project.projectDisplayName,
              rootPath: project.projectRootPath,
              kind: project.projectKind,
            })),
          };
        },
      },
      workspaces: {
        async list(page) {
          const result = await paseo.workspaces.list({ page });
          return {
            entries: result.entries.map((workspace) => ({
              id: workspace.id,
              projectId: workspace.projectId,
              projectDisplayName: workspace.projectDisplayName,
              projectRootPath: workspace.projectRootPath,
              projectKind: workspace.projectKind,
              workspaceDirectory: workspace.workspaceDirectory,
              name: workspace.name,
              title: workspace.title ?? null,
              archivingAt: workspace.archivingAt,
              gitRuntime: workspace.gitRuntime
                ? {
                    currentBranch: workspace.gitRuntime.currentBranch ?? null,
                    isDirty: workspace.gitRuntime.isDirty ?? null,
                  }
                : null,
            })),
            pageInfo: result.pageInfo,
          };
        },
      },
    }),
  );
  return () => {};
}
