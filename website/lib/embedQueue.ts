/**
 * Loading queue for Tableau embeds (Build Plan › Dashboard interaction › Reliability).
 *
 * - At most two dashboards load at a time; the rest wait in arrival order.
 * - A dashboard the reader asked for (story link, Full screen, Open interactive view,
 *   Try again) starts straight away, even if two are already loading.
 * - A slot is freed when a dashboard is ready, fails, or is cancelled.
 *
 * The queue only decides *when* an embed may start. It never touches a dashboard's
 * filters, parameters or selections.
 */

const MAX_ACTIVE = 2;

const active = new Set<string>();
const waiting = new Map<string, () => void>();
const preloaders = new Map<string, () => void>();

function startNext() {
  while (active.size < MAX_ACTIVE && waiting.size > 0) {
    const [id, start] = waiting.entries().next().value as [string, () => void];
    waiting.delete(id);
    active.add(id);
    start();
  }
}

/** Ask to load dashboard `id`. `start` runs once a slot is free (or at once if `urgent`). */
export function enqueue(id: string, start: () => void, urgent = false) {
  if (active.has(id)) return;
  if (urgent || active.size < MAX_ACTIVE) {
    waiting.delete(id);
    active.add(id);
    start();
    return;
  }
  waiting.set(id, start);
}

/** The dashboard finished (ready or failed) or gave up its slot. */
export function release(id: string) {
  waiting.delete(id);
  if (active.delete(id)) startNext();
}

/** Remove a dashboard that is still waiting for a slot. */
export function cancelWaiting(id: string) {
  waiting.delete(id);
}

/** Each TableauEmbed registers how to start loading itself early. Returns an unregister function. */
export function registerPreloader(id: string, preload: () => void) {
  preloaders.set(id, preload);
  return () => {
    if (preloaders.get(id) === preload) preloaders.delete(id);
  };
}

/**
 * Story links call this on click so the target dashboard starts loading before the
 * reader arrives. Loading never changes the dashboard: it opens exactly as published.
 */
export function preloadDashboard(id: string) {
  preloaders.get(id)?.();
}
