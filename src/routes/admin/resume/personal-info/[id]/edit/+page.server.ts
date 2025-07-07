import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
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
  update: async ({ request, params, locals }: { request: Request, params: { id: string }, locals: App.Locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(401, 'Unauthorized');
    }

    const { id } = params;
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
      const updatedInfo = await prisma.resumePersonalInfo.update({
        where: { id },
        data: {
          label,
          value,
          order
        }
      });

      return {
        success: true,
        personalInfo: updatedInfo
      };
    } catch (err) {
      console.error('Error updating resume personal info:', err);
      return {
        success: false,
        message: 'Failed to update resume personal info'
      };
    }
  }
};
