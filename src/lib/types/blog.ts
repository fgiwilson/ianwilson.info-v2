/**
 * Types for blog posts and related data
 */

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage?: string;
  readingTime?: number;
  content?: string;
}

export interface BlogPostMetadata {
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage?: string;
  readingTime?: number;
}
