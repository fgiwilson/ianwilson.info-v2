// MSW v2 type definitions for test handlers
import type { HttpHandler } from 'msw';

// Define common types for test data
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  featured: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSection {
  id: string;
  title: string;
  order: number;
}

export interface ResumeItem {
  id: string;
  title: string;
  subtitle?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  order: number;
  sectionId: string;
}

export interface Media {
  id: string;
  filename: string;
  path: string;
  thumbnailPath?: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
