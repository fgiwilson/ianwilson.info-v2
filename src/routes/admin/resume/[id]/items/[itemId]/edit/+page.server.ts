import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

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
  default: async ({ params, request, locals }: { params: { id: string; itemId: string }; request: Request; locals: App.Locals }) => {
    // Check if user is authenticated and has admin role
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id, itemId } = params;
    const formData = await request.formData();
    
    // Get form data
    const title = formData.get('title')?.toString() || '';
    const subtitle = formData.get('subtitle')?.toString() || null;
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
    
    // Validate required fields
    if (!title) {
      return fail(400, {
        message: 'Title is required',
        values: { title, subtitle, location, startDate, endDate, current, description, order: orderStr }
      });
    }

    // Parse order as number
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    if (isNaN(order)) {
      return fail(400, {
        message: 'Order must be a valid number',
        values: { title, subtitle, location, startDate, endDate, current, description, order: orderStr }
      });
    }

    try {
      // Log the date values for debugging
      console.log('Date values being updated:', { 
        startDate, 
        endDate, 
        current,
        startDateType: startDate ? typeof startDate : 'null',
        endDateType: endDate ? typeof endDate : 'null'
      });
      
      // Log form data for debugging
      console.log('Form data received for update:', {
        title,
        subtitle,
        location,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        current,
        description,
        order
      });
      
      // Update the resume item
      const updatedItem = await prisma.resumeItem.update({
        where: { id: itemId },
        data: {
          title,
          subtitle,
          location,
          startDate,
          endDate: current ? null : endDate,
          current,
          description,
          order
        }
      });

      // Log the updated item
      console.log('Updated resume item:', updatedItem);

      // If update is successful
      return { success: true };
    } catch (err) {
      console.error('Error updating resume item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to update resume item: ${errorMessage}`
      };
    }
  }
};
