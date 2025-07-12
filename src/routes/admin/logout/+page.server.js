/**
 * Server-side handler for admin logout
 */

import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth';

// Create a minimal +page.svelte file for this route
/** @type {import('./$types').PageServerLoad} */
export function load() {
  // This page should never be rendered directly
  // It will always redirect to the form action
  return {};
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ cookies, locals }) => {
    // Get the session token from cookies
    const sessionToken = cookies.get('session');
    
    if (sessionToken) {
      console.log('Logging out user:', locals.user?.email);
      
      try {
        // Delete the session from the database
        await deleteSession(sessionToken);
        console.log('Session deleted successfully');
      } catch (error) {
        console.error('Error deleting session:', error);
      }
      
      // Clear the session cookie regardless of whether the session was deleted
      cookies.set('session', '', {
        path: '/',
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });
      
      console.log('Session cookie cleared');
    } else {
      console.log('No session cookie found during logout');
    }
    
    // Redirect to login page
    throw redirect(302, '/admin/login');
  }
};
