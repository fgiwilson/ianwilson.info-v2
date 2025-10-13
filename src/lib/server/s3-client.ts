import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
	S3_REGION,
	S3_ENDPOINT,
	S3_PATH_STYLE,
	S3_BUCKET,
	S3_ACCESS_KEY,
	S3_SECRET_KEY,
	S3_CDN_DOMAIN
} from '$env/static/private';

// Determine if we should use path style URLs based on the endpoint
// Linode and some other providers work better with path style
const isLinode = S3_ENDPOINT?.includes('linodeobjects.com');
const usePathStyle = S3_PATH_STYLE === 'true' || isLinode;

// Initialize S3 client with environment variables
const s3Client = new S3Client({
	region: S3_REGION || 'us-lax-1',
	endpoint: S3_ENDPOINT,
	credentials: {
		accessKeyId: S3_ACCESS_KEY || '',
		secretAccessKey: S3_SECRET_KEY || ''
	},
	forcePathStyle: usePathStyle // Use path style for Linode and when explicitly configured
});

// S3 bucket name from environment variable
const bucketName = S3_BUCKET || '';

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
				ACL: 'public-read' // Make the file publicly accessible
			}
		});

		// Upload the file
		await upload.done();

		// Construct and return the URL
		const cdnDomain = S3_CDN_DOMAIN || '';

		if (cdnDomain) {
			// If a CDN domain is provided, use it
			return `https://${cdnDomain}/${key}`;
		} else {
			// Otherwise, construct the URL from the endpoint and bucket
			let endpoint = S3_ENDPOINT || '';

			// Ensure endpoint has https:// prefix for SSL
			if (!endpoint.startsWith('http')) {
				endpoint = `https://${endpoint}`;
			}

			// Make sure we have a protocol in the URL
			let fullUrl;

			// Handle path-style vs virtual-hosted style URLs
			// Use path style for Linode and when explicitly configured
			if (usePathStyle) {
				// Path-style URL (https://endpoint/bucket/key)
				fullUrl = `${endpoint}/${bucketName}/${key}`;
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
				// eslint-disable-next-line
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
	return !!(S3_ACCESS_KEY && S3_SECRET_KEY && S3_BUCKET && S3_ENDPOINT);
}

export { s3Client, bucketName };
