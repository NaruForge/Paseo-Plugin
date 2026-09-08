import { useEffect, useState } from "react";

// Recompute from wall time after delayed/background ticks; never decrement a counter.
export function useResetClock(enabled: boolean): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [enabled]);
  return enabled ? now : new Date();
}
