import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Settings, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../shared/store/app-store';
import { cn } from '../../shared/lib/cn';

const BOTTOM_NAV_PAGES = ['/', '/calculator', '/saved'];

export function AppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useAppStore();
  const hasBottomNav = BOTTOM_NAV_PAGES.includes(location.pathname);

  return (
    <header
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] flex items-start px-4"
      style={{
        paddingTop: 'calc(var(--safe-area-inset-top) + 0.5rem)',
      }}
    >
      <div className="flex flex-1 items-start gap-2">
        <button
          onClick={() => navigate(-1)}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
            'bg-white/75 text-primary shadow-lg backdrop-blur-2xl',
            'dark:bg-[rgba(28,28,30,0.75)] dark:text-[#5ac8fa]',
            'hover:scale-105 active:scale-95',
            'motion-safe:transition-all motion-safe:duration-200',
            'motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)]',
            hasBottomNav
              ? 'opacity-0 scale-[0.8] pointer-events-none'
              : 'opacity-100 scale-100 pointer-events-auto'
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="pointer-events-auto flex overflow-hidden rounded-2xl bg-white/75 shadow-lg backdrop-blur-2xl dark:bg-[rgba(28,28,30,0.75)]">
        <button
          onClick={toggleDarkMode}
          className="flex h-10 w-10 items-center justify-center text-primary transition-all duration-200 hover:bg-black/5 active:scale-90 dark:text-[#5ac8fa] dark:hover:bg-white/10"
        >
          <span key={darkMode ? 'sun' : 'moon'} className="motion-safe:animate-icon-swap flex">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-black/5 active:bg-black/10 dark:text-[#5ac8fa] dark:hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
