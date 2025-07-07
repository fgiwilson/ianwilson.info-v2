import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Check if user is authenticated and has admin role
  if (!locals.user || locals.user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const { id } = params;

  try {
    // Fetch the skill by ID
    const skill = await prisma.resumeSkill.findUnique({
      where: { id },
      include: {
        section: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!skill) {
      throw error(404, 'Skill not found');
    }

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
      skill,
      sections
    };
  } catch (err) {
    console.error('Error loading resume skill:', err);
    throw error(500, 'Failed to load resume skill');
  }
};

export const actions: Actions = {
  default: async ({ params, request, locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id } = params;
    const formData = await request.formData();
    
    // Get form data
    const name = formData.get('name')?.toString() || '';
    const percentageStr = formData.get('percentage')?.toString() || '80';
    const percentage = parseInt(percentageStr, 10);
    const category = formData.get('category')?.toString() || 'General';
    const orderStr = formData.get('order')?.toString() || '0';
    const order = parseInt(orderStr, 10);
    const sectionId = formData.get('sectionId')?.toString() || '';
    
    // Validate required fields
    if (!name || !sectionId) {
      return {
        success: false,
        message: 'Name and section are required'
      };
    }

    try {
      // Log form data for debugging
      console.log('Form data received for update:', {
        name,
        percentage,
        category,
        order,
        sectionId
      });
      
      // Update the resume skill
      const updatedSkill = await prisma.resumeSkill.update({
        where: { id },
        data: {
          name,
          percentage,
          category,
          order,
          section: {
            connect: { id: sectionId }
          }
        }
      });

      // Log the updated skill
      console.log('Updated resume skill:', updatedSkill);

      // If update is successful
      return { success: true };
    } catch (err) {
      console.error('Error updating resume skill:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to update resume skill: ${errorMessage}`
      };
    }
  }
};
