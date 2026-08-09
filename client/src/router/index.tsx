import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  useParams,
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
import { NotFoundPage } from '../pages/error/NotFoundPage';

// ─── Static path segments that must NOT be caught by /:username ───────────────
// These are reserved paths that take priority over dynamic username routes.


// ─── Route Guards ──────────────────────────────────────────────────────────



const PublicRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (isAuthenticated && location.pathname !== '/register') {
    return <Navigate to={`/${user?.username}/dashboard`} replace />;
  }
  return <Outlet />;
};

const StrictDashboardGuard: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { username } = useParams();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (user?.username !== username) {
    return <Navigate to={`/${user?.username}/dashboard`} replace />;
  }
  
  return <Outlet />;
};

// ─── Router ────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // ── Home ─────────────────────────────────────────────────────────
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

  // ── Explore (no auth required) ───────────────────────────────────
  {
    path: '/explore',
    element: <ExplorePage />,
  },

  // ── Protected Dashboard + Editor ─────────────────────────────────
  {
    element: <StrictDashboardGuard />,
    children: [
      { path: '/:username/dashboard', element: <DashboardPage /> },
      {
        path: '/:username/dashboard/portfolios/:portfolioId',
        element: <PortfolioDetailPage />,
      },
      {
        path: '/:username/dashboard/portfolios/:portfolioId/pages/:pageId/edit',
        element: <PageEditorPage />,
      },
      {
        path: '/:username/dashboard/portfolios/:portfolioId/posts/new',
        element: <CreatePostPage />,
      },
      {
        path: '/:username/dashboard/portfolios/:portfolioId/posts/:postId/edit',
        element: <EditPostPage />,
      },
      { path: '/:username/dashboard/media', element: <MediaGalleryPage /> },
      { path: '/preview/:portfolioId/:pageId', element: <PortfolioPreviewPage /> },
      { path: '/preview-post/:portfolioId/:postId', element: <PostPreviewPage /> },
    ],
  },

  // ── Public user profile routes (:username/*) ──────────────────────
  // IMPORTANT: These MUST come AFTER all static routes above.
  // /:username is a catch-all dynamic segment; reserved paths above take priority
  // because they are defined first in this array and react-router matches
  // more specific (static) paths before dynamic ones at the same level.
  {
    path: '/:username/profile',
    element: <ProfilePage />,
  },
  {
    path: '/explore/:username/portfolio/:portfolioSlug',
    element: <PublicPortfolioHubPage />,
  },
  {
    path: '/explore/:username/portfolio/:portfolioSlug/post/:postSlug',
    element: <PublicPostPage />,
  },
  {
    path: '/explore/:username/portfolio/:portfolioSlug/:pageSlug',
    element: <PublicPortfolioPage />,
  },

  // ── 404 ──────────────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
