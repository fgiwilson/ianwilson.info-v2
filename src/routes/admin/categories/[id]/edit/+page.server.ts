import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import slugify from 'slugify';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  
  try {
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      throw error(404, 'Category not found');
    }
    
    return {
      category
    };
  } catch (err) {
    console.error('Error loading category:', err);
    throw error(500, 'Failed to load category');
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const { id } = params;
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
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug
        }
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, message: 'Failed to update category' };
    }
  }
};
