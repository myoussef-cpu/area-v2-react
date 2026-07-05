import { useLocation } from 'react-router-dom';
import { AppBar } from './app-bar';
import { BottomNav } from './bottom-nav';
import { MiniCalculator } from '../calculator/mini-calculator';
import { AnimatedOutlet } from './animated-outlet';
import { cn } from '@/shared/lib/cn';

const HAS_BOTTOM_NAV = ['/', '/calculator', '/saved'];
const FULLSCREEN_PAGES = ['/chat'];

export function PageShell() {
  const location = useLocation();
  const hasBottomNav = HAS_BOTTOM_NAV.includes(location.pathname);
  const isFullscreen = FULLSCREEN_PAGES.includes(location.pathname);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {!isFullscreen && <AppBar />}
      <main
        id="main-content"
        className={cn(
          'flex-1',
          !isFullscreen && 'overflow-y-auto px-4'
        )}
        style={{
          paddingTop: !isFullscreen ? 'calc(3.5rem + var(--safe-area-inset-top) + 0.5rem)' : undefined,
          paddingBottom: !isFullscreen
            ? hasBottomNav
              ? 'calc(80px + var(--safe-area-inset-bottom))'
              : 'calc(16px + var(--safe-area-inset-bottom))'
            : undefined,
        }}
      >
        <AnimatedOutlet />
      </main>
      {!isFullscreen && <BottomNav />}
      {!isFullscreen && <MiniCalculator />}
    </div>
  );
}
