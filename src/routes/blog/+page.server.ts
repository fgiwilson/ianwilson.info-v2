import { prisma } from '$lib/server/db.js';
import type { PageServerLoad } from './$types';
import { formatDate } from '$lib/utils/date';
import type { BlogPost, Tag, Media } from '@prisma/client';

export const load: PageServerLoad = async () => {
  // Fetch published blog posts from the database
  const posts = await prisma.blogPost.findMany({
    where: {
      publishedAt: {
        not: null // Only fetch published posts
      }
    },
    orderBy: {
      publishedAt: 'desc' // Most recent posts first
    },
    include: {
      tags: true,
      coverImage: true
    }
  });

  // Transform the database records to match the expected format in the frontend
  const formattedPosts = posts.map((post: BlogPost & { tags: Tag[]; coverImage: Media | null }) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.publishedAt ? formatDate(post.publishedAt) : '',
    description: post.excerpt || '',
    content: post.content,
    tags: post.tags.map(tag => tag.name),
    coverImage: post.coverImage ? `/uploads/${post.coverImage.filename}` : '/images/blog/default-cover.jpg',
    readingTime: Math.ceil(post.content.split(' ').length / 200) // Rough estimate: 200 words per minute
  }));

  return {
    posts: formattedPosts
  };
};
