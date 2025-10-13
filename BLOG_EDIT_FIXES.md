# 🔧 Blog/Noticias Edit Form Fixes

**Date:** 2025-10-13 00:33 CLT
**Status:** ✅ FIXED

---

## Problems Fixed

### 1. ✅ Layout Import Error (Blog/Noticias View Pages)

**Error:** `Cannot find module '@/layouts/MainLayout.astro'`

**Files Affected:**
- `src/pages/blog/[slug].astro`
- `src/pages/blog/index.astro`
- `src/pages/noticias/[slug].astro`
- `src/pages/noticias/index.astro`

**Fix Applied:**
Changed all layout imports from `MainLayout` to `BaseLayout`:

```astro
<!-- Before -->
import MainLayout from '@/layouts/MainLayout.astro';

<!-- After -->
import BaseLayout from '@/layouts/BaseLayout.astro';
```

**Result:** Blog and news posts now load correctly on the frontend ✅

---

### 2. ✅ Invalid Column 'post_id' Error

**Error:** `Could not find the 'post_id' column of 'blog_posts' in the schema cache`

**File:** `src/pages/admin/content/blog/[id]/edit.astro` (Line 64)

**Root Cause:** Hidden input field name didn't match database column name

**Fix Applied:**
```html
<!-- Before -->
<input type="hidden" id="post_id" name="post_id" value={post.id}>

<!-- After -->
<input type="hidden" id="post_id" name="id" value={post.id}>
```

**Result:** Post ID now correctly sent to update API ✅

---

### 3. ✅ Invalid Schedule Fields Error

**Error:** `Could not find the 'schedule_date' column of 'blog_posts' in the schema cache`

**File:** `src/pages/admin/content/blog/[id]/edit.astro` (Lines 737-740)

**Root Cause:** Form was sending UI-only fields that don't exist in database:
- `schedule_publish` (checkbox for enabling scheduling)
- `schedule_date` (date input)
- `schedule_time` (time input)

**Fix Applied:**
Added field filtering in `updatePost()` function before sending to API:

```javascript
// Remove fields that don't exist in database
delete data.schedule_publish;
delete data.schedule_date;
delete data.schedule_time;

const response = await fetch(`/api/admin/blog/${postId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**Result:** Update API only receives valid database fields ✅

---

## Database Schema Notes

The `blog_posts` table does NOT have these columns:
- ❌ `schedule_publish`
- ❌ `schedule_date`
- ❌ `schedule_time`

These are frontend-only fields for UX purposes. If scheduling functionality is needed in the future, add a migration to include these columns.

---

## Testing Checklist

- [x] Blog post creation works without RLS errors
- [x] Blog posts can be viewed on frontend (layout fixed)
- [x] Blog posts can be updated without schema errors
- [x] News posts can be viewed on frontend (layout fixed)
- [x] Form fields correctly map to database columns
- [x] Schedule UI elements don't break form submission

---

## Dev Server Status

✅ Running on: http://localhost:4323/
✅ No errors in console
✅ All blog/noticias routes functional

---

*Fixed: 2025-10-13 00:33 CLT*
