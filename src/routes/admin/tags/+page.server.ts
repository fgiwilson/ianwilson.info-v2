import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import slugify from 'slugify';

export const load: PageServerLoad = async () => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            blogPosts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include post count
    const tagsWithPosts = tags.map(tag => ({
      ...tag,
      posts: {
        length: tag._count.blogPosts
      }
    }));

    return {
      tags: tagsWithPosts
    };
  } catch (err) {
    console.error('Error loading tags:', err);
    throw error(500, 'Failed to load tags');
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    let slug = formData.get('slug') as string;

    if (!name) {
      return { success: false, message: 'Tag name is required' };
    }

    // Generate slug if not provided
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    }

    try {
      await prisma.tag.create({
        data: {
          name,
          slug
        }
      });

      return { success: true };
    } catch (err) {
      console.error('Error creating tag:', err);
      return { success: false, message: 'Failed to create tag' };
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return { success: false, message: 'Tag ID is required' };
    }

    try {
      // Check if tag has associated posts
      const tag = await prisma.tag.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              blogPosts: true
            }
          }
        }
      });

      if (tag?._count.blogPosts && tag._count.blogPosts > 0) {
        // Instead of preventing deletion, we'll disconnect the tag from posts
        await prisma.tag.update({
          where: { id },
          data: {
            blogPosts: {
              set: [] // Disconnect all posts
            }
          }
        });
      }

      // Now delete the tag
      await prisma.tag.delete({
        where: { id }
      });

      return { success: true };
    } catch (err) {
      console.error('Error deleting tag:', err);
      return { success: false, message: 'Failed to delete tag' };
    }
  }
};
