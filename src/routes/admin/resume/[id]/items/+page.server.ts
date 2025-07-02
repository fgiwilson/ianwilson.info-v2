import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Check if user is authenticated and has admin role
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const { id } = params;
  
  try {
    // Get the resume section by ID
    const section = await prisma.resumeSection.findUnique({
      where: { id }
    });
    
    if (!section) {
      throw error(404, 'Resume section not found');
    }
    
    // Get all items for this section
    const items = await prisma.resumeItem.findMany({
      where: {
        sectionId: id
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    return { 
      section,
      items
    };
  } catch (err) {
    console.error('Error loading resume section items:', err);
    throw error(500, 'Error loading resume section items');
  }
};
