#!/bin/sh

echo "Starting Railway entrypoint script..."

# Check if dist folder exists (build already done)
if [ ! -d "dist" ]; then
  echo "No dist folder found, building the app..."

  # Create .env file from Railway environment variables
  echo "Creating .env file with environment variables..."
  echo "PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL" > .env
  echo "PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY" >> .env

  # Build the app
  echo "Building Astro app..."
  pnpm run build

  # Remove .env file after build
  rm -f .env
  echo "Build complete!"
else
  echo "dist folder exists, skipping build..."
fi

# Start the server
echo "Starting server..."
exec pnpm run start