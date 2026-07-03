import { useLocation, useOutlet } from 'react-router-dom';
import { Suspense } from 'react';

const TAB_PAGES = ['/', '/calculator', '/saved'];

function Spinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const isTab = TAB_PAGES.includes(location.pathname);

  return (
    <div
      key={location.key}
      className={isTab ? '' : 'motion-safe:animate-[page-in_300ms_cubic-bezier(0.25,1,0.5,1)]'}
    >
      <Suspense fallback={<Spinner />}>{outlet}</Suspense>
    </div>
  );
}
