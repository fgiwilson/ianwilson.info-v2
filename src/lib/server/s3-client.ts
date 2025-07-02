import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-lax-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: false, // Required for some S3-compatible services
});

// S3 bucket name from environment variable
const bucketName = process.env.S3_BUCKET || '';

/**
 * Upload a file to S3
 * @param buffer File buffer to upload
 * @param key S3 object key (path)
 * @param contentType MIME type of the file
 * @returns Promise resolving to the URL of the uploaded file
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!bucketName) {
    throw new Error('S3_BUCKET environment variable is not set');
  }

  try {
    // Create upload parameters
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read', // Make the file publicly accessible
      },
    });

    // Upload the file
    await upload.done();

    // Construct and return the URL
    const cdnDomain = process.env.S3_CDN_DOMAIN || '';
    
    if (cdnDomain) {
      // If a CDN domain is provided, use it
      return `https://${cdnDomain}/${key}`;
    } else {
      // Otherwise, construct the URL from the endpoint and bucket
      const endpoint = process.env.S3_ENDPOINT || '';
      
      // Make sure we have a protocol in the URL
      let fullUrl;
      
      // Handle path-style vs virtual-hosted style URLs
      if (process.env.S3_PATH_STYLE === 'true') {
        // Path-style URL (https://endpoint/bucket/key)
        if (endpoint.startsWith('http')) {
          fullUrl = `${endpoint}/${bucketName}/${key}`;
        } else {
          fullUrl = `https://${endpoint}/${bucketName}/${key}`;
        }
      } else {
        // Virtual-hosted style URL (https://bucket.endpoint/key)
        const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
        fullUrl = `https://${bucketName}.${cleanEndpoint}/${key}`;
      }
      
      // Ensure URL is properly formatted
      try {
        // This will throw if URL is invalid
        new URL(fullUrl);
        return fullUrl;
      } catch (e: any) {
        console.error(`Invalid URL constructed: ${fullUrl}`, e);
        throw new Error(`Failed to construct valid S3 URL: ${e.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Check if S3 is configured
 * @returns Boolean indicating if S3 is configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY &&
    process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT
  );
}

export { s3Client, bucketName };
