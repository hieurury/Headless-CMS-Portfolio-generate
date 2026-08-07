import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProfilePage } from '../pages/dashboard/ProfilePage';
import { PortfolioDetailPage } from '../pages/dashboard/PortfolioDetailPage';
import { CreatePostPage } from '../pages/dashboard/CreatePostPage';
import { EditPostPage } from '../pages/dashboard/EditPostPage';
import { MediaGalleryPage } from '../pages/dashboard/MediaGalleryPage';
import { PortfolioPreviewPage } from '../pages/renderer/PortfolioPreviewPage';
import { PostPreviewPage } from '../pages/renderer/PostPreviewPage';
import { PageEditorPage } from '../pages/editor/PageEditorPage';
import { PublicPortfolioPage } from '../pages/public/PublicPortfolioPage';
import { PublicPortfolioHubPage } from '../pages/public/PublicPortfolioHubPage';
import { PublicPostPage } from '../pages/public/PublicPostPage';
import { ExplorePage } from '../pages/explore/ExplorePage';
import { HomePage } from '../pages/home/HomePage';

// ─── Route Guards ──────────────────────────────────────────────────────────

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  // Allow accessing /register if user is in the registration flow completing Step 3
  if (isAuthenticated && location.pathname !== '/register') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

// ─── Router ────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },

  // ── Auth (redirect if logged in) ─────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // ── Public routes (no auth required) ────────────────────────────
  {
    path: '/explore',
    element: <ExplorePage />,
  },
  {
    path: '/p/:portfolioSlug',
    element: <PublicPortfolioHubPage />,
  },
  {
    path: '/p/:portfolioSlug/post/:postSlug',
    element: <PublicPostPage />,
  },
  {
    path: '/p/:portfolioSlug/:pageSlug',
    element: <PublicPortfolioPage />,
  },

  // ── Protected Dashboard + Editor ─────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/dashboard/profile', element: <ProfilePage /> },
      { path: '/profile', element: <Navigate to="/dashboard/profile" replace /> },
      {
        path: '/dashboard/portfolios/:portfolioId',
        element: <PortfolioDetailPage />,
      },
      {
        path: '/dashboard/portfolios/:portfolioId/pages/:pageId/edit',
        element: <PageEditorPage />,
      },
      {
        path: '/dashboard/portfolios/:portfolioId/posts/new',
        element: <CreatePostPage />,
      },
      {
        path: '/dashboard/portfolios/:portfolioId/posts/:postId/edit',
        element: <EditPostPage />,
      },
      { path: '/dashboard/media', element: <MediaGalleryPage /> },
      { path: '/preview/:portfolioId/:pageId', element: <PortfolioPreviewPage /> },
      { path: '/preview-post/:portfolioId/:postId', element: <PostPreviewPage /> },
    ],
  },

  // ── 404 ──────────────────────────────────────────────────────────
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-[#0a0a0f]">
        <div>
          <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
          <p className="text-slate-400 mb-6">Page not found</p>
          <a href="/dashboard" className="text-indigo-400 hover:underline">
            ← Go home
          </a>
        </div>
      </div>
    ),
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
