/**
 * Layout JSON types — mirror the backend Page schema.
 * These are the runtime contracts between CMS data and the renderer.
 */

export interface LayoutSection {
  id: string;
  type: string; // Maps to ComponentRegistry key (e.g. 'hero', 'navbar')
  props: Record<string, unknown>;
  children?: LayoutSection[]; // Nested sections support
}

export interface PageLayout {
  sections: LayoutSection[];
}

// ─── CMS Data Models ─────────────────────────────────────────────────────────

export interface PortfolioMeta {
  theme?: string;
  primaryColor?: string;
  fontFamily?: string;
}

export interface Portfolio {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  meta: PortfolioMeta;
  pages: Page[] | string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  _id: string;
  portfolio: string;
  title: string;
  slug: string;
  order: number;
  isPublished: boolean;
  layout: PageLayout;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
