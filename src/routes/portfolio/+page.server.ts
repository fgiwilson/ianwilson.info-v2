import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Fetch projects from database
    const projects = await prisma.project.findMany({
      include: {
        categories: true,
        images: true,
        author: true
      },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    // Extract unique categories from projects
    const categories = await prisma.category.findMany({
      where: {
        projects: {
          some: {} // Categories that have at least one project
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return {
      projects,
      categories
    };
  } catch (error) {
    console.error('Error loading projects:', error);
    return {
      projects: [],
      categories: []
    };
  }
};
