import { useCallback } from 'react';

const SKIP_PAGES = ['login', 'profile', 'settings'];

export function useSession() {
  const saveSession = useCallback((pageId: string) => {
    if (SKIP_PAGES.includes(pageId)) return;
    try {
      const container = document.getElementById('main-content');
      if (!container) return;
      const inputs = container.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select');
      const data: Record<string, string> = {};
      inputs.forEach((el) => {
        if (el.name) data[el.name] = el.value;
      });
      localStorage.setItem(`session:${pageId}`, JSON.stringify(data));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const restoreSession = useCallback((pageId: string) => {
    if (SKIP_PAGES.includes(pageId)) return;
    try {
      const raw = localStorage.getItem(`session:${pageId}`);
      if (!raw) return;
      const data: Record<string, string> = JSON.parse(raw);
      const container = document.getElementById('main-content');
      if (!container) return;
      Object.entries(data).forEach(([name, value]) => {
        const el = container.querySelector<HTMLInputElement | HTMLSelectElement>(
          `[name="${name}"]`
        );
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    } catch {
      // localStorage or parse error
    }
  }, []);

  const clearSession = useCallback((pageId: string) => {
    try {
      localStorage.removeItem(`session:${pageId}`);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return { saveSession, restoreSession, clearSession };
}
