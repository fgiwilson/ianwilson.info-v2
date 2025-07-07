import { error, redirect } from '@sveltejs/kit';
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
            title: true
          }
        }
      }
    });

    if (!skill) {
      throw error(404, 'Skill not found');
    }

    return {
      skill
    };
  } catch (err) {
    console.error('Error loading resume skill:', err);
    throw error(500, 'Failed to load resume skill');
  }
};

export const actions: Actions = {
  default: async ({ params, locals }) => {
    // Check if user is authenticated and has admin role
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const { id } = params;

    try {
      // Delete the resume skill
      await prisma.resumeSkill.delete({
        where: { id }
      });

      // Return success status
      return { success: true };
    } catch (err) {
      console.error('Error deleting resume skill:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to delete resume skill: ${errorMessage}`
      };
    }
  }
};
