#!/bin/sh

# Railway startup script for Astro app
echo "Starting Astro server..."
echo "Environment variables:"
echo "  NODE_ENV: $NODE_ENV"
echo "  HOST: $HOST"
echo "  PORT: $PORT"
echo "  RAILWAY_ENVIRONMENT: $RAILWAY_ENVIRONMENT"

# Ensure PORT is set (Railway provides this)
if [ -z "$PORT" ]; then
  echo "Warning: PORT not set, defaulting to 3000"
  export PORT=3000
fi

# Ensure HOST is set to accept external connections
export HOST=0.0.0.0

echo "Starting server on $HOST:$PORT..."

# Start the Astro Node.js server
exec node ./dist/server/entry.mjs