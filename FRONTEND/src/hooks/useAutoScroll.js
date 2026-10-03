import { useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Slowly scrolls an overflowing element down, pausing at the bottom before going back to the top.
 * It stays still while the user interacts with the element (hover, focus or manual scroll)
 * and is disabled for users who prefer reduced motion.
 * Speeds are in px/s, delays in ms.
 */
export function useAutoScroll(ref, {
  enabled = true,
  speed = 28,
  returnSpeed = 140,
  edgePause = 1600,
  resumeDelay = 1800,
} = {}) {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return undefined;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    let frame = 0;
    let lastTime = 0;
    let direction = 1;
    let position = element.scrollTop;
    let lastWritten = position;
    let pausedUntil = performance.now() + edgePause;
    let pointerInside = false;
    let focusInside = false;

    const pause = (duration) => {
      pausedUntil = performance.now() + duration;
    };

    const handlePointerEnter = () => { pointerInside = true; };
    const handlePointerLeave = () => { pointerInside = false; pause(resumeDelay); };
    const handleFocusIn = () => { focusInside = true; };
    const handleFocusOut = () => { focusInside = false; pause(resumeDelay); };
    const handleScroll = () => {
      // A scroll we did not write (scrollbar drag, wheel, touch momentum) is the user's.
      if (Math.abs(element.scrollTop - lastWritten) > 2) {
        position = element.scrollTop;
        pause(resumeDelay);
      }
    };

    const tick = (time) => {
      frame = requestAnimationFrame(tick);
      const elapsed = Math.min(time - lastTime, 64);
      lastTime = time;

      const maxScroll = element.scrollHeight - element.clientHeight;
      if (maxScroll <= 1 || pointerInside || focusInside || document.hidden || time < pausedUntil) {
        position = element.scrollTop;
        return;
      }

      position += (direction * (direction > 0 ? speed : returnSpeed) * elapsed) / 1000;
      if (position >= maxScroll) {
        position = maxScroll;
        direction = -1;
        pausedUntil = time + edgePause;
      } else if (position <= 0) {
        position = 0;
        direction = 1;
        pausedUntil = time + edgePause;
      }
      element.scrollTop = position;
      lastWritten = element.scrollTop;
    };

    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointerleave', handlePointerLeave);
    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);
    element.addEventListener('scroll', handleScroll, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointerleave', handlePointerLeave);
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
      element.removeEventListener('scroll', handleScroll);
    };
  }, [ref, enabled, speed, returnSpeed, edgePause, resumeDelay]);
}
