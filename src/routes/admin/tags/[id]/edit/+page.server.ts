import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import slugify from 'slugify';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  
  try {
    const tag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!tag) {
      throw error(404, 'Tag not found');
    }
    
    return {
      tag
    };
  } catch (err) {
    console.error('Error loading tag:', err);
    throw error(500, 'Failed to load tag');
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const { id } = params;
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
      await prisma.tag.update({
        where: { id },
        data: {
          name,
          slug
        }
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error updating tag:', err);
      return { success: false, message: 'Failed to update tag' };
    }
  }
};
