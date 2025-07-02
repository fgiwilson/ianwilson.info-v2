import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated and has admin role
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/admin/login');
  }

  try {
    // Fetch all personal info items ordered by their order field
    const personalInfo = await prisma.resumePersonalInfo.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    return {
      personalInfo
    };
  } catch (err) {
    console.error('Error loading resume personal info:', err);
    throw error(500, 'Failed to load resume personal info');
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const label = formData.get('label') as string;
    const value = formData.get('value') as string;
    const orderStr = formData.get('order') as string;
    const order = orderStr ? parseInt(orderStr, 10) : 0;

    if (!label || !value) {
      return {
        success: false,
        message: 'Label and value are required'
      };
    }

    try {
      await prisma.resumePersonalInfo.create({
        data: {
          label,
          value,
          order
        }
      });

      return {
        success: true
      };
    } catch (err) {
      console.error('Error creating resume personal info:', err);
      return {
        success: false,
        message: 'Failed to create resume personal info'
      };
    }
  }
};
