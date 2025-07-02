import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated and has admin role
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/admin/login');
  }

  try {
    // Fetch all stats ordered by order field
    const stats = await prisma.resumeStat.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    return {
      stats
    };
  } catch (err) {
    console.error('Error loading resume stats:', err);
    throw error(500, 'Failed to load resume stats');
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(401, 'Unauthorized');
    }

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
      await prisma.resumeStat.create({
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
      console.error('Error creating resume stat:', err);
      return {
        success: false,
        message: 'Failed to create resume stat'
      };
    }
  }
};
