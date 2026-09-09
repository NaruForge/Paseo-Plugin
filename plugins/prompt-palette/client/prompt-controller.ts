export function createPromptController() {
  let open = false;
  let disposed = false;
  const listeners = new Set<() => void>();
  const notify = () => { for (const listener of listeners) listener(); };
  return {
    snapshot: () => open,
    subscribe(listener: () => void) {
      if (disposed) return () => {};
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    open() { if (!disposed && !open) { open = true; notify(); } },
    close() { if (open) { open = false; notify(); } },
    dispose() { disposed = true; open = false; notify(); listeners.clear(); },
  };
}
export type PromptController = ReturnType<typeof createPromptController>;

