/**
 * API endpoint for fetching media items
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';

/**
 * GET handler to retrieve all media items
 */
export const GET: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all media items from the database, ordered by most recent first
    const mediaItems = await prisma.media.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return json({
      success: true,
      media: mediaItems
    });
  } catch (error) {
    console.error('Error fetching media items:', error);
    return json({ error: 'Failed to fetch media items' }, { status: 500 });
  }
};
