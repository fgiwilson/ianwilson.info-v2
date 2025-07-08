import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Check if user is authenticated and has admin role
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/admin/login');
  }

  const { id } = params;

  try {
    // Fetch the stat by ID
    const stat = await prisma.resumeStat.findUnique({
      where: { id }
    });

    if (!stat) {
      throw error(404, 'Resume stat not found');
    }

    return {
      stat
    };
  } catch (err) {
    console.error('Error loading resume stat:', err);
    throw error(500, 'Failed to load resume stat');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(401, 'Unauthorized');
    }

    const { id } = params;
    const formData = await request.formData();
    
    const value = formData.get('value') as string;
    const label = formData.get('label') as string;
    const orderStr = formData.get('order') as string;
    const order = orderStr ? parseInt(orderStr, 10) : 0;

    if (!value || !label) {
      return {
        success: false,
        message: 'Value and label are required'
      };
    }

    try {
      // Update the stat
      await prisma.resumeStat.update({
        where: { id },
        data: {
          value,
          label,
          order
        }
      });

      return {
        success: true
      };
    } catch (err) {
      console.error('Error updating resume stat:', err);
      return {
        success: false,
        message: 'Failed to update resume stat'
      };
    }
  }
};
