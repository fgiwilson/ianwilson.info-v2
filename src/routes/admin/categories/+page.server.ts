import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import slugify from 'slugify';

export const load: PageServerLoad = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include project count
    const categoriesWithProjects = categories.map(category => ({
      ...category,
      projects: {
        length: category._count.projects
      }
    }));

    return {
      categories: categoriesWithProjects
    };
  } catch (err) {
    console.error('Error loading categories:', err);
    throw error(500, 'Failed to load categories');
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    let slug = formData.get('slug') as string;

    if (!name) {
      return { success: false, message: 'Category name is required' };
    }

    // Generate slug if not provided
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    }

    try {
      await prisma.category.create({
        data: {
          name,
          slug
        }
      });

      return { success: true };
    } catch (err) {
      console.error('Error creating category:', err);
      return { success: false, message: 'Failed to create category' };
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return { success: false, message: 'Category ID is required' };
    }

    try {
      // Check if category has associated projects
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              projects: true
            }
          }
        }
      });

      if (category?._count.projects && category._count.projects > 0) {
        return { 
          success: false, 
          message: `Cannot delete category with ${category._count.projects} associated projects. Remove the projects first.` 
        };
      }

      await prisma.category.delete({
        where: { id }
      });

      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, message: 'Failed to delete category' };
    }
  }
};
