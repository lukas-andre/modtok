import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {
  // Redirect /dashboard to /admin (Design System v2.0 migration)
  if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
    return redirect('/admin', 301);
  }

  // Continue to the next middleware or route
  return next();
});
