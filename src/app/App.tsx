import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { router } from './router';
import { Providers } from './providers';

export default function App() {
  return (
    <Providers>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#f2f2f7] dark:bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#007aff] border-t-transparent" />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </Providers>
  );
}
