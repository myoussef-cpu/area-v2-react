import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Calculator, History } from 'lucide-react';
import { cn } from '../../shared/lib/cn';

const NAV_ITEMS = [
  { path: '/', icon: LayoutGrid, label: 'الرئيسية', id: 'nav-main' },
  { path: '/calculator', icon: Calculator, label: 'الآلة', id: 'nav-calc' },
  { path: '/saved', icon: History, label: 'المحفوظات', id: 'nav-saved' },
];

const BOTTOM_NAV_PAGES = ['/', '/calculator', '/saved'];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  if (!BOTTOM_NAV_PAGES.includes(location.pathname)) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex h-14 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 items-center gap-1 rounded-2xl px-1.5',
        'bg-white/75 backdrop-blur-3xl border border-white/50 shadow-lg',
        'dark:bg-[rgba(28,28,30,0.7)] dark:border-white/5 dark:shadow-2xl'
      )}
      style={{ bottom: 'calc(16px + var(--safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-1 items-center justify-center gap-0 rounded-2xl py-2.5 text-[#8e8e93] dark:text-[#8e8e93]',
              'transition-all duration-300',
              active && 'gap-2 bg-primary/10 text-primary dark:bg-primary/15 dark:text-[#5ac8fa]'
            )}
          >
            <item.icon
              className={cn(
                'h-4.5 w-4.5 shrink-0 transition-transform duration-300',
                active && 'scale-110 -translate-y-0.5'
              )}
              strokeWidth={active ? 2.5 : 2}
            />
            <span
              className={cn(
                'max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-300',
                active && 'max-w-20 opacity-100'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
