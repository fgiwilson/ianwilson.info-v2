/**
 * Utility functions for working with markdown content
 */
import { prisma } from '$lib/server/db.js';

/**
 * Extract the first image URL from markdown content
 * @param {string} markdownContent - The markdown content to parse
 * @returns {string|null} - The first image URL found, or null if none
 */
export function extractFirstImageUrl(markdownContent) {
  if (!markdownContent) return null;
  
  // Match standard markdown image syntax: ![alt text](image-url)
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = markdownContent.match(imageRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Find a media item that matches the given URL
 * This handles different URL formats (S3, CDN, local) by using a flexible matching approach
 * @param {string} imageUrl - The image URL to find in the database
 * @returns {Promise<{id: string, path: string, filename: string}|null>} - The media item or null if not found
 */
export async function findMediaItemByUrl(imageUrl) {
  if (!imageUrl) return null;
  
  try {
    // First try exact match on path
    const exactMatch = await prisma.media.findFirst({
      where: {
        path: imageUrl
      }
    });
    
    if (exactMatch) {
      console.log('Found exact match for image URL:', imageUrl);
      return exactMatch;
    }
    
    // If no exact match, try to extract the filename/key part
    // This helps match across different domains (S3, CDN, local)
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    
    // Extract the filename or key part
    // For S3/CDN URLs, this might be something like /uploads/2023/01/image.jpg
    // or /bucket-name/uploads/2023/01/image.jpg
    const pathParts = pathname.split('/');
    const filename = pathParts[pathParts.length - 1]; // Get the last part (filename)
    
    // Try to find by filename
    if (filename) {
      const filenameMatch = await prisma.media.findFirst({
        where: {
          filename: filename
        }
      });
      
      if (filenameMatch) {
        console.log('Found filename match for image URL:', imageUrl, 'with filename:', filename);
        return filenameMatch;
      }
      
      // Try to find by path containing the filename
      const pathMatch = await prisma.media.findFirst({
        where: {
          path: {
            contains: filename
          }
        }
      });
      
      if (pathMatch) {
        console.log('Found path match for image URL:', imageUrl, 'with filename:', filename);
        return pathMatch;
      }
    }
    
    console.log('No media item found for image URL:', imageUrl);
    return null;
  } catch (error) {
    console.error('Error finding media item by URL:', error);
    return null;
  }
}
