/**
 * Server-side loader for admin blog posts list
 */

import { prisma } from '$lib/server/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  // Check if user is authenticated
  if (!locals.user) {
    return {
      posts: []
    };
  }
  
  try {
    // Fetch all blog posts
    const posts = await prisma.blogPost.findMany({
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        featured: true
      }
    });
    
    return {
      posts: posts.map(post => ({
        ...post,
        status: post.publishedAt ? 'published' : 'draft',
        // Convert dates to strings for serialization
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null
      }))
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      posts: []
    };
  }
}
