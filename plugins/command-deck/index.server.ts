import type { PluginServerContext } from "@getpaseo/plugin/server";
import { createRunner } from "./server/runner";
import { commandSettings, listRuns, startRun, captureRun, stopRun, forgetUnknownRun } from "./shared/commands";

export default function contribute(server: PluginServerContext) {
  server.registerSettings(commandSettings);
  const runner = createRunner();
  server.handle(listRuns, async (input, { paseo }) => ({ runs: await runner.list(input, paseo) }));
  server.handle(startRun, (input, { paseo }) => runner.start(input, input.task, input.requestId, paseo));
  server.handle(captureRun, (input, { paseo }) => runner.capture(input, paseo));
  server.handle(stopRun, (input, { paseo }) => runner.stop(input, input.terminate, paseo));
  server.handle(forgetUnknownRun, (input, { paseo }) => runner.forget(input, input.taskId, paseo));
  return () => runner.dispose();
}
