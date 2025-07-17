/**
 * API endpoint for fetching media items
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';

/**
 * GET handler to retrieve media items with pagination and filtering
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  // Check if user is authenticated
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const search = url.searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where = search ? {
      OR: [
        { filename: { contains: search, mode: 'insensitive' as const } },
        { alt: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};
    
    // Fetch media items with pagination and filtering
    const [mediaItems, totalCount] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.media.count({ where })
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return json({
      success: true,
      media: mediaItems,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching media items:', error);
    return json({ error: 'Failed to fetch media items' }, { status: 500 });
  }
};
