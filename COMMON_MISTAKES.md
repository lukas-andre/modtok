# Common Mistakes and Patterns Guide

This document outlines common mistakes when working with Astro files and the correct patterns to follow for consistent, error-free code.

## 🚨 Critical Astro File Patterns

### ✅ Standard Admin Authentication Pattern

**Always use this pattern for admin pages:**

```astro
---
import AdminLayout from '@/layouts/AdminLayout.astro';
import { getAdminAuth, requireAdmin } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase';

const auth = await getAdminAuth(Astro);
const user = requireAdmin(auth);

if (!user) {
  return Astro.redirect('/auth/login?redirect=/admin/current/path');
}

const supabase = createSupabaseClient(Astro);

// Your database queries here...
---

<AdminLayout title="Page Title" user={user}>
  <!-- Your content here -->
</AdminLayout>
```

### ❌ Common Authentication Mistakes

**DON'T use these deprecated patterns:**

```astro
<!-- WRONG - Old authentication pattern -->
const session = await getSession(Astro);
if (!session || !['super_admin', 'admin'].includes(session.user.role)) {
  return Astro.redirect('/admin/login');
}

<!-- WRONG - Old Supabase client -->
import { createServerSupabaseClient } from '@/lib/supabase';
const supabase = createServerSupabaseClient(Astro);

<!-- WRONG - Missing user prop -->
<AdminLayout title="Page Title">
```

## 🔧 Supabase Client Usage

### Server-side (Astro Pages)

Use `createSupabaseClient` from `@/lib/supabase` for server-side operations:

```astro
---
import { createSupabaseClient } from '@/lib/supabase';

const supabase = createSupabaseClient(Astro);

// Database operations
const { data: houses, error } = await supabase
  .from('houses')
  .select('*')
  .eq('status', 'active');
---
```

### Client-side (React Components)

Use `createBrowserSupabaseClient` from `@/lib/supabase-browser` for client components:

```tsx
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

export default function MyComponent() {
  const supabase = createBrowserSupabaseClient();
  
  // Client-side database operations
  const fetchData = async () => {
    const { data } = await supabase.from('table').select('*');
  };
}
```

### API Endpoints

Always include both `request` and `cookies` parameters:

```typescript
// ✅ CORRECT
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  // ...
};

// ❌ WRONG - Missing request parameter
export const GET: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseClient({ cookies }); // Type error!
};
```

## 🎯 Script Tag Pitfalls

### ✅ Correct Script Usage

**Use `is:inline` for CDN scripts and immediate execution:**

```astro
<!-- CDN scripts need is:inline -->
<script src="https://cdn.tailwindcss.com"></script>
<script is:inline>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#3b82f6'
        }
      }
    }
  };
</script>

<!-- Plain JavaScript (no TypeScript syntax) -->
<script is:inline>
  document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    button.addEventListener('click', function() {
      alert('Clicked!');
    });
  });
</script>
```

### ❌ Script Tag Mistakes

**NEVER use TypeScript syntax in regular script tags:**

```astro
<!-- WRONG - TypeScript syntax in script tag -->
<script>
  const element = document.getElementById('id') as HTMLInputElement; // ❌ Type assertion
  function handleClick(param: string): void { } // ❌ Type annotations
  const items: string[] = []; // ❌ Type annotation
</script>

<!-- WRONG - CDN script without is:inline -->
<script src="https://cdn.tailwindcss.com"></script> <!-- ❌ Will be processed as ES module -->
<script>
  tailwind.config = { ... }; // ❌ Will fail
</script>
```

## 🔄 Form Handling Patterns

### ✅ Proper Form Handling

```astro
<form id="myForm">
  <select name="status">
    <!-- Use boolean attribute syntax -->
    <option value="draft" selected={item.status === 'draft'}>Draft</option>
    <option value="active" selected={item.status === 'active'}>Active</option>
  </select>
</form>

<script is:inline>
  document.getElementById('myForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Handle success
        window.location.href = '/success-page';
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error occurred');
    }
  });
</script>
```

### ❌ Form Handling Mistakes

```astro
<!-- WRONG - Conditional attribute pattern -->
<option value="draft" {item.status === 'draft' ? 'selected' : ''}>Draft</option>

<!-- WRONG - TypeScript in script tag -->
<script>
  const form = document.getElementById('myForm') as HTMLFormElement; // ❌
  form.addEventListener('submit', (e: Event): void => { // ❌
    // ...
  });
</script>
```

## 🏗️ Database Operations

### ✅ Proper Database Queries

```astro
---
// Type-safe query with proper error handling
const { data: houses, error, count } = await supabase
  .from('houses')
  .select(`
    *,
    provider:providers(id, company_name),
    category:categories(id, name)
  `, { count: 'exact' })
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 9);

if (error) {
  console.error('Database error:', error);
  return Astro.redirect('/error');
}
---
```

