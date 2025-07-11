import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';
import bcrypt from 'bcrypt';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, '/admin/login');
  }

  // Return user data (excluding password)
  return {
    user: {
      id: locals.user.id,
      email: locals.user.email,
      name: locals.user.name
    }
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
      throw redirect(302, '/admin/login');
    }

    const formData = await request.formData();
    
    const currentPassword = formData.get('currentPassword')?.toString();
    const newPassword = formData.get('newPassword')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();
    const email = formData.get('email')?.toString();
    const name = formData.get('name')?.toString();
    
    // Validate required fields
    if (!currentPassword || !email) {
      return fail(400, { 
        error: 'Current password and email are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, { 
        error: 'Please enter a valid email address'
      });
    }
    
    try {
      // Get the current user from the database
      const user = await prisma.user.findUnique({
        where: { id: locals.user.id }
      });
      
      if (!user || !user.password) {
        return fail(400, { error: 'User not found' });
      }
      
      // Verify current password
      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValid) {
        return fail(400, { error: 'Current password is incorrect' });
      }
      
      // Check if new password is provided and matches confirmation
      if (newPassword && newPassword !== confirmPassword) {
        return fail(400, { error: 'New password and confirmation do not match' });
      }
      
      // For a single-user system, check if there are any unexpected additional users
      if (email !== user.email) {
        // Count total users in the system - should be 1
        const userCount = await prisma.user.count();
        console.log(`Total users in system: ${userCount}`);
        
        if (userCount > 1) {
          // If multiple users exist, check if email is already taken
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });
          
          if (existingUser && existingUser.id !== locals.user.id) {
            console.log(`Email conflict detected: ${email} is already used by user ID ${existingUser.id}`);
            return fail(400, { error: 'Email address is already in use by another account' });
          }
        }
      }
      
      // Prepare update data
      const updateData: any = {
        email,
        name: name || null
      };
      
      // If new password is provided, hash it
      if (newPassword && newPassword.length >= 8) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(newPassword, saltRounds);
      }
      
      // Update user in database
      await prisma.user.update({
        where: { id: locals.user.id },
        data: updateData
      });
      
      // Return success
      return { success: true };
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      return fail(500, { 
        error: 'There was an error updating your profile. Please try again later.'
      });
    }
  }
};
