const HEADER_OFFSET = 96;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Scrolls to an element by id with a fixed-duration, easing-driven animation.
 * Bypasses CSS `scroll-behavior: smooth`, whose native scroll can crawl for
 * many seconds when page height keeps shifting mid-scroll (e.g. while
 * passing through the scroll-pinned Services/Categories sections, whose
 * row heights animate in response to scroll position).
 */
export function scrollToId(id: string, duration = 700) {
  const el = document.getElementById(id);
  if (!el) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targetY = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  );

  if (prefersReducedMotion) {
    window.scrollTo({ top: targetY, behavior: "instant" });
    return;
  }

  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo({
      top: startY + diff * easeInOutCubic(progress),
      behavior: "instant",
    });
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