### ✅ Proper Insert/Update Operations

```typescript
// Use destructuring instead of delete operations
const { id, created_at, updated_at, ...dataToUpdate } = originalData;

const updateData = {
  ...dataToUpdate,
  name: 'New Name',
  status: 'active' as const
};

const { data, error } = await supabase
  .from('table')
  .upsert(updateData)
  .select()
  .single();
```

### ❌ Database Mistakes

```typescript
// WRONG - Using delete on readonly properties
delete originalData.id; // ❌ Type error
delete originalData.created_at; // ❌ Type error

// WRONG - Missing type safety
const status = 'some_status'; // ❌ Should be typed enum
query = query.eq('status', status); // ❌ Type error
```

## 📦 Metadata and JSON Fields Handling

### ✅ Correct Metadata Field Access

When working with JSON/JSONB columns (like `metadata`, `certifications`), always use type casting:

```astro
---
// In Astro frontmatter
const { data: fabricante } = await supabase
  .from('providers')
  .select('*')
  .single();
---

<!-- Accessing metadata fields in templates -->
<input 
  type="text"
  name="tax_id"
  value={(fabricante.metadata as any)?.tax_id || ''}
/>

<select name="currency">
  <option value="CLP" selected={(fabricante.metadata as any)?.currency === 'CLP'}>CLP</option>
  <option value="USD" selected={(fabricante.metadata as any)?.currency === 'USD'}>USD</option>
</select>

<!-- Handling array fields -->
<textarea>{Array.isArray(fabricante.certifications) ? 
  (fabricante.certifications as string[]).join(', ') : ''}</textarea>
```

### ❌ Metadata Field Mistakes

```astro
<!-- WRONG - Direct access without type casting -->
<input value={fabricante.metadata?.tax_id || ''} /> <!-- ❌ Type error -->

<!-- WRONG - Array methods without type checking -->
<textarea>{fabricante.certifications.join(', ')}</textarea> <!-- ❌ Can fail -->
```

### ✅ Handling Metadata in API Routes

```typescript
// API Route - Handling metadata fields properly
export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const body = await request.json();
  
  // Extract metadata fields
  const metadata = {
    tax_id: body.tax_id,
    contact_person: body.contact_person,
    currency: body.currency || 'CLP',
    kyc_status: body.kyc_status || 'pending',
    commission_rate: body.commission_rate ? parseFloat(body.commission_rate) : null
  };
  
  // Clean up the main data object
  const { tax_id, contact_person, currency, kyc_status, commission_rate, ...mainData } = body;
  
  // Prepare update data
  const updateData = {
    ...mainData,
    metadata,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('providers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
};
```

## 🗄️ Database Field Mapping Issues

### ✅ Common Field Name Corrections

When migrating or updating database schemas, watch for these common field name mismatches:

```typescript
// Common field name mappings
const fieldMappings = {
  // Old name → New name in database
  'experience_years': 'years_experience',
  'commune': 'city',
  'internal_notes': 'admin_notes',
  'contact_name': 'contact_person'
};

// Correct field names in providers table
const correctFields = {
  years_experience: 10,     // NOT experience_years
  city: 'Santiago',          // NOT commune
  admin_notes: 'Note',       // NOT internal_notes
  region: 'Metropolitana',   // Exists in DB
  address: '123 Main St',    // Exists in DB
  website: 'https://...',    // Exists in DB
};

// Fields that should be in metadata JSON
const metadataFields = {
  tax_id: '12.345.678-9',
  contact_person: 'John Doe',
  contact_position: 'Manager',
  currency: 'CLP',
  kyc_status: 'verified',
  commission_rate: 5.0
};
```

### ❌ Common Field Name Mistakes

```typescript
// WRONG - Using old/incorrect field names
const data = {
  experience_years: 10,    // ❌ Should be years_experience
  commune: 'Las Condes',   // ❌ Should be city
  internal_notes: 'Note',  // ❌ Should be admin_notes
  tax_id: '123',          // ❌ Should be in metadata
};
```

## 🌍 String Literal and Special Characters

### ✅ Handling Special Characters in Arrays

```astro
---
// Use double quotes for strings with apostrophes
const chileanRegions = [
  'Arica y Parinacota',
  'Tarapacá',
  'Valparaíso',
  "O'Higgins",  // Double quotes for apostrophe
  'Ñuble',
  'Magallanes y Antártica Chilena'
];

// Or escape the apostrophe
const regions = [
  'O\'Higgins'  // Escaped apostrophe
];
---
```

### ❌ String Literal Mistakes

```astro
---
// WRONG - Unescaped apostrophe in single quotes
const regions = [
  'O'Higgins',  // ❌ Syntax error
];
---
```

## 🔧 Type Safety Best Practices

### ✅ Proper Type Usage

