import { marked } from 'marked';

/**
 * Simple markdown parser with post-processing for S3 images and galleries
 * 
 * Syntax:
 * - Regular image: ![alt text](url)
 * - Image with modal: ![alt text](url){modal}
 * - Gallery: ![Gallery Title](image1.jpg, image2.jpg, image3.jpg){gallery}
 * - Gallery with columns: ![Gallery Title](image1.jpg, image2.jpg, image3.jpg){gallery:4}
 */

/**
 * Extract S3/Linode URL from various object formats
 */
function extractS3Url(obj: any): string | null {
  if (typeof obj === 'string') {
    return obj.includes('linodeobjects.com') ? obj : null;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    // Check common properties that might contain S3 URLs
    const props = ['url', 'path', 'href', 'src'];
    for (const prop of props) {
      if (obj[prop] && typeof obj[prop] === 'string' && obj[prop].includes('linodeobjects.com')) {
        return obj[prop];
      }
    }
    
    // Search in stringified object for Linode URLs
    const objStr = JSON.stringify(obj);
    const match = objStr.match(/https?:\/\/[\w.-]+\.linodeobjects\.com\/[^"\s]+/);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Fix image sources in HTML content
 */
function fixImageSources(html: string, originalContent: string): string {
  // Find all img tags
  return html.replace(/<img([^>]*)src="([^"]*?)"([^>]*)>/g, (match, before, src, after) => {
    let fixedSrc = src;
    
    // If src looks like an object reference or is undefined/empty
    if (src === '[object Object]' || src === 'undefined' || src === '' || src === 'null') {
      // Try to find the actual S3 URL in the original content
      const s3Url = extractS3Url(originalContent);
      if (s3Url) {
        fixedSrc = s3Url;
      } else {
        fixedSrc = '/images/placeholder.jpg';
      }
    }
    
    // Ensure the src is properly formatted
    if (!fixedSrc.startsWith('http') && !fixedSrc.startsWith('/')) {
      fixedSrc = '/' + fixedSrc;
    }
    
    return `<img${before}src="${fixedSrc}"${after}>`;
  });
}

/**
 * Process gallery shortcodes in markdown content
 */
function processGalleries(content: string): string {
  // Match gallery syntax where {gallery} is in the alt text: ![title{gallery}](url1,url2,url3) or ![title{gallery:4}](url1,url2,url3)
  return content.replace(/!\[([^\]]*?)\{gallery(?::(\d+))?\}([^\]]*)\]\(([^\)]+)\)/g, (match, titleBefore, columns, titleAfter, urls) => {
    console.log('Processing gallery (alt text syntax):', { match, titleBefore, titleAfter, urls, columns });
    
    const galleryColumns = columns ? parseInt(columns) : 3;
    const title = (titleBefore + titleAfter).trim();
    const imageUrls = urls.split(',').map((url: string) => url.trim()).filter((url: string) => url);
    
    console.log('Gallery image URLs:', imageUrls);
    
    // Create image objects
    const imageObjects = imageUrls.map((url: string) => ({ src: url }));
    const imagesJson = JSON.stringify(imageObjects).replace(/'/g, '&apos;');
    
    console.log('Gallery JSON:', imagesJson);
    
    const galleryHtml = `<div class="markdown-gallery" data-gallery="true" data-images='${imagesJson}' data-columns="${galleryColumns}">
      ${title ? `<h4 class="gallery-title">${title}</h4>` : ''}
      <!-- Gallery will be rendered here by client-side JS -->
    </div>`;
    
    console.log('Gallery HTML:', galleryHtml);
    
    return galleryHtml;
  });
}

/**
 * Process modal shortcodes in markdown content
 */
function processModals(content: string): string {
  // Match modal syntax where {modal} is in the alt text: ![alt text{modal}](url)
  return content.replace(/!\[([^\]]*?)\{modal\}([^\]]*)\]\(([^\)]+)\)/g, (match, altBefore, altAfter, url) => {
    const alt = (altBefore + altAfter).trim();
    console.log('Processing modal (alt text syntax):', { match, alt, url });
    
    // Return as smaller inline image with modal data attributes
    return `<img src="${url}" alt="${alt}" class="markdown-image markdown-modal-image cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-300 rounded-lg shadow-md max-w-sm mx-auto block" style="max-height: 300px; object-fit: cover;" data-modal="true" data-modal-src="${url}" data-modal-alt="${alt}" onerror="this.onerror=null; this.src='/images/placeholder.jpg';" />`;
  });
}

/**
 * Add modal attributes to images in HTML
 */
function addModalAttributes(html: string): string {
  // This would be called after markdown processing to add modal attributes
  // For now, we'll handle this in the client-side processing
  return html;
}

/**
 * Parse markdown with S3 URL fixing and gallery support
 */
export function parseMarkdown(content: string): string {
  if (!content) {
    return '';
  }
  
  console.log('parseMarkdown called with content:', content.substring(0, 200) + '...');
  
  try {
    // Step 1: Process shortcodes before markdown parsing
    let processedContent = content;
    
    console.log('Before gallery processing:', processedContent.substring(0, 200) + '...');
    processedContent = processGalleries(processedContent);
    console.log('After gallery processing:', processedContent.substring(0, 200) + '...');
    
    processedContent = processModals(processedContent);
    console.log('After modal processing:', processedContent.substring(0, 200) + '...');
    
    // Step 2: Parse markdown with basic marked
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    
    let html = marked.parse(processedContent) as string;
    console.log('After marked parsing:', html.substring(0, 200) + '...');
    
    // Step 3: Post-process to fix S3 URLs and add error handling
    html = fixImageSources(html, content);
    console.log('After fixing image sources:', html.substring(0, 200) + '...');
    
    // Step 4: Add error handling to all images
    html = html.replace(/<img([^>]*)>/g, (match, attrs) => {
      // Add error handling if not already present
      if (!attrs.includes('onerror')) {
        return `<img${attrs} onerror="this.onerror=null; this.src='/images/placeholder.jpg';">`;
      }
      return match;
    });
    
    console.log('Final HTML output:', html.substring(0, 300) + '...');
    
    return html;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p>Error parsing content</p>`;
  }
}
