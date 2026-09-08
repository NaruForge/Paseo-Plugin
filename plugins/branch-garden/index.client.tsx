import type { PluginClientContext } from "@getpaseo/plugin/client";
import { MainSurface } from "./client/main";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", MainSurface);
  client.addSidebarItem({
    id: "main",
    title: "Branch Garden",
    icon: "Sprout",
    surface: "main",
  });
  return () => {};
}
