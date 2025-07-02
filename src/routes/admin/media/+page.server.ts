import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';

/**
 * Load media items for the admin media management page
 */
export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }

  try {
    // Get all media items, sorted by creation date (newest first)
    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      media
    };
  } catch (error) {
    console.error('Error loading media:', error);
    return {
      media: [],
      error: 'Failed to load media items'
    };
  }
};

/**
 * Actions for media management (delete)
 */
export const actions: Actions = {
  /**
   * Delete a media item by ID
   */
  delete: async ({ request, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
      return { success: false, message: 'Unauthorized' };
    }

    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return { success: false, message: 'Media ID is required' };
    }

    try {
      // Check if media exists
      const media = await prisma.media.findUnique({
        where: { id }
      });

      if (!media) {
        return { success: false, message: 'Media not found' };
      }

      // Delete media from database
      await prisma.media.delete({
        where: { id }
      });

      // Note: In a production app, you would also delete the physical file from storage
      // This would require additional file system operations

      return {
        success: true,
        message: 'Media deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting media:', error);
      return {
        success: false,
        message: 'Failed to delete media'
      };
    }
  }
};
