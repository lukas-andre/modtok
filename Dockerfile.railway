# Optimized Dockerfile for Railway deployment with Astro + pnpm
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Set production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Railway will provide PORT dynamically
# The app should read PORT from environment
CMD ["node", "./dist/server/entry.mjs"]