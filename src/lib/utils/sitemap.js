/**
 * Sitemap and robots.txt generator for SvelteKit
 * This utility generates a sitemap.xml and robots.txt file during build time
 * @typedef {import('fs')} fs
 * @typedef {import('path')} path
 * @typedef {import('url')} url
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultMeta } from './seo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} RouteObject
 * @property {string} path - The route path
 * @property {string} [lastmod] - Last modified date in ISO format
 * @property {string} [changefreq] - Change frequency (daily, weekly, monthly)
 * @property {string} [priority] - Priority (0.0 to 1.0)
 * @property {boolean} [noindex] - Whether to exclude from sitemap
 */

/**
 * Generate sitemap.xml and robots.txt files
 * @param {Object} options - Options for sitemap generation
 * @param {string} options.outputDir - Directory to write files to (usually 'build')
 * @param {string} options.siteUrl - Base URL of the site
 * @param {RouteObject[]} options.routes - Array of route objects with path and lastmod properties
 */
export async function generateSitemapAndRobots({ outputDir, siteUrl = defaultMeta.url || 'https://ianwilson.info', routes }) {
  if (!siteUrl) {
    console.error('Site URL is required for sitemap generation');
    return;
  }
  
  // Ensure trailing slash on site URL
  const baseUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  
  // Generate sitemap.xml
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add home page
  sitemap += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>\n`;
  
  // Add routes
  for (const route of routes) {
    // Skip routes with noindex
    if (route.noindex) continue;
    
    // Format the path (remove leading slash if present)
    const path = route.path.startsWith('/') ? route.path.substring(1) : route.path;
    
    sitemap += `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${route.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq || 'monthly'}</changefreq>
    <priority>${route.priority || '0.7'}</priority>
  </url>\n`;
  }
  
  sitemap += '</urlset>';
  
  // Generate robots.txt
  let robots = `# robots.txt for ${siteUrl}\n\n`;
  robots += 'User-agent: *\n';
  robots += 'Allow: /\n\n';
  robots += `Sitemap: ${baseUrl}sitemap.xml\n`;
  
  // Write files
  try {
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
    fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
    console.log('✅ Generated sitemap.xml and robots.txt');
  } catch (error) {
    console.error('Error writing sitemap and robots files:', error);
  }
}

/**
 * @typedef {Object} MarkdownModule
 * @property {any} default - The rendered component
 * @property {Object} metadata - The frontmatter metadata
 * @property {string} [metadata.title] - The title
 * @property {string} [metadata.date] - The publication date
 * @property {string} [metadata.updatedAt] - The last update date
 * @property {boolean} [metadata.noindex] - Whether to exclude from search engines
 */

/**
 * Collect routes from blog posts and portfolio projects
 * @param {Object} options - Options for route collection
 * @param {Record<string, MarkdownModule>} [options.blogPosts] - Object of blog post files from import.meta.glob
 * @param {Record<string, MarkdownModule>} [options.projects] - Object of project files from import.meta.glob
 * @returns {RouteObject[]} Array of route objects
 */
export function collectRoutesFromMarkdown({ blogPosts, projects }) {
  /** @type {RouteObject[]} */
  const routes = [];
  
  // Process blog posts
  if (blogPosts) {
    for (const [path, post] of Object.entries(blogPosts)) {
      // Extract slug from path (e.g., '../first-post.md' -> 'first-post')
      const slug = path.split('/').pop()?.replace('.md', '') || '';
      const metadata = post.metadata || {};
      
      routes.push({
        path: `blog/${slug}`,
        lastmod: (metadata.updatedAt || metadata.date || new Date().toISOString()).split('T')[0],
        changefreq: 'monthly',
        priority: '0.8',
        noindex: !!metadata.noindex
      });
    }
  }
  
  // Process portfolio projects
  if (projects) {
    for (const [path, project] of Object.entries(projects)) {
      // Extract slug from path
      const slug = path.split('/').pop()?.replace('.md', '') || '';
      const metadata = project.metadata || {};
      
      routes.push({
        path: `portfolio/${slug}`,
        lastmod: (metadata.updatedAt || metadata.date || new Date().toISOString()).split('T')[0],
        changefreq: 'monthly',
        priority: '0.8',
        noindex: !!metadata.noindex
      });
    }
  }
  
  // Add static routes
  routes.push(
    { path: 'blog', changefreq: 'weekly', priority: '0.9' },
    { path: 'portfolio', changefreq: 'weekly', priority: '0.9' },
    { path: 'contact', changefreq: 'monthly', priority: '0.7' },
    { path: 'about', changefreq: 'monthly', priority: '0.7' }
  );
  
  return routes;
}
