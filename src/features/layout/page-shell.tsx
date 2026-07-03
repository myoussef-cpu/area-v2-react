import { useLocation } from 'react-router-dom';
import { AppBar } from './app-bar';
import { BottomNav } from './bottom-nav';
import { MiniCalculator } from '../calculator/mini-calculator';
import { AnimatedOutlet } from './animated-outlet';

const HAS_BOTTOM_NAV = ['/', '/calculator', '/saved'];

export function PageShell() {
  const location = useLocation();
  const hasBottomNav = HAS_BOTTOM_NAV.includes(location.pathname);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <AppBar />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto px-4 scrollbar-none"
        style={{
          paddingTop: 'calc(3.5rem + var(--safe-area-inset-top) + 0.5rem)',
          paddingBottom: hasBottomNav ? 'calc(80px + var(--safe-area-inset-bottom))' : 'calc(16px + var(--safe-area-inset-bottom))',
        }}
      >
        <AnimatedOutlet />
      </main>
      <BottomNav />
      <MiniCalculator />
    </div>
  );
}
