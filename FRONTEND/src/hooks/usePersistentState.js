import { useEffect, useState } from 'react';

/** `useState` that survives navigation and reloads through localStorage (falls back to memory if blocked). */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be blocked (private mode, quota); the in-memory value keeps working.
    }
  }, [key, value]);

  return [value, setValue];
}
