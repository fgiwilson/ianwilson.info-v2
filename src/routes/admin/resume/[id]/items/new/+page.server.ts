import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

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
    
    // Get form values
    const title = formData.get('title')?.toString() || '';
    const subtitle = formData.get('subtitle')?.toString() || null;
    const organization = formData.get('organization')?.toString() || null;
    const location = formData.get('location')?.toString() || null;
    
    // Get date strings from form
    const startDateStr = formData.get('startDate')?.toString() || '';
    const endDateStr = formData.get('endDate')?.toString() || '';
    
    // Convert date strings to Date objects for Prisma
    // If empty string, use null
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const current = formData.get('current') === 'on' || formData.get('current') === 'true';
    const endDate = endDateStr && !current ? new Date(endDateStr) : null;
    
    const description = formData.get('description')?.toString() || '';
    const orderStr = formData.get('order')?.toString() || '0';
    const order = parseInt(orderStr, 10);

    // Log form data for debugging
    console.log('Form data received:', {
      title,
      subtitle,
      organization,
      location,
      startDate,
      endDate,
      current,
      description,
      order
    });

    // Validate required fields
    if (!title) {
      return fail(400, {
        message: 'Title is required',
        values: { title, subtitle, organization, location, startDate, endDate, current, description, order }
      });
    }
    
    // Validate order is a valid number
    if (isNaN(order)) {
      return fail(400, {
        message: 'Order must be a valid number',
        values: { title, subtitle, organization, location, startDate, endDate, current, description, order: orderStr }
      });
    }

    try {
      // Log the values being saved for debugging
      console.log('Values being saved:', { 
        title, 
        subtitle, 
        organization, 
        location, 
        startDate: startDate ? startDate.toISOString() : null, 
        endDate: endDate ? endDate.toISOString() : null, 
        current, 
        description, 
        order,
        sectionId
      });
      
      // Create the resume item with explicit data object
      const resumeItem = await prisma.resumeItem.create({
        data: {
          title,
          subtitle: subtitle || null,
          location: location || null,
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

      // Log the created item
      console.log('Created resume item:', resumeItem);

      // Return success status
      return { success: true };
    } catch (err) {
      console.error('Error creating resume item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to create resume item: ${errorMessage}`
      };
    }
  }
};
