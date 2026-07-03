import { useAppStore } from '../store/app-store';

export function useDarkMode() {
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  return { isDark: darkMode, toggle: toggleDarkMode };
}
