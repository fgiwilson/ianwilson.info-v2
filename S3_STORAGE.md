# S3 Storage Integration for Media Files

This project supports storing media files (images and other uploads) in an S3-compatible storage bucket. This is particularly useful for containerized deployments where local file storage may not persist between container restarts.

## Configuration

To enable S3 storage for media files, you need to set the following environment variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `S3_ACCESS_KEY` | Access key for your S3 account | Yes | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_KEY` | Secret key for your S3 account | Yes | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_BUCKET` | Name of the S3 bucket to use | Yes | `my-website-media` |
| `S3_ENDPOINT` | Endpoint URL for your S3 service | Yes | `s3.amazonaws.com` or `nyc3.digitaloceanspaces.com` |
| `S3_REGION` | AWS region for your S3 bucket | No (defaults to `us-east-1`) | `eu-west-3` |
| `S3_CDN_DOMAIN` | Custom domain for your CDN if used | No | `media.example.com` |
| `S3_PATH_STYLE` | Set to 'true' for path-style URLs | No (defaults to virtual-hosted style) | `true` |

## Fallback to Local Storage

If any of the required S3 environment variables are missing, the system will automatically fall back to using local storage in the `static/uploads` directory.

## S3-Compatible Services

This integration works with any S3-compatible storage service, including:

- Amazon S3
- DigitalOcean Spaces
- MinIO
- Backblaze B2
- Wasabi
- Linode Object Storage
- and others

## Example Configuration

### Amazon S3

```env
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your-bucket-name
S3_ENDPOINT=s3.amazonaws.com
S3_REGION=us-east-1
```

### DigitalOcean Spaces

```env
S3_ACCESS_KEY=your_spaces_key
S3_SECRET_KEY=your_spaces_secret
S3_BUCKET=your-space-name
S3_ENDPOINT=nyc3.digitaloceanspaces.com
S3_REGION=nyc3
S3_PATH_STYLE=true
```

### MinIO (Self-hosted)

```env
S3_ACCESS_KEY=your_minio_access_key
S3_SECRET_KEY=your_minio_secret_key
S3_BUCKET=your-bucket-name
S3_ENDPOINT=minio.example.com
S3_PATH_STYLE=true
```

## Implementation Details

The S3 integration is implemented in:

- `src/lib/server/s3-client.ts` - S3 client and upload utilities
- `src/lib/server/image-processor.ts` - Image processing with S3 upload support
- `src/routes/api/media/upload/+server.ts` - API endpoint for media uploads

## Testing Your Configuration

After setting up your environment variables, you can test the S3 integration by uploading a file through the admin interface. Check your S3 bucket to confirm that the file was uploaded successfully.

If you encounter any issues, check the server logs for error messages related to S3 uploads.
