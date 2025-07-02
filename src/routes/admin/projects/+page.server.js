/**
 * Server-side loader for admin projects list
 */

import { prisma } from '$lib/server/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  // Check if user is authenticated
  if (!locals.user) {
    return {
      projects: []
    };
  }
  
  try {
    // Fetch all projects
    const projects = await prisma.project.findMany({
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        featured: true,
        order: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            path: true,
            alt: true
          },
          take: 1 // Take only the first image to use as cover
        }
      }
    });
    
    return {
      projects: projects.map(project => ({
        ...project,
        // Convert dates to strings for serialization
        createdAt: project.createdAt ? project.createdAt.toISOString() : null,
        // Extract cover image if available
        coverImage: project.images && project.images.length > 0 ? {
          ...project.images[0],
          url: project.images[0].path // Map path to url for consistency
        } : null,
        // Remove images array to avoid duplication
        images: undefined
      }))
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      projects: []
    };
  }
}
