import { error, redirect } from '@sveltejs/kit';
import type {Actions, PageServerLoad} from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }: { params: { id: string }, locals: App.Locals }) => {
  // Check if user is authenticated and has admin role
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/admin/login');
  }

  const { id } = params;

  try {
    // Fetch the personal info item by ID
    const personalInfo = await prisma.resumePersonalInfo.findUnique({
      where: { id }
    });

    if (!personalInfo) {
      throw error(404, 'Personal info item not found');
    }

    return {
      personalInfo
    };
  } catch (err) {
    console.error('Error loading resume personal info item:', err);
    throw error(500, 'Failed to load resume personal info item');
  }
};

export const actions = {
  delete: async ({ params, locals }: { params: { id: string }, locals: App.Locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(401, 'Unauthorized');
    }

    const { id } = params;

    try {
      await prisma.resumePersonalInfo.delete({
        where: { id }
      });

      // Redirect back to the personal info list
      throw redirect(303, '/admin/resume/personal-info');
    } catch (err) {
      console.error('Error deleting resume personal info:', err);
      return {
        success: false,
        message: 'Failed to delete resume personal info'
      };
    }
  }
};
