/**
 * Server-side handler for editing blog posts
 */

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';

/** 
 * Load blog post data for editing
 * @type {import('./$types').PageServerLoad} 
 */
export async function load({ params, locals }) {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }
  
  try {
    // Get post by ID
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        coverImage: true,
        images: true
      }
    });
    
    if (!post) {
      throw redirect(302, '/admin/posts');
    }
    
    // Get all available tags
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Get all available media
    const mediaLibrary = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      post,
      tags,
      mediaLibrary
    };
  } catch (/** @type {any} */ error) {
    console.error('Error loading post:', error);
    throw redirect(302, '/admin/posts');
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle blog post edit form submission
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
    const excerpt = formData.get('excerpt');
    const featured = formData.get('featured') === 'on';
    const published = formData.get('published') === 'on';
    const tagsJson = formData.get('tags');
    const coverImageId = formData.get('coverImageId');
    const imageIdsJson = formData.get('imageIds');
    
    console.log('Updating blog post:', { title, slug, published });
    
    // Validate required fields
    if (!title || !slug || !content) {
      return fail(400, { 
        message: 'Title, slug, and content are required',
        data: { title, slug, content, excerpt, featured }
      });
    }
    
    try {
      // Parse tags
      let tags = [];
      if (tagsJson) {
        try {
          const tagIds = JSON.parse(tagsJson.toString());
          tags = tagIds.map((/** @type {string} */ id) => /** @type {{id: string}} */ ({ id }));
        } catch (/** @type {any} */ error) {
          console.error('Error parsing tags:', error);
        }
      }
      
      // Parse image IDs
      let imageIds = [];
      if (imageIdsJson) {
        try {
          const parsedImageIds = JSON.parse(imageIdsJson.toString());
          imageIds = parsedImageIds.map((/** @type {string} */ id) => /** @type {{id: string}} */ ({ id }));
        } catch (/** @type {any} */ error) {
          console.error('Error parsing image IDs:', error);
        }
      }
      
      // Get current post
      const currentPost = await prisma.blogPost.findUnique({
        where: { id: params.id },
        include: { 
          tags: true,
          images: true
        }
      });
      
      if (!currentPost) {
        return fail(404, { message: 'Post not found' });
      }
      
      // Update blog post
      const post = await prisma.blogPost.update({
        where: { id: params.id },
        data: {
          title: title ? title.toString() : '',
          slug: slug ? slug.toString() : '',
          content: content ? content.toString() : '',
          excerpt: excerpt ? excerpt.toString() : null,
          featured,
          publishedAt: published ? new Date() : null,
          updatedAt: new Date(),
          tags: {
            // Disconnect all existing tags
            disconnect: currentPost.tags.map((/** @type {{id: string}} */ tag) => ({ id: tag.id })),
            // Connect new tags
            ...(tags.length > 0 && { connect: tags })
          },
          // Handle cover image
          ...(coverImageId && {
            coverImage: {
              connect: { id: coverImageId.toString() }
            }
          }),
          // Handle images
          images: {
            // Disconnect all existing images
            disconnect: currentPost.images.map((/** @type {{id: string}} */ img) => ({ id: img.id })),
            // Connect new images
            ...(imageIds.length > 0 && { connect: imageIds })
          }
        }
      });
      
      // Redirect back to edit page with success message
      return {
        success: true,
        message: 'Post updated successfully'
      };
    } catch (/** @type {any} */ error) {
      console.error('Error updating blog post:', error);
      
      // Check for duplicate slug error
      if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
        return fail(400, { 
          message: 'A post with this slug already exists',
          data: { title, slug, content, excerpt, featured }
        });
      }
      
      return fail(500, { 
        message: 'Failed to update blog post',
        data: { title, slug, content, excerpt, featured }
      });
    }
  }
};
