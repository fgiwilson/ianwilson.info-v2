import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated and has admin role
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  try {
    // Get all resume sections with their items, ordered by section order
    const sections = await prisma.resumeSection.findMany({
      include: {
        items: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return {
      sections
    };
  } catch (err) {
    console.error('Error loading resume sections:', err);
    throw error(500, 'Error loading resume sections');
  }
};