```typescript
import type { 
  ProfileInsert, 
  ProviderInsert, 
  ProfileUpdate 
} from '@/lib/database.types';

// Type your data properly
const profileData: ProfileInsert = {
  user_id: user.id,
  display_name: 'John Doe',
  // ... other required fields
};

// Type search parameters
const status = searchParams.get('status') as 
  'draft' | 'active' | 'inactive' | null;

if (status && ['draft', 'active', 'inactive'].includes(status)) {
  query = query.eq('status', status);
}
```

### ✅ Parameter Validation

```typescript
// Always validate required parameters
const { id } = params;
if (!id) {
  return new Response(JSON.stringify({ error: 'ID is required' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## 📝 Admin Actions Logging

### ✅ Proper Admin Action Logging

```typescript
// Always check if user ID exists before logging
if (auth?.user?.id) {
  await supabase.from('admin_actions').insert({
    admin_id: auth.user.id, // Now guaranteed to be string
    action_type: 'create',
    resource_type: 'house',
    resource_id: newHouse.id,
    details: { name: newHouse.name }
  });
}
```

### ❌ Admin Action Mistakes

```typescript
// WRONG - Can cause undefined error
await supabase.from('admin_actions').insert({
  admin_id: auth?.user?.id, // ❌ Can be undefined
  action_type: 'create',
  // ...
});
```

## 🎨 Component Patterns

### ✅ Proper Component Props

```astro
---
interface Props {
  title: string;
  user?: User;
  items?: Item[];
}

const { title, user, items = [] } = Astro.props;
---

<div>
  <h1>{title}</h1>
  {user && <p>Welcome, {user.name}</p>}
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>
```

## 📝 Form Submission with Metadata Fields

### ✅ Proper Form Handling with Metadata

```javascript
// In script is:inline tag - handling form with metadata fields
document.getElementById('fabricanteForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Handle metadata fields
  const metadata = {
    tax_id: data.tax_id,
    contact_person: data.contact_person,
    contact_position: data.contact_position,
    currency: data.currency || 'CLP',
    kyc_status: data.kyc_status || 'pending',
    commission_rate: data.commission_rate ? parseFloat(data.commission_rate) : null
  };
  
  // Remove metadata fields from main data object
  delete data.tax_id;
  delete data.contact_person;
  delete data.contact_position;
  delete data.currency;
  delete data.kyc_status;
  delete data.commission_rate;
  
  // Add metadata to data
  data.metadata = metadata;
  
  // Parse numeric fields
  ['price_range_min', 'price_range_max', 'years_experience'].forEach(field => {
    if (data[field] && data[field] !== '') {
      data[field] = parseFloat(data[field]);
    }
  });
  
  // Parse array fields
  if (data.coverage_areas) {
    data.coverage_areas = data.coverage_areas.split(',').map(area => area.trim());
  }
  
  try {
    const response = await fetch(`/api/admin/endpoint/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      alert('Updated successfully');
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### ❌ Common Form Submission Mistakes

```javascript
// WRONG - Not handling metadata properly
const data = Object.fromEntries(formData);
// Sending tax_id, contact_person as top-level fields instead of in metadata

// WRONG - Not parsing numeric fields
data.years_experience = formData.get('years_experience'); // String instead of number

// WRONG - Using wrong field names
data.experience_years = formData.get('experience_years'); // Wrong field name
```

## 🔍 Debugging Tips

### Check These Common Issues:

1. **Missing `user` prop in AdminLayout** - Always pass `user={user}`
2. **Wrong Supabase client import** - Use `createSupabaseClient`, not `createServerSupabaseClient`
3. **TypeScript in script tags** - Use plain JavaScript or `is:inline`
4. **Missing request parameter** - API routes need `{ request, cookies }`
5. **Conditional attributes** - Use `selected={condition}` not `{condition ? 'selected' : ''}`
6. **Delete operations** - Use destructuring instead of `delete`
7. **Undefined checks** - Always validate `auth?.user?.id` before using
8. **Metadata field access** - Use `(fabricante.metadata as any)?.field` for JSON columns
9. **Wrong field names** - Check `years_experience` not `experience_years`, `city` not `commune`
10. **Array field handling** - Always check `Array.isArray()` before using array methods
11. **String literals with apostrophes** - Use double quotes for strings like "O'Higgins"
12. **Metadata in forms** - Extract and structure metadata fields separately before API calls

## 🚀 Performance Tips

1. **Batch database queries** when possible
2. **Use select() with specific fields** instead of selecting all
3. **Add proper error handling** for all async operations
4. **Use type-safe enum values** instead of magic strings
5. **Validate input parameters** before processing
6. **Use `is:inline` judiciously** - only when necessary

---

Remember: When in doubt, follow the patterns in CLAUDE.md and refer to this guide for common pitfalls to avoid!