/**
 * Server-side handler for creating new projects
 */

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle new project form submission
   * @type {import('./$types').Action}
   */
  default: async ({ request, locals }) => {
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
      let categories = [];
      if (categoriesJson) {
        try {
          const categoryIds = JSON.parse(categoriesJson.toString());
          categories = categoryIds.map((/** @type {string} */ id) => /** @type {{id: string}} */ ({ id }));
        } catch (/** @type {any} */ error) {
          console.error('Error parsing categories:', error);
        }
      }
      
      // Parse media IDs
      let mediaIds = [];
      if (mediaIdsJson) {
        try {
          const parsedMediaIds = JSON.parse(mediaIdsJson.toString());
          // Store as simple array of strings
          mediaIds = parsedMediaIds.map((/** @type {string} */ id) => id);
        } catch (/** @type {any} */ error) {
          console.error('Error parsing media IDs:', error);
        }
      }
      
      try {
        // Create project
        const project = await prisma.project.create({
          data: {
            title: title.toString(),
            slug: slug.toString(),
            content: content.toString(),
            description: description.toString(),
            featured,
            order,
            author: {
              connect: { id: locals.user.id }
            },
            ...(categories.length > 0 && {
              categories: {
                connect: categories.map((/** @type {string} */ id) => ({ id }))
              }
            }),
            ...(mediaIds.length > 0 && {
              images: {
                connect: mediaIds.map((/** @type {string} */ id) => ({ id }))
              }
            })
          }
        });
        
        // Return success with project ID
        return { 
          success: true,
          projectId: project.id
        };
      } catch (/** @type {any} */ dbError) {
        // Handle database errors
        console.error('Database error creating project:', dbError);
        throw dbError; // Let the outer catch block handle it
      }
    } catch (/** @type {any} */ error) {
      console.error('Error creating project:', error);
      
      // Check for duplicate slug error
      if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
        return fail(400, { 
          message: 'A project with this slug already exists',
          data: { title, slug, content, description, featured, order }
        });
      }
      
      return fail(500, { 
        message: 'Failed to create project',
        data: { title, slug, content, description, featured, order }
      });
    }
  }
};
