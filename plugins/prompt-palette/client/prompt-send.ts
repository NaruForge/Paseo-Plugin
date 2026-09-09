// Rejected send may mean acceptance followed by a lost acknowledgement.
export function createPromptSender() {
  let pending = false;
  let uncertain = false;
  let active = true;
  const listeners = new Set<() => void>();
  const notify = () => { for (const listener of listeners) listener(); };
  return {
    get pending() { return pending; },
    get uncertain() { return uncertain; },
    snapshot: () => pending,
    subscribe(listener: () => void) {
      if (!active) return () => {};
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    acknowledge() { if (!pending) uncertain = false; },
    dispose() { active = false; listeners.clear(); },
    async send(validate: () => Promise<boolean>, submit: () => Promise<void>): Promise<"sent" | "blocked" | "unavailable" | "unknown"> {
      if (!active || pending || uncertain) return "blocked";
      pending = true;
      notify();
      try {
        let valid = false;
        try { valid = await validate(); } catch { return "unavailable"; }
        if (!active || !valid) return "unavailable";
        try { await submit(); return "sent"; }
        catch { uncertain = true; return "unknown"; }
      } finally { pending = false; notify(); }
    },
  };
}
export type PromptSender = ReturnType<typeof createPromptSender>;
