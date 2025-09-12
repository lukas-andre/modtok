TODO:
- Admin Creates not working 
  - Failed to create auth user: User not allowed
  - 01:09:15 [500] POST /api/admin/create-admin 572ms
Error creating admin user: Error: Failed to create auth user: User not allowed
    at createAdminUser (/Users/lhenry/Development/modtok/src/lib/auth.ts:57:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Module.POST (/Users/lhenry/Development/modtok/src/pages/api/admin/create-admin.ts:48:20)
    at async renderEndpoint (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/runtime/server/endpoint.js:37:18)
    at async lastNext (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/core/render-context.js:188:23)
    at async callMiddleware (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/core/middleware/callMiddleware.js:11:10)
    at async RenderContext.render (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/core/render-context.js:235:22)
    at async handleRoute (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/vite-plugin-astro-server/route.js:180:16)
    at async run (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/vite-plugin-astro-server/request.js:46:14)
    at async runWithErrorHandling (file:///Users/lhenry/Development/modtok/node_modules/.pnpm/astro@5.13.7_@types+node@24.3.1_jiti@2.5.1_lightningcss@1.30.1_rollup@4.50.1_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/vite-plugin-astro-server/controller.js:64:5)
01:09:31 [500] POST /api/admin/create-admin 624ms
- Quitar Emojies.
- Ver Admin por ID no funciona http://localhost:4321/admin/super/admins/3c74ab29-377b-4eb2-a440-ab02cf8b2ad1 404 NOT FOUND
- http://localhost:4321/admin Admin dashboard is using dummy metrics. we should ensure using real ones.
- MARK SEO & Metadada - Biblioteca de Medios - Páginas Estáticas as TBD or "Proximamente" on http://localhost:4321/admin/content
- En super admin dashboard sacar "Consultas Pendientes"
- Super Admin dasbhoard quitar emoji de generar contraseña
- Admin user doesnt works http://localhost:4321/admin/users#id
- Checkear bien todo lo que tenga que ver con SEO en http://localhost:4321/admin/settings ver si es verdad que con eso podemos mejorar.
- Marcar "Aprobaciones Pendientes" y "Elementos que requieren revisión y aprobación" como "coming soon" o "proximamente" y la parte de "consultas" igual com comming soon. 


