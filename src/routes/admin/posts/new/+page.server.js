/**
 * Server-side handler for creating new blog posts
 */

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db.js';
import { extractFirstImageUrl, findMediaItemByUrl } from '$lib/server/utils/markdown.js';

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle new blog post form submission
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
    const excerpt = formData.get('excerpt');
    const featured = formData.get('featured') === 'on';
    const tagsJson = formData.get('tags');
    const coverImageId = formData.get('coverImageId');
    const imageIdsJson = formData.get('imageIds');
    
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
      
      try {
        // Check if we need to extract a cover image from content
        let coverImageData = {};
        
        if (!coverImageId && content) {
          // Extract the first image URL from the content
          const firstImageUrl = extractFirstImageUrl(content.toString());
          
          if (firstImageUrl) {
            // Find the media item that matches this URL using our robust matching function
            const mediaItem = await findMediaItemByUrl(firstImageUrl);
            
            if (mediaItem) {
              coverImageData = {
                coverImage: {
                  connect: { id: mediaItem.id }
                }
              };
              console.log('Automatically set cover image from content:', mediaItem.id);
            }
          }
        } else if (coverImageId) {
          coverImageData = {
            coverImage: {
              connect: { id: coverImageId.toString() }
            }
          };
        }
        
        // Create blog post
        const post = await prisma.blogPost.create({
          data: {
            title: title ? title.toString() : '',
            slug: slug ? slug.toString() : '',
            content: content ? content.toString() : '',
            excerpt: excerpt ? excerpt.toString() : null,
            featured,
            author: {
              connect: { id: locals.user.id }
            },
            ...(tags.length > 0 && {
              tags: {
                connect: tags
              }
            }),
            ...coverImageData,
            ...(imageIds.length > 0 && {
              images: {
                connect: imageIds
              }
            })
          }
        });
        
        // Return success with post ID
        return { 
          success: true,
          postId: post.id
        };
      } catch (/** @type {any} */ dbError) {
        // Handle database errors
        console.error('Database error creating blog post:', dbError);
        throw dbError; // Let the outer catch block handle it
      }
    } catch (/** @type {any} */ error) {
      console.error('Error creating blog post:', error);
      
      // Check for duplicate slug error
      if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
        return fail(400, { 
          message: 'A post with this slug already exists',
          data: { title, slug, content, excerpt, featured }
        });
      }
      
      return fail(500, { 
        message: 'Failed to create blog post',
        data: { title, slug, content, excerpt, featured }
      });
    }
  }
};
