import { building } from '$app/environment';
import { generateSitemapAndRobots, collectRoutesFromMarkdown } from '$lib/utils/sitemap';
import { defaultMeta } from '$lib/utils/seo';
import { validateSession } from '$lib/server/auth';

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - Optional user name
 * @property {string} role - User role (admin, etc)
 */

// Import all blog posts and projects for sitemap generation
/** @type {Record<string, any>} */
const blogPosts = import.meta.glob('./routes/blog/*.md', { eager: true });
/** @type {Record<string, any>} */
const projects = import.meta.glob('./routes/portfolio/*.md', { eager: true });

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Generate sitemap and robots.txt during build
  if (building) {
    try {
      // Collect routes from markdown files
      const routes = collectRoutesFromMarkdown({
        blogPosts,
        projects
      });
      
      // Generate sitemap.xml and robots.txt
      await generateSitemapAndRobots({
        outputDir: './.svelte-kit/output/client',
        siteUrl: defaultMeta.url || 'https://ianwilson.info',
        routes
      });
    } catch (error) {
      console.error('Error generating sitemap and robots.txt:', error);
    }
  }
  
  // Check for session cookie and validate
  const sessionCookie = event.cookies.get('session');
  if (sessionCookie) {
    /** @type {User|null} */
    const user = await validateSession(sessionCookie);
    if (user) {
      // Set user in locals for use in routes
      event.locals.user = user;
    }
  }
  
  // Handle protected admin routes
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isLoginRoute = event.url.pathname === '/admin/login';
  
  if (isAdminRoute && !isLoginRoute && !event.locals.user) {
    // Redirect to login if trying to access admin routes without authentication
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login' }
    });
  }
  
  return await resolve(event);
}
