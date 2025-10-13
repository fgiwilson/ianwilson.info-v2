# Coolify Deployment Guide

This guide explains how to deploy your SvelteKit application to Coolify.

## Prerequisites

- Coolify instance set up
- NPM authentication token for private package `@awesome.me/kit-b2c306474b`

## Getting Your NPM Token

Your application uses a private npm package that requires authentication.

### Option 1: From your local .npmrc file
```bash
cat ~/.npmrc
```
Look for: `//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxx`

### Option 2: Generate a new token
1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to Account Settings → Access Tokens
3. Click 'Generate New Token' → Choose 'Automation' type
4. Copy the generated token

## Coolify Configuration

### 1. Build Arguments (REQUIRED)

In your Coolify application settings:

1. Go to your application → **Build** tab
2. Find **Build Arguments** section
3. Add the following build argument:
   ```
   NPM_TOKEN=npm_your_actual_token_here
   ```

**Important**: This must be set as a **Build Argument**, not a runtime environment variable, because npm needs it during the Docker build process.

### 2. Runtime Environment Variables

In the **Environment Variables** section, add:

```env
# Database (if using Coolify's PostgreSQL)
DATABASE_URL=postgresql://user:password@postgres:5432/dbname

# Application
NODE_ENV=production
PORT=3000

# AWS S3 (if needed)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your_bucket_name

# Email (if using nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password

# Cloudflare Turnstile (if needed)
TURNSTILE_SECRET_KEY=your_secret_key
```

### 3. Port Configuration

- Set the **Port** to `3000` in Coolify's application settings

### 4. Health Check (Optional)

The Dockerfile includes a health check. Coolify should automatically detect it, but you can also configure:
- **Health Check Path**: `/` (or your preferred endpoint)
- **Health Check Interval**: 30s

## Database Setup

### Using Coolify's PostgreSQL

1. Create a PostgreSQL database in Coolify
2. Link it to your application
3. Use the connection string provided by Coolify in your `DATABASE_URL` environment variable

### Running Migrations

After deployment, run Prisma migrations:

1. Go to your application in Coolify
2. Open the **Terminal** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

Or seed the database:
```bash
npm run seed
```

## Deployment Process

1. **Connect your Git repository** to Coolify
2. **Configure build arguments** (NPM_TOKEN)
3. **Set environment variables**
4. **Deploy** - Coolify will automatically build and deploy using the Dockerfile

## Troubleshooting

### Build fails with E401 (Authentication Error)

**Cause**: NPM_TOKEN is not set or incorrect

**Solution**: 
- Verify NPM_TOKEN is added as a **Build Argument** (not environment variable)
- Ensure the token is valid and has access to `@awesome.me/kit-b2c306474b`
- Check there are no extra spaces or quotes around the token

### Application won't start

**Cause**: Missing runtime environment variables

**Solution**: 
- Verify DATABASE_URL is set correctly
- Check all required environment variables are configured
- Review application logs in Coolify

### Database connection errors

**Cause**: Incorrect DATABASE_URL or database not accessible

**Solution**:
- If using Coolify's PostgreSQL, ensure it's linked to your application
- Verify the connection string format: `postgresql://user:password@host:5432/database`
- Check if migrations have been run

## Security Notes

- Never commit your NPM_TOKEN to git
- Use Coolify's secrets management for sensitive values
- The Dockerfile automatically removes .npmrc after installation for security
- Rotate your NPM token periodically

## Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [SvelteKit Deployment Guide](https://kit.svelte.dev/docs/adapter-node)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
