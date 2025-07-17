/**
 * Utility functions for working with markdown content
 */

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
