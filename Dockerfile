# Build stage
FROM node:24-alpine AS builder

# Install build dependencies for native modules (bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Accept NPM_TOKEN as build argument
ARG NPM_TOKEN

# Create .npmrc with authentication if token is provided
RUN if [ -n "$NPM_TOKEN" ]; then \
    echo "//npm.fontawesome.com/:_authToken=${NPM_TOKEN}" > .npmrc; \
  fi

# Install dependencies
RUN npm ci

# Remove .npmrc after installation for security
RUN rm -f .npmrc

# Copy source code
COPY . .

# Generate Prisma Client and build the app
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Production stage
FROM node:24-alpine AS runner

# Install runtime dependencies for native modules
RUN apk add --no-cache cairo jpeg pango giflib curl

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["node", "build"]
