// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://modtok.cl',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@supabase/ssr']
    }
  },
  security: {
    checkOrigin: true
  }
});
