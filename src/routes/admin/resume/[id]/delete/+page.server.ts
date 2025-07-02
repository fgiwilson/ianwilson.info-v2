import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Check if user is authenticated and has admin role
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const { id } = params;
  
  try {
    // Get the resume section by ID
    const section = await prisma.resumeSection.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!section) {
      throw error(404, 'Resume section not found');
    }
    
    return { section };
  } catch (err) {
    console.error('Error loading resume section:', err);
    throw error(500, 'Error loading resume section');
  }
};

export const actions: Actions = {
  default: async ({ params, locals }) => {
    // Check if user is authenticated and has admin role
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id } = params;

    try {
      try {
        // First delete all items in this section
        await prisma.resumeItem.deleteMany({
          where: {
            sectionId: id
          }
        });
        
        // Delete the resume section
        await prisma.resumeSection.delete({
          where: { id }
        });

        // Return success status
        return { success: true };
      } catch (dbError) {
        // Handle database errors
        console.error('Database error deleting resume section:', dbError);
        return fail(500, { message: 'Failed to delete resume section' });
      }
    } catch (err) {
      // This catch block should never be reached with the nested try/catch above
      console.error('Unexpected error in resume section delete:', err);
      return fail(500, { message: 'An unexpected error occurred' });
    }
  }
};
