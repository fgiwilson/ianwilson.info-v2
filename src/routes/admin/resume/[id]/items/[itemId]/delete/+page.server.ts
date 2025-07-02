import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ params, locals }: { params: { id: string; itemId: string }; locals: App.Locals }) => {
  // Check if user is authenticated and has admin role
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const { id: sectionId, itemId } = params;
  
  try {
    // Get the resume section by ID
    const section = await prisma.resumeSection.findUnique({
      where: { id: sectionId }
    });
    
    if (!section) {
      throw error(404, 'Resume section not found');
    }
    
    // Get the resume item by ID
    const item = await prisma.resumeItem.findUnique({
      where: { id: itemId }
    });
    
    if (!item || item.sectionId !== sectionId) {
      throw error(404, 'Resume item not found');
    }
    
    return { section, item };
  } catch (err) {
    console.error('Error loading resume item:', err);
    throw error(500, 'Error loading resume item');
  }
};

export const actions: Actions = {
  default: async ({ params, locals }: { params: { id: string; itemId: string }; locals: App.Locals }) => {
    // Check if user is authenticated and has admin role
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id: sectionId, itemId } = params;

    try {
      try {
        // Delete the resume item
        await prisma.resumeItem.delete({
          where: { id: itemId }
        });

        // Return success status
        return { success: true };
      } catch (dbError) {
        // Handle database errors
        console.error('Database error deleting resume item:', dbError);
        return fail(500, { message: 'Failed to delete resume item' });
      }
    } catch (err) {
      // This catch block should never be reached with the nested try/catch above
      console.error('Unexpected error in resume item delete:', err);
      return fail(500, { message: 'An unexpected error occurred' });
    }
  }
};
