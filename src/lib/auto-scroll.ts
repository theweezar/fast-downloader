let scrollInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoScroll(selector?: string): void {
  stopAutoScroll();
  scrollInterval = setInterval(() => {
    const el = selector ? document.querySelector(selector) : null;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 200);
}

export function stopAutoScroll(): void {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

export function isAutoScrolling(): boolean {
  return scrollInterval !== null;
}
