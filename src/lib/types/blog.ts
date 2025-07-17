/**
 * Types for blog posts and related data
 */

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage?: {
    path?: string;
    url?: string;
    id?: string;
  } | string | null;
  readingTime?: number;
  content?: string;
  id?: string;
}

export interface BlogPostMetadata {
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage?: {
    path?: string;
    url?: string;
    id?: string;
  } | null;
  readingTime?: number;
}
