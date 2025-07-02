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
        items: {
          orderBy: {
            order: 'asc'
          }
        }
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
  default: async ({ params, request, locals }) => {
    // Check if user is authenticated and has admin role
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id } = params;
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const type = formData.get('type')?.toString();
    const content = formData.get('content')?.toString() || '';
    const orderStr = formData.get('order')?.toString();
    
    // Validate required fields
    if (!title || !type) {
      return fail(400, {
        message: 'Title and type are required',
        values: { title, type, content, order: orderStr }
      });
    }

    // Parse order as number
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    if (isNaN(order)) {
      return fail(400, {
        message: 'Order must be a valid number',
        values: { title, type, content, order: orderStr }
      });
    }

    try {
      try {
        // Update the resume section
        await prisma.resumeSection.update({
          where: { id },
          data: {
            title,
            type,
            content,
            order
          }
        });

        // If update is successful, return success
        return { success: true };
      } catch (dbError) {
        // Handle database errors
        console.error('Database error updating resume section:', dbError);
        return fail(500, {
          message: 'Failed to update resume section',
          values: { title, type, content, order }
        });
      }
    } catch (err) {
      // This catch block should never be reached with the nested try/catch above
      console.error('Unexpected error in resume section update:', err);
      return fail(500, {
        message: 'An unexpected error occurred',
        values: { title, type, content, order }
      });
    }
  }
};
