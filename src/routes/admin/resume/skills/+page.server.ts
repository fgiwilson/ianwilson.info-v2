import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated and has admin role
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/admin/login');
  }

  try {
    // Fetch all skills ordered by category and order
    const skills = await prisma.resumeSkill.findMany({
      orderBy: [
        {
          category: 'asc'
        },
        {
          order: 'asc'
        }
      ],
      include: {
        section: {
          select: {
            title: true
          }
        }
      }
    });

    // Fetch all resume sections for the dropdown
    const sections = await prisma.resumeSection.findMany({
      orderBy: {
        title: 'asc'
      },
      select: {
        id: true,
        title: true
      }
    });

    return {
      skills,
      sections
    };
  } catch (err) {
    console.error('Error loading resume skills:', err);
    throw error(500, 'Failed to load resume skills');
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const percentageStr = formData.get('percentage') as string;
    const percentage = percentageStr ? parseInt(percentageStr, 10) : 80;
    const category = formData.get('category') as string;
    const orderStr = formData.get('order') as string;
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    const sectionId = formData.get('sectionId') as string;

    if (!name || !sectionId) {
      return {
        success: false,
        message: 'Name and section are required'
      };
    }

    try {
      await prisma.resumeSkill.create({
        data: {
          name,
          percentage,
          category,
          order,
          sectionId
        }
      });

      return {
        success: true
      };
    } catch (err) {
      console.error('Error creating resume skill:', err);
      return {
        success: false,
        message: 'Failed to create resume skill'
      };
    }
  }
};
