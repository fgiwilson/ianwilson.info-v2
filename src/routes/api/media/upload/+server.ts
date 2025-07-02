/**
 * API endpoint for media file uploads
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { prisma } from '$lib/server/db.js';
import { processImage } from '$lib/server/image-processor';

/**
 * Handle media upload requests
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse form data
    const formData = await request.formData();
    console.log('Form data received:', [...formData.entries()].map(entry => entry[0]));
    
    // Try to get files from both 'files' and 'file' keys
    let files = formData.getAll('files');
    console.log('Files from "files" key:', files.length);
    
    // If no files found under 'files', try 'file' key
    if (!files || files.length === 0) {
      files = formData.getAll('file');
      console.log('Files from "file" key:', files.length);
    }

    if (!files || files.length === 0) {
      console.error('No files found in request');
      return json({ error: 'No files provided' }, { status: 400 });
    }
    
    console.log('Processing files:', files.length);

    const uploadResults = [];
    const uploadDir = join(process.cwd(), 'static', 'uploads');

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Process each file
    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      try {
        // Check if file is an image
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
          // Process image with Sharp
          const processedImage = await processImage(file);
          
          // Create media record in database with thumbnail and medium paths
          const media = await prisma.media.create({
            data: {
              filename: processedImage.originalFilename,
              path: processedImage.original,
              thumbnailPath: processedImage.thumbnail,
              mediumPath: processedImage.medium,
              mimetype: processedImage.mimetype,
              size: processedImage.size,
              alt: processedImage.originalFilename.split('.')[0] // Default alt text is filename without extension
            }
          });
          
          uploadResults.push(media);
        } else {
          // Handle non-image file
          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 10);
          const originalName = file.name;
          const extension = originalName.split('.').pop() || '';
          const filename = `${timestamp}-${randomString}.${extension}`;
          const relativePath = `/uploads/${filename}`;
          const fullPath = join(uploadDir, filename);

          // Read file as ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Save file to disk
          writeFileSync(fullPath, buffer);

          // Create media record in database
          const media = await prisma.media.create({
            data: {
              filename: originalName,
              path: relativePath,
              mimetype: file.type,
              size: file.size,
              alt: originalName.split('.')[0] // Default alt text is filename without extension
            }
          });

          uploadResults.push(media);
        }
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }

    return json({ 
      success: true, 
      media: uploadResults
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return json({ error: 'Failed to upload media' }, { status: 500 });
  }
};
