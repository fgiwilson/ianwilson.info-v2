/**
 * Server-side handler for deleting blog posts
 */

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';

/** 
 * Load blog post data for delete confirmation
 * @type {import('./$types').PageServerLoad} 
 */
export async function load({ params, locals }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }
  
  try {
    // Get post by ID
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id }
    });
    
    if (!post) {
      throw redirect(302, '/admin/posts');
    }
    
    return {
      post
    };
  } catch (/** @type {any} */ error) {
    console.error('Error loading post:', error);
    throw redirect(302, '/admin/posts');
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle blog post deletion
   * @type {import('./$types').Action}
   */
  default: async ({ params, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }
    
    try {
      try {
        // Delete the blog post
        await prisma.blogPost.delete({
          where: { id: params.id }
        });

        // Return success status
        return { success: true };
      } catch (/** @type {any} */ dbError) {
        // Handle database errors
        console.error('Database error deleting blog post:', dbError);
        return fail(500, { message: 'Failed to delete blog post' });
      }
    } catch (/** @type {any} */ error) {
      // This catch block should never be reached with the nested try/catch above
      console.error('Unexpected error in blog post delete:', error);
      return fail(500, { message: 'An unexpected error occurred' });
    }
  }
};
