import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Simple status check without external dependencies
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'modtok',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 'unknown',
    host: process.env.HOST || 'unknown'
  };

  return new Response(JSON.stringify(status, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};