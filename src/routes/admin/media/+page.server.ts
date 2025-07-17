import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';

/**
 * Load media items for the admin media management page with pagination and filtering
 */
export const load: PageServerLoad = async ({ locals, url }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }

  try {
    // Get pagination parameters from URL
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || 'all';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' as const } },
        { alt: { contains: search, mode: 'insensitive' as const } }
      ];
    }
    
    // Add type filter if provided
    if (type === 'image') {
      where.mimetype = { startsWith: 'image/' };
    } else if (type === 'document') {
      where.NOT = { mimetype: { startsWith: 'image/' } };
    }
    
    // Get total count for pagination
    const totalItems = await prisma.media.count({ where });
    
    // Get paginated media items
    const media = await prisma.media.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      media,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        type
      }
    };
  } catch (error) {
    console.error('Error loading media:', error);
    return {
      media: [],
      pagination: {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      },
      filters: {
        search: '',
        type: 'all'
      },
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
