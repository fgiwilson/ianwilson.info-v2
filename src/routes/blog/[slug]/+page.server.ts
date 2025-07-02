import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { generateBlogJsonLd, defaultMeta } from '$lib/utils/seo';
import { prisma } from '$lib/server/db.js';

/**
 * Blog post metadata interface
 */
interface BlogPostMetadata {
  title: string;
  description?: string;
  excerpt?: string;
  date?: string;
  updatedAt?: string;
  coverImage?: string;
  tags?: string[];
  category?: string;
  author?: string;
}

/**
 * Markdown module interface
 */
interface MarkdownModule {
  default: any;
  metadata: BlogPostMetadata;
}

// Import all markdown files in the blog directory
// Using a more specific pattern to match only markdown files in the blog directory
const postFiles = import.meta.glob('../*.md', { eager: true }) as Record<string, MarkdownModule>;

// Log the available posts for debugging
console.log('Available markdown blog posts:', Object.keys(postFiles));

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;
  
  try {
    // First, check if this is a database-backed post
    const dbPost = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: true,
        tags: true,
        coverImage: true,
        images: true
      }
    });
    
    if (dbPost) {
      console.log(`Found database post with slug: ${slug}`);
      
      // Format tags for SEO
      const tagNames = dbPost.tags.map(tag => tag.name);
      
      // Get cover image URL if available
      const coverImageUrl = dbPost.coverImage ? dbPost.coverImage.path : null;
      
      // Prepare SEO data
      const title = dbPost.title;
      const description = dbPost.excerpt || `Read ${dbPost.title} on Ian Wilson's blog`;
      const image = coverImageUrl || defaultMeta.image;
      const publishDate = dbPost.publishedAt ? new Date(dbPost.publishedAt).toISOString() : undefined;
      
      // Generate JSON-LD structured data
      const jsonLd = generateBlogJsonLd({
        title: dbPost.title,
        description,
        date: dbPost.publishedAt ? new Date(dbPost.publishedAt).toISOString() : new Date().toISOString(),
        slug: dbPost.slug,
        coverImage: coverImageUrl || undefined,
        tags: tagNames,
        author: dbPost.author && dbPost.author.name ? {
          name: dbPost.author.name,
          url: defaultMeta.url
        } : undefined
      });
      
      return {
        post: dbPost,
        isMarkdown: false,
        // SEO data
        title,
        description,
        image,
        article: {
          publishedTime: publishDate,
          modifiedTime: dbPost.updatedAt ? new Date(dbPost.updatedAt).toISOString() : publishDate,
          tags: tagNames,
          section: 'Blog'
        },
        jsonLd
      };
    }
    
    // If not found in database, try to find a markdown file
    const postPath = `../${slug}.md`;
    console.log(`Looking for markdown post: ${postPath}`);
    
    // Check if the markdown post exists
    if (!postFiles[postPath]) {
      console.error(`Post not found in markdown or database: ${slug}`);
      throw error(404, `Could not find blog post: ${slug}`);
    }
    
    // Get the markdown post data
    const post = postFiles[postPath] as MarkdownModule;
    const metadata = post.metadata;
    
    // Prepare SEO data for markdown post
    const title = metadata.title;
    const description = metadata.description || metadata.excerpt || 
      `Read ${metadata.title} on Ian Wilson's blog`;
    const image = metadata.coverImage || defaultMeta.image;
    const publishDate = metadata.date ? new Date(metadata.date).toISOString() : undefined;
    
    // Generate JSON-LD structured data
    const jsonLd = generateBlogJsonLd({
      title: metadata.title,
      description,
      date: metadata.date || new Date().toISOString(),
      slug: slug,
      coverImage: metadata.coverImage,
      tags: metadata.tags || [],
      author: metadata.author ? {
        name: metadata.author,
        url: defaultMeta.url
      } : undefined
    });
    
    return {
      content: post.default,
      metadata,
      isMarkdown: true,
      // SEO data
      title,
      description,
      image,
      article: {
        publishedTime: publishDate,
        modifiedTime: metadata.updatedAt ? new Date(metadata.updatedAt).toISOString() : publishDate,
        tags: metadata.tags || [],
        section: metadata.category || 'Blog'
      },
      jsonLd
    };
  } catch (e) {
    console.error('Error loading blog post:', e);
    throw error(404, `Could not find blog post: ${slug}`);
  }
}
