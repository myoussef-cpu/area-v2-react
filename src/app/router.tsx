import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { PageShell } from '../features/layout/page-shell';

const HomePage = lazy(() => import('../pages/home-page'));
const ToolPage = lazy(() => import('../pages/tool-page'));
const AllToolsPage = lazy(() => import('../pages/all-tools-page'));
const CalculatorPage = lazy(() => import('../features/calculator/calculator-page'));
const SavedResultsPage = lazy(() => import('../features/saved-results/saved-results-page'));
const SettingsPage = lazy(() => import('../pages/settings-page'));
const LoginPage = lazy(() => import('../pages/login-page'));
const NotFoundPage = lazy(() => import('../pages/not-found-page'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tool/:id', element: <ToolPage /> },
      { path: 'tools', element: <AllToolsPage /> },
      { path: 'calculator', element: <CalculatorPage /> },
      { path: 'saved', element: <SavedResultsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
