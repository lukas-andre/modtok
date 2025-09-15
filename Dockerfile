# Use Node.js LTS alpine image
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
# Handle optional pnpm-lock.yaml
COPY pnpm-lock.yaml* ./

# Install dependencies with fallback for missing lockfile
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    else \
      pnpm install; \
    fi

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Astro app
RUN pnpm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user first
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy built application and package.json
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Switch to non-root user
USER astro

# Expose the port that Railway expects
EXPOSE $PORT

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "./dist/server/entry.mjs"]