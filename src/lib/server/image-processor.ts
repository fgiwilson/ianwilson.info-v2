import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Configuration for image processing
 */
export interface ImageProcessingConfig {
  /** Width of the thumbnail in pixels */
  thumbnailWidth?: number;
  /** Height of the thumbnail in pixels (aspect ratio will be maintained if only one dimension is provided) */
  thumbnailHeight?: number;
  /** Width of the medium-sized image in pixels */
  mediumWidth?: number;
  /** Height of the medium-sized image in pixels (aspect ratio will be maintained if only one dimension is provided) */
  mediumHeight?: number;
  /** Quality of the output image (1-100) */
  quality?: number;
  /** Format of the output image */
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

/**
 * Result of image processing
 */
export interface ProcessedImage {
  /** Path to the original image */
  original: string;
  /** Path to the thumbnail image */
  thumbnail: string;
  /** Path to the medium-sized image */
  medium: string;
  /** MIME type of the processed images */
  mimetype: string;
  /** Original filename */
  originalFilename: string;
  /** Size of the original file in bytes */
  size: number;
}

/**
 * Default configuration for image processing
 */
const defaultConfig: ImageProcessingConfig = {
  thumbnailWidth: 400,
  thumbnailHeight: 300,
  mediumWidth: 800,
  mediumHeight: 600,
  quality: 80,
  format: 'webp',
};

/**
 * Process an image file to create thumbnail and medium-sized versions
 * @param file The uploaded file to process
 * @param config Configuration options for image processing
 * @returns Promise resolving to processed image paths and metadata
 */
export async function processImage(
  file: File,
  config: ImageProcessingConfig = {}
): Promise<ProcessedImage> {
  // Merge default config with provided config
  const options = { ...defaultConfig, ...config };
  
  // Get file buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Generate unique ID for the file
  const uniqueId = randomUUID();
  
  // Extract file extension and name
  const originalFilename = file.name;
  const fileExt = path.extname(originalFilename).toLowerCase();
  const baseName = path.basename(originalFilename, fileExt);
  const safeBaseName = baseName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  // Determine output format
  const outputFormat = options.format || 'webp';
  const outputExt = `.${outputFormat}`;
  const mimetype = `image/${outputFormat}`;
  
  // Define output paths
  const uploadDir = 'static/uploads';
  const datePrefix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const outputDir = path.join(uploadDir, datePrefix);
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Define output filenames
  const originalFilePath = path.join(outputDir, `${safeBaseName}-${uniqueId}${fileExt}`);
  const thumbnailFilePath = path.join(outputDir, `${safeBaseName}-${uniqueId}-thumbnail${outputExt}`);
  const mediumFilePath = path.join(outputDir, `${safeBaseName}-${uniqueId}-medium${outputExt}`);
  
  // Save original file
  fs.writeFileSync(originalFilePath, buffer);
  
  // Process thumbnail
  await sharp(buffer)
    .resize(options.thumbnailWidth, options.thumbnailHeight, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat(outputFormat, { quality: options.quality })
    .toFile(thumbnailFilePath);
  
  // Process medium-sized image
  await sharp(buffer)
    .resize(options.mediumWidth, options.mediumHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(outputFormat, { quality: options.quality })
    .toFile(mediumFilePath);
  
  // Return paths and metadata
  return {
    original: `/${originalFilePath.replace(/\\/g, '/').replace('static/', '')}`,
    thumbnail: `/${thumbnailFilePath.replace(/\\/g, '/').replace('static/', '')}`,
    medium: `/${mediumFilePath.replace(/\\/g, '/').replace('static/', '')}`,
    mimetype,
    originalFilename,
    size: buffer.length,
  };
}
