let scrollInterval: ReturnType<typeof setInterval> | null = null;
let bounced = false;

const BOUNCE_DISTANCE = 300;
const BOTTOM_THRESHOLD = 2;

interface ScrollTarget {
  scrollTop: number;
  maxScroll: number;
  scrollTo(top: number): void;
}

function getScrollTarget(selector?: string): ScrollTarget {
  const el = selector ? document.querySelector(selector) : null;

  if (el) {
    return {
      scrollTop: el.scrollTop,
      maxScroll: el.scrollHeight - el.clientHeight,
      scrollTo: (top) => el.scrollTo({ top, behavior: "smooth" }),
    };
  }

  const doc = document.documentElement;
  return {
    scrollTop: doc.scrollTop,
    maxScroll: doc.scrollHeight - doc.clientHeight,
    scrollTo: (top) => window.scrollTo({ top, behavior: "smooth" }),
  };
}

export function startAutoScroll(selector?: string): void {
  stopAutoScroll();
  bounced = false;

  scrollInterval = setInterval(() => {
    const target = getScrollTarget(selector);
    const atBottom = target.scrollTop >= target.maxScroll - BOTTOM_THRESHOLD;

    if (atBottom && !bounced) {
      // Bounce up a little so scroll-position listeners see a change,
      // which is what triggers many sites' "load more" logic.
      bounced = true;
      target.scrollTo(Math.max(0, target.scrollTop - BOUNCE_DISTANCE));
    } else {
      bounced = false;
      target.scrollTo(target.maxScroll);
    }
  }, 1000);
}

export function stopAutoScroll(): void {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
  bounced = false;
}

export function isAutoScrolling(): boolean {
  return scrollInterval !== null;
}
