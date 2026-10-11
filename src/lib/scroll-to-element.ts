/**
 * Scroll to an element after App Router navigation. Next.js often scrolls to
 * the top after soft navigations, so a single rAF/timeout is not enough —
 * retry a few times until layout has settled.
 */
export function scrollToElement(
  el: HTMLElement | null | undefined,
  options?: ScrollIntoViewOptions,
): () => void {
  if (!el) return () => {};

  const opts: ScrollIntoViewOptions = {
    behavior: "smooth",
    block: "start",
    ...options,
  };

  const run = () => el.scrollIntoView(opts);
  run();
  const timers = [50, 150, 350, 700].map((ms) => window.setTimeout(run, ms));
  return () => {
    for (const id of timers) window.clearTimeout(id);
  };
}
