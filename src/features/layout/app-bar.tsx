import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Settings, ChevronRight, Save, Menu } from 'lucide-react';
import { useAppStore } from '../../shared/store/app-store';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useResults } from '../../shared/hooks/use-results';
import { cn } from '../../shared/lib/cn';

interface AppBarProps {
  onToggleSidebar?: () => void;
  chatTitle?: string;
}

const BOTTOM_NAV_PAGES = ['/', '/calculator', '/saved'];

export function AppBar({ onToggleSidebar, chatTitle }: AppBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useAppStore();
  const { data: pendingData, clear } = usePendingSave();
  const { saveResult } = useResults();
  const hasBottomNav = BOTTOM_NAV_PAGES.includes(location.pathname);
  const isToolPage = location.pathname.startsWith('/tool/');
  const isSettingsPage = location.pathname === '/settings';
  const isChatPage = location.pathname === '/chat';

  const handleSave = () => {
    if (!pendingData) return;
    saveResult(pendingData);
    clear();
  };

  const handleBack = () => {
    if (isChatPage && hasBottomNav) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const showBackButton = !isChatPage ? location.pathname !== '/' : !hasBottomNav;
  const showLeftSlot = showBackButton || Boolean(onToggleSidebar);

  return (
    <header
      className={cn(
        'pointer-events-none fixed top-0 z-[60] flex items-start px-4',
        isChatPage ? 'left-0 right-0 md:right-[300px]' : 'inset-x-0'
      )}
      style={{
        paddingTop: 'calc(var(--safe-area-inset-top) + 0.5rem)',
      }}
    >
      {showLeftSlot && (
        <div className="pointer-events-auto flex items-center gap-2">
          {(onToggleSidebar || !showBackButton) && (
            <button
              onClick={onToggleSidebar}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                'bg-white/75 text-primary shadow-lg backdrop-blur-2xl',
                'dark:bg-[rgba(28,28,30,0.75)] dark:text-[#5ac8fa]',
                'hover:scale-105 active:scale-95',
                'motion-safe:transition-all motion-safe:duration-200',
                'motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)]',
                isChatPage && 'md:hidden'
              )}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {showBackButton && (
            <button
              onClick={handleBack}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                'bg-white/75 text-primary shadow-lg backdrop-blur-2xl',
                'dark:bg-[rgba(28,28,30,0.75)] dark:text-[#5ac8fa]',
                'hover:scale-105 active:scale-95',
                'motion-safe:transition-all motion-safe:duration-200',
                'motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)]',
                hasBottomNav && 'md:opacity-0 md:scale-[0.8] md:pointer-events-none'
              )}
              aria-label="رجوع"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
          {chatTitle && isChatPage && (
            <span className="hidden md:inline-flex items-center rounded-2xl px-3 h-10 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/75 shadow-lg backdrop-blur-2xl dark:bg-[rgba(28,28,30,0.75)]">
              {chatTitle}
            </span>
          )}
        </div>
      )}

      <div className="pointer-events-auto flex overflow-hidden rounded-2xl bg-white/75 shadow-lg backdrop-blur-2xl dark:bg-[rgba(28,28,30,0.75)] mr-auto motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)]">
        {isToolPage && pendingData && (
          <button
            onClick={handleSave}
            className="flex h-10 w-10 items-center justify-center text-primary transition-all duration-200 hover:bg-black/5 active:scale-90 dark:text-[#5ac8fa] dark:hover:bg-white/10"
            title="حفظ"
          >
            <Save className="h-5 w-5" />
          </button>
        )}
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
          className={cn(
            'flex h-10 items-center justify-center text-primary hover:bg-black/5 active:bg-black/10 dark:text-[#5ac8fa] dark:hover:bg-white/10',
            'motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.25,1,0.5,1)]',
            'overflow-hidden',
            isSettingsPage
              ? 'w-0 scale-75 opacity-0 px-0'
              : 'w-10 scale-100 opacity-100 pointer-events-auto'
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
        </button>
      </div>
    </header>
  );
}
