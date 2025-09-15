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

# Copy built application and startup script
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY start.sh ./

# Make startup script executable
RUN chmod +x start.sh

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Use the startup script
CMD ["./start.sh"]