/**
 * Server-side handler for the admin login form
 */

import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, createSession } from '$lib/server/auth';
import cookie from 'cookie';

/** @type {import('./$types').Actions} */
export const actions = {
  /**
   * Handle login form submission
   * @type {import('./$types').Action}
   */
  default: async ({ request, cookies }) => {
    // Get form data
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validate form data
    if (!email || !password) {
      return fail(400, {
        message: 'Email and password are required'
      });
    }
    
    // Authenticate user
    const user = await authenticateUser(email.toString(), password.toString());
    
    if (!user) {
      return fail(401, {
        message: 'Invalid email or password'
      });
    }
    
    // Check if user has admin role
    if (user.role !== 'admin' && user.role !== 'editor') {
      return fail(403, {
        message: 'You do not have permission to access the admin area'
      });
    }
    
    // Create session
    const session = await createSession(user);
    
    // Set session cookie
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    // Redirect to admin dashboard
    throw redirect(302, '/admin');
  }
};
