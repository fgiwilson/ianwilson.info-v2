import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ params, locals }: { params: { id: string }; locals: App.Locals }) => {
  // Check if user is authenticated and has admin role
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const { id } = params;
  
  try {
    // Get the resume section by ID
    const section = await prisma.resumeSection.findUnique({
      where: { id }
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
  default: async ({ params, request, locals }: { params: { id: string }; request: Request; locals: App.Locals }) => {
    // Check if user is authenticated and has admin role
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id: sectionId } = params;
    const formData = await request.formData();
    
    // Get form data
    const title = formData.get('title')?.toString();
    const subtitle = formData.get('subtitle')?.toString() || null;
    const organization = formData.get('organization')?.toString() || null;
    const location = formData.get('location')?.toString() || null;
    const startDate = formData.get('startDate')?.toString() || null;
    const endDate = formData.get('endDate')?.toString() || null;
    const current = formData.get('current') === 'on' || formData.get('current') === 'true';
    const description = formData.get('content')?.toString() || '';
    const orderStr = formData.get('order')?.toString();
    
    // Validate required fields
    if (!title) {
      return fail(400, {
        message: 'Title is required',
        values: { title, subtitle, organization, location, startDate, endDate, current, description, order: orderStr }
      });
    }

    // Parse order as number
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    if (isNaN(order)) {
      return fail(400, {
        message: 'Order must be a valid number',
        values: { title, subtitle, organization, location, startDate, endDate, current, description, order: orderStr }
      });
    }

    try {
      try {
        // Create the resume item
        await prisma.resumeItem.create({
          data: {
            title,
            subtitle,
            location,
            startDate,
            endDate: current ? null : endDate,
            current,
            description,
            order,
            section: {
              connect: { id: sectionId }
            }
          }
        });

        // Return success status
        return { success: true };
      } catch (dbError) {
        // Handle database errors
        console.error('Database error creating resume item:', dbError);
        return fail(500, {
          message: 'Failed to create resume item',
          values: { title, subtitle, location, startDate, endDate, current, description, order }
        });
      }
    } catch (err) {
      // This catch block should never be reached with the nested try/catch above
      console.error('Unexpected error in resume item creation:', err);
      return fail(500, {
        message: 'An unexpected error occurred',
        values: { title, subtitle, location, startDate, endDate, current, description, order }
      });
    }
  }
};
