# Railway-optimized Dockerfile for Astro + pnpm with runtime build
FROM node:lts-alpine

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Create and change to the app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install packages (including dev dependencies for build)
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    else \
      pnpm install; \
    fi

# Copy all application code
COPY . ./

# Make entrypoint script executable
RUN chmod +x railway-entrypoint.sh

# Don't build at Docker build time - will build at runtime with env vars
# This allows Railway's environment variables to be available during build

# Use the entrypoint script that builds with env vars then starts the server
CMD ["./railway-entrypoint.sh"]