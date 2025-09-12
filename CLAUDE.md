Of course. Based on the best practices outlined in the Anthropic article, here is an excellent, comprehensive `CLAUDE.md` template.

You should copy this into a file named `CLAUDE.md` at the root of your project repository and customize the placeholders with details specific to your app. I've used the **MODTOK** project from our previous conversation as a realistic example.

---

# Project MODTOK: Claude Assistant Guide (CLAUDE.md)

This document provides essential context for the Claude coding assistant. **IMPORTANT**: Adhere to these guidelines to ensure consistency, correctness, and efficiency when working on this codebase.

***

### 📜 Project Overview

MODTOK is a curated digital marketplace for the modular and prefabricated housing industry in Chile. It connects homebuyers with manufacturers, services, and products.

* **Frontend Framework**: **Astro.js** (for high-performance, SEO-focused, content-driven sites)
* **Backend & Database**: **Supabase** (PostgreSQL, Auth, Storage, Edge Functions)
* **Styling**: **Tailwind CSS**
* **Package Manager**: **pnpm**
* **Language**: **TypeScript**

***

### 📂 Key Files & Architecture

Understanding this structure is critical. Before coding, familiarize yourself with these locations.

* `src/pages/`: Contains all site routes. Each `.astro` file here becomes a page.
* `src/components/`: Reusable Astro/UI Framework components (e.g., `Card.astro`, `FilterSidebar.tsx`).
* `src/layouts/`: Base page layouts (e.g., `MainLayout.astro`) that define the shell for pages.
* `src/lib/`: Core application logic, Supabase client, and type definitions.
    * `src/lib/supabase.ts`: Server-side Supabase client for Astro pages. Uses `@supabase/ssr`.
    * `src/lib/supabase-browser.ts`: Browser-side client for React components. Uses `@supabase/supabase-js`.
    * `src/lib/types.ts`: Central location for all TypeScript types and interfaces.
* `supabase/migrations/`: All database schema changes. New migrations are created using the Supabase CLI.

***

### 🛠️ Development Environment Setup

To run this project locally, follow these steps precisely:

1.  **Install Dependencies**: `pnpm install`
2.  **Start Supabase services**: `supabase start` (This starts the local Postgres database and Studio in Docker).
3.  **Run Dev Server**: `pnpm dev`

The application will be available at `http://localhost:4321` and Supabase Studio at `http://localhost:54323`.

***

### 🤖 Common Commands

These are the most frequently used commands.

* `pnpm dev`: Starts the Astro development server with hot-reloading.
* `pnpm build`: Compiles the application for production.
* `pnpm preview`: Serves the production build locally to test it.
* `pnpm check`: Runs `astro check` to perform type-checking on all `.astro` files. **Run this before committing.**
* `pnpm test`: Runs the test suite using Vitest.

***

### ✅ Testing

* **Framework**: We use **Vitest** for unit tests and **Playwright** for end-to-end tests.
* **Location**: Unit tests are located alongside the code in `*.test.ts` files. E2E tests are in the `tests/` directory.
* **Workflow**: **YOU MUST** write tests for new features. For bug fixes, first write a failing test that reproduces the bug, then write the code to make it pass.
* **Performance**: Prefer running single tests during active development to save time (e.g., `pnpm test src/components/MyComponent.test.ts`).

***

### 🎨 Code Style & Conventions

* **TypeScript**: Use TypeScript for all new logic. Define shared types in `src/lib/types.ts`.
* **Styling**: **Use Tailwind CSS utility classes directly in the HTML/JSX.** Do not write custom CSS files or use inline `style` attributes unless absolutely necessary.
* **ES Modules**: Use `import`/`export` syntax. Do not use `require`.
* **Astro Components**: Keep components focused on a single responsibility. Pass data via `props`.
* **IMPORTANT**: All components that accept props **MUST** have their props typed with a TypeScript interface.

***

### ✨ Workflow & Best Practices

Follow this workflow for most tasks.

1.  **Plan First**: Before writing any code, state your plan. For example: "I will create a new component in `src/components/`, add a new page in `src/pages/` that uses it, and fetch data from Supabase using the shared client."
2.  **Implement**: Write the code, following the style guidelines.
3.  **Test**: Write or update tests to cover your changes. Run the tests to ensure they pass and that you haven't broken anything.
4.  **Verify**: Run `pnpm check` to ensure there are no type errors.
5.  **Commit**: Use the Git Etiquette guidelines below to commit your changes.

***

### 🌳 Git & Repository Etiquette

* **Branch Naming**: Use the format `type/short-description` (e.g., `feature/user-watchlist`, `fix/seo-meta-tags`).
* **Commit Messages**: Follow the **Conventional Commits** specification (e.g., `feat: add watchlist functionality for users`). This is not optional.
* **Pull Requests (PRs)**:
    * Always **rebase** your branch on top of the `main` branch before creating a PR to avoid merge commits.
    * Provide a clear description of the changes in the PR.
    * Link the PR to the relevant GitHub issue.

***

### ⚠️ Known Issues & Quirks

* The local Supabase instance sometimes doesn't apply new migrations correctly on the first try. If you encounter strange database errors, run `supabase stop` and then `supabase start` to fully restart the services.
* Astro's view transitions can sometimes conflict with complex client-side JavaScript. If you see flickering or state-loss issues, consider disabling transitions for that specific page or component.
* **IMPORTANT**: Supabase SSR cookie handling conflicts with Vite in React components. Always use `@supabase/supabase-js` directly for browser components, NOT `@supabase/ssr`.
* **CRITICAL - Astro Script Processing Fix**: When using CDN scripts (like Tailwind CSS) in Astro components, you MUST add the `is:inline` directive to prevent Astro from processing them as ES modules. This was a major issue that caused JavaScript runtime errors throughout the admin interface.

**Example of the fix:**
```astro
<!-- WRONG - Causes runtime errors -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { ... };
</script>

<!-- CORRECT - Fixed with is:inline -->
<script src="https://cdn.tailwindcss.com"></script>
<script is:inline>
  tailwind.config = { ... };
</script>
```

**When to use `is:inline`:**
- CDN scripts (Tailwind, Alpine.js, etc.)
- Configuration objects for third-party libraries
- Scripts that need to run immediately without module processing
- Global variable assignments that need to be accessible from other scripts

### 🚫 Astro File Pitfalls to Avoid

**NEVER use TypeScript syntax in `<script>` tags** unless using `is:inline`:
- No type annotations: `as HTMLElement`, `: string`, `: void`
- No generics: `Array<string>`, `NodeListOf<HTMLInputElement>`
- Convert to plain JavaScript or use `define:vars` to pass data

**Common fixes:**
```javascript
// ❌ WRONG
const el = document.getElementById('id') as HTMLInputElement;
function fn(param: string): void { }

// ✅ CORRECT
const el = document.getElementById('id');
function fn(param) { }
```

**Select Option Conditional Attributes:**
- NEVER use the `{condition ? 'attribute' : ''}` pattern - it causes TypeScript parsing errors:
```astro
<!-- ❌ WRONG - Causes TypeScript parsing errors -->
<option value="draft" {post.status === 'draft' ? 'selected' : ''}>Borrador</option>

<!-- ✅ CORRECT - Use boolean attribute syntax -->
<option value="draft" selected={post.status === 'draft'}>Borrador</option>
```

**Database type regeneration:**
- If you get "table doesn't exist" errors, regenerate types: `npx supabase gen types typescript --project-id ygetqjqtjhdlbksdpyyr > src/lib/database.types.ts`

**Admin Actions & Enum Type Issues:**
- When inserting into `admin_actions` table, always check if `auth?.user?.id` exists before inserting to avoid "Type 'undefined' is not assignable to type 'string'" errors:
```typescript
// ❌ WRONG - Can cause undefined error
await supabase.from('admin_actions').insert({
  admin_id: auth?.user?.id, // This can be undefined
  action_type: 'create',
  // ...
});

// ✅ CORRECT - Check for existence first
if (auth?.user?.id) {
  await supabase.from('admin_actions').insert({
    admin_id: auth.user.id, // Now guaranteed to be string
    action_type: 'create',
    // ...
  });
}
```

- For enum types in API routes, properly type search parameters to avoid "string is not assignable to enum" errors:
```typescript
// ❌ WRONG - Generic string type causes enum errors
const status = searchParams.get('status');
query = query.eq('status', status); // Error: string not assignable to enum

// ✅ CORRECT - Type the parameter with enum values
const status = searchParams.get('status') as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | null;
if (status && ['draft', 'pending_review', 'active', 'inactive', 'rejected'].includes(status)) {
  query = query.eq('status', status); // Now properly typed
}
```

***

### 📝 TypeScript & Database Types

**CRITICAL**: Database types are auto-generated and stored in `src/lib/database.types.ts`. This file contains:

* **Database interface**: The complete type structure matching your Supabase schema
* **Tables types**: Row, Insert, and Update types for each table
* **Enums**: All database enums (user_role, listing_status, etc.)
* **Helper types**: `Tables<'profiles'>`, `TablesInsert<'providers'>`, etc.

**Usage Pattern**:
```typescript
// Import from database.types.ts
import type { ProfileInsert, ProviderInsert, ProfileUpdate } from '@/lib/database.types';

// When inserting/updating data
const profileData: ProfileInsert = { ... };
const providerData: ProviderInsert = { ... };

// Use with Supabase client
await supabase.from('profiles').insert(profileData);
await supabase.from('providers').insert(providerData);
```

**Important**: 
* Always import types from `@/lib/database.types.ts` or `@/lib/types.ts`
* Never use untyped objects with Supabase operations
* Run `pnpm supabase gen types typescript --local > src/lib/database.types.ts` to regenerate types after schema changes
* **Type Aliases Preservation**: When you regenerate database types with `npx supabase gen types`, the custom type aliases (Profile, ProfileInsert, Provider, etc.) will be preserved since they're added after the auto-generated content. The types are working correctly and all imports should resolve properly throughout your codebase

***

### 🔐 Authentication & Supabase Clients

**CRITICAL**: We use two separate Supabase clients to handle SSR properly:

1. **Server-side** (`src/lib/supabase.ts`):
   - Uses `@supabase/ssr` with `createServerClient`
   - For Astro pages and server-side operations
   - Handles cookies properly for SSR
   - Use functions like `getUser(Astro)` and `getSession(Astro)`

2. **Browser-side** (`src/lib/supabase-browser.ts`):
   - Uses `@supabase/supabase-js` with `createClient`
   - For React/Vue/Svelte components with client directives
   - Simpler setup without SSR cookie handling (avoids Vite conflicts)
   - Create once and reuse: `const supabase = createBrowserSupabaseClient()`

**Authentication Flow for React Components**:
```typescript
// In Astro page (.astro)
const session = await getSession(Astro);
<MyComponent client:load session={session} />

// In React component (.tsx)
interface Props {
  session: any; // Use any to avoid serialization issues
}
// Use session data directly, don't fetch it again
```