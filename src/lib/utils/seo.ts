/**
 * SEO utility for generating meta tags
 * 
 * This utility provides functions for generating SEO meta tags for pages,
 * including Open Graph and Twitter Card tags.
 */

export interface SeoProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
    section?: string;
  };
  noindex?: boolean;
  nofollow?: boolean;
}

// Default site metadata - update these values with your site info
export const defaultMeta: SeoProps = {
  title: 'Ian Wilson | Web Developer & Designer',
  description: 'Professional portfolio and blog of Ian Wilson, a web developer specializing in SvelteKit, React, and modern web technologies.',
  url: 'https://ianwilson.info',
  image: '/images/site-preview.jpg', // Default social sharing image
};

/**
 * Generate SEO meta tags for a page
 * @param meta Custom metadata for the page
 * @returns Object with title and meta tags arrays
 */
export function generateSeoTags(meta: SeoProps = {}) {
  const seo = { ...defaultMeta, ...meta };
  const defaultTitle = defaultMeta.title || 'Ian Wilson | Web Developer';
  const fullTitle = seo.title && seo.title !== defaultTitle 
    ? `${seo.title} | ${defaultTitle.split('|')[0].trim()}` 
    : seo.title || defaultTitle;
  
  // Basic meta tags
  const tags = [
    { name: 'description', content: seo.description },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    
    // Open Graph tags
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: seo.description },
    { property: 'og:url', content: seo.url },
    { property: 'og:type', content: seo.article ? 'article' : 'website' },
    
    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: seo.description },
  ];

  // Add image if provided
  if (seo.image) {
    tags.push(
      { property: 'og:image', content: seo.image.startsWith('http') ? seo.image : `${seo.url}${seo.image}` },
      { name: 'twitter:image', content: seo.image.startsWith('http') ? seo.image : `${seo.url}${seo.image}` }
    );
  }

  // Add article specific tags if provided
  if (seo.article) {
    if (seo.article.publishedTime) {
      tags.push({ property: 'article:published_time', content: seo.article.publishedTime });
    }
    if (seo.article.modifiedTime) {
      tags.push({ property: 'article:modified_time', content: seo.article.modifiedTime });
    }
    if (seo.article.tags && seo.article.tags.length > 0) {
      seo.article.tags.forEach(tag => {
        tags.push({ property: 'article:tag', content: tag });
      });
    }
    if (seo.article.section) {
      tags.push({ property: 'article:section', content: seo.article.section });
    }
  }

  // Add robots meta if noindex or nofollow is true
  if (seo.noindex || seo.nofollow) {
    const robotsContent = [
      seo.noindex ? 'noindex' : 'index',
      seo.nofollow ? 'nofollow' : 'follow'
    ].join(', ');
    tags.push({ name: 'robots', content: robotsContent });
  }

  return {
    title: fullTitle,
    meta: tags.filter(tag => tag.content) // Remove tags with empty content
  };
}

/**
 * Generate JSON-LD structured data for a blog post
 * @param post Blog post data
 * @param siteUrl Base URL of the site
 * @returns JSON-LD structured data object
 */
export function generateBlogJsonLd(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
  coverImage?: string;
  tags?: string[];
  author?: {
    name: string;
    url?: string;
  };
}, siteUrl: string = defaultMeta.url || '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.description,
    'datePublished': new Date(post.date).toISOString(),
    'image': post.coverImage ? 
      (post.coverImage.startsWith('http') ? post.coverImage : `${siteUrl}${post.coverImage}`) : 
      undefined,
    'url': `${siteUrl}/blog/${post.slug}`,
    'author': post.author ? {
      '@type': 'Person',
      'name': post.author.name,
      'url': post.author.url
    } : {
      '@type': 'Person',
      'name': 'Ian Wilson',
      'url': siteUrl
    },
    'keywords': post.tags?.join(', '),
    'publisher': {
      '@type': 'Organization',
      'name': 'Ian Wilson',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/images/logo.png`
      }
    }
  };
}

/**
 * Generate JSON-LD structured data for a project
 * @param project Project data
 * @param siteUrl Base URL of the site
 * @returns JSON-LD structured data object
 */
export function generateProjectJsonLd(project: {
  title: string;
  description: string;
  date: string;
  slug: string;
  coverImage?: string;
  tags?: string[];
  projectUrl?: string;
}, siteUrl: string = defaultMeta.url || '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': project.title,
    'description': project.description,
    'dateCreated': new Date(project.date).toISOString(),
    'image': project.coverImage ? 
      (project.coverImage.startsWith('http') ? project.coverImage : `${siteUrl}${project.coverImage}`) : 
      undefined,
    'url': `${siteUrl}/portfolio/${project.slug}`,
    'creator': {
      '@type': 'Person',
      'name': 'Ian Wilson',
      'url': siteUrl
    },
    'keywords': project.tags?.join(', '),
    'workExample': project.projectUrl ? {
      '@type': 'WebSite',
      'url': project.projectUrl
    } : undefined
  };
}
