/**
 * Server-side handler for editing projects
 */

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';

/** 
 * Load project data for editing
 * @type {import('./$types').PageServerLoad} 
 */
export async function load({ params, locals }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }
  
  try {
    // Get project by ID
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        categories: true,
        images: true
      }
    });
    
    if (!project) {
      throw redirect(302, '/admin/projects');
    }
    
    // Get all available categories
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Get media library
    const mediaLibrary = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      project,
      categories,
      mediaLibrary
    };
  } catch (/** @type {any} */ error) {
    console.error('Error loading project:', error);
    throw redirect(302, '/admin/projects');
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle project edit form submission
   * @type {import('./$types').Action}
   */
  default: async ({ request, params, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }
    
    // Get form data
    const formData = await request.formData();
    const title = formData.get('title');
    const slug = formData.get('slug');
    const content = formData.get('content');
    const description = formData.get('description');
    const client = formData.get('client');
    const completionDate = formData.get('completionDate');
    const technologies = formData.get('technologies');
    const websiteUrl = formData.get('websiteUrl');
    const githubUrl = formData.get('githubUrl');
    const featured = formData.get('featured') === 'on';
    const orderValue = formData.get('order');
    const order = orderValue ? parseInt(orderValue.toString(), 10) : 0;
    const categoriesJson = formData.get('categories');
    const mediaIdsJson = formData.get('mediaIds');
    
    // Validate required fields
    if (!title || !slug || !content || !description) {
      return fail(400, { 
        message: 'Title, slug, description, and content are required',
        data: { title, slug, content, description, featured, order }
      });
    }
    
    try {
      // Parse categories
      let categoryIds = [];
      if (categoriesJson) {
        try {
          categoryIds = JSON.parse(categoriesJson.toString());
        } catch (/** @type {any} */ error) {
          console.error('Error parsing categories:', error);
        }
      }
      
      // Parse media IDs
      let mediaIds = [];
      if (mediaIdsJson) {
        try {
          mediaIds = JSON.parse(mediaIdsJson.toString());
        } catch (/** @type {any} */ error) {
          console.error('Error parsing media IDs:', error);
        }
      }
      
      // Get current project
      const currentProject = await prisma.project.findUnique({
        where: { id: params.id },
        include: { 
          categories: true,
          images: true
        }
      });
      
      if (!currentProject) {
        throw redirect(302, '/admin/projects');
      }
      
      try {
        // Update project
        const project = await prisma.project.update({
          where: { id: params.id },
          data: {
            title: title.toString(),
            slug: slug.toString(),
            content: content.toString(),
            description: description.toString(),
            client: client ? client.toString() : null,
            completionDate: completionDate ? new Date(completionDate.toString()) : null,
            technologies: technologies ? technologies.toString() : null,
            websiteUrl: websiteUrl ? websiteUrl.toString() : null,
            githubUrl: githubUrl ? githubUrl.toString() : null,
            featured,
            order,
            categories: {
              // Disconnect all existing categories
              disconnect: currentProject.categories.map((/** @type {{id: string}} */ cat) => ({ id: cat.id })),
              // Connect new categories
              ...(categoryIds.length > 0 && { connect: categoryIds.map((/** @type {string} */ id) => ({ id })) })
            },
            // Handle images
            images: {
              // Disconnect all existing images
              disconnect: currentProject.images.map((/** @type {{id: string}} */ img) => ({ id: img.id })),
              // Connect new images
              ...(mediaIds.length > 0 && { connect: mediaIds.map((/** @type {string} */ id) => ({ id })) })
            }
          }
        });
        
        // Return success
        return {
          success: true,
          message: 'Project updated successfully'
        };
      } catch (/** @type {any} */ dbError) {
        // Handle database errors
        console.error('Database error updating project:', dbError);
        throw dbError; // Let the outer catch block handle it
      }
    } catch (/** @type {any} */ error) {
      console.error('Error updating project:', error);
      
      // Check for duplicate slug error
      if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
        return fail(400, { 
          message: 'A project with this slug already exists',
          data: { title, slug, content, description, featured, order }
        });
      }
      
      return fail(500, { 
        message: 'Failed to update project',
        data: { title, slug, content, description, featured, order }
      });
    }
  }
};
