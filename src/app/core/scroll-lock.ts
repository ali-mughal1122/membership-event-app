let lockCount = 0;
let scrollY = 0;

function onLockedWheel(event: WheelEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest('[data-scroll-lock-allow]')) return;
  event.preventDefault();
}

function onLockedTouchMove(event: TouchEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest('[data-scroll-lock-allow]')) return;
  event.preventDefault();
}

function restoreScroll(y: number) {
  const html = document.documentElement;
  const previousBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  html.style.scrollBehavior = previousBehavior;
}

export function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    scrollY = window.scrollY;
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.addEventListener('wheel', onLockedWheel, { passive: false });
    document.addEventListener('touchmove', onLockedTouchMove, { passive: false });
  }
  lockCount += 1;
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  document.removeEventListener('wheel', onLockedWheel);
  document.removeEventListener('touchmove', onLockedTouchMove);

  const y = scrollY;
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.documentElement.classList.remove('overflow-hidden');
  document.body.classList.remove('overflow-hidden');
  restoreScroll(y);
  requestAnimationFrame(() => restoreScroll(y));
}
