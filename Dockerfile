# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:lts-alpine

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Create and change to the app directory.
WORKDIR /app

# Copy the files to the container image
COPY package.json pnpm-lock.yaml ./

# Install packages
RUN pnpm install --frozen-lockfile

# Copy local code to the container image.
COPY . ./

# Build the app.
RUN pnpm run build

# Serve the app
CMD ["pnpm", "run", "start"]