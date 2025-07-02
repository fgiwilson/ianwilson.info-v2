/**
 * Server-side handler for deleting projects
 */

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';

/** 
 * Load project data for delete confirmation
 * @type {import('./$types').PageServerLoad} 
 */
export async function load({ params, locals }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }
  
  try {
    // Get project by ID
    const project = await prisma.project.findUnique({
      where: { id: params.id }
    });
    
    if (!project) {
      throw redirect(302, '/admin/projects');
    }
    
    return {
      project
    };
  } catch (/** @type {any} */ error) {
    console.error('Error loading project:', error);
    throw redirect(302, '/admin/projects');
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle project deletion
   * @type {import('./$types').Action}
   */
  default: async ({ params, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }
    
    try {
      try {
        // Delete the project
        await prisma.project.delete({
          where: { id: params.id }
        });

        // Return success status
        return { success: true };
      } catch (/** @type {any} */ dbError) {
        // Handle database errors
        console.error('Database error deleting project:', dbError);
        return fail(500, { message: 'Failed to delete project' });
      }
    } catch (/** @type {any} */ error) {
      // This catch block should never be reached with the nested try/catch above
      console.error('Unexpected error in project delete:', error);
      return fail(500, { message: 'An unexpected error occurred' });
    }
  }
};
