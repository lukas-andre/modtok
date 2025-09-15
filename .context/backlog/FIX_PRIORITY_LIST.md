# MODTOK Admin System - Priority Fix List

## Priority 1: CRITICAL (Blocking Issues) 🔴

### 1.1 Hotspots Page Not Loading
**Location**: `/admin/content/hotspots`
**Issue**: Page completely fails to load (404 or runtime error)
**Tasks**:
- Check Astro file for syntax errors (especially TypeScript in script tags)
- Verify import paths and component references
- Fix authentication pattern if not following standard
- Test page loading and functionality

### 1.2 Provider Creation Enum Error
**Location**: `/admin/catalog/providers`
**Issue**: Cannot create providers - "invalid input value for enum listing_status: 'pending'"
**Root Cause**: Using 'pending' instead of 'pending_review' for status
**Tasks**:
- Fix provider creation form to use correct enum value 'pending_review'
- Verify all status field options match: draft, pending_review, active, inactive, rejected

### 1.3 Missing Column Error for Fabricantes
**Location**: `/admin/catalog/fabricantes`
**Issue**: "Could not find the 'specialty_casas_modulares' column of 'providers'"
**Tasks**:
- Remove references to non-existent specialty columns
- Update queries to use existing 'specialties' array field
- Fix fabricante creation form

## Priority 2: HIGH (Feature Enhancements) 🟠

### 2.1 Providers Multi-Category Support
**Issue**: Providers can only offer one category type
**Current**: Single `category_type` field
**Needed**: Allow providers to offer multiple services (casas, decoración, servicios)
**Tasks**:
- Add migration for provider_categories junction table
- Update provider forms to allow multiple category selection
- Update queries to handle multiple categories
- Ensure backward compatibility

### 2.2 Fabricantes Import Page Missing
**Location**: `/admin/catalog/fabricantes/import`
**Issue**: 404 Not Found
**Tasks**:
- Create import page following houses pattern
- Implement CSV import API endpoint
- Add bulk import functionality

## Priority 3: MEDIUM (Functional Fixes) 🟡

### 3.1 Houses Module Issues
**Location**: `/admin/catalog/houses`
**Issues**:
- Pagination not working
- Edit functionality broken
- Filters not applying
- CSV import failing
**Tasks**:
- Fix pagination logic in DataTable component
- Debug edit page data loading and saving
- Fix filter application in API queries
- Repair CSV import endpoint and validation

### 3.2 Inline Provider Creation
**Location**: Services & Decorations forms
**Issue**: Cannot create provider inline if not exists
**Tasks**:
- Add "Create New Provider" option to provider select
- Implement modal/inline form for quick provider creation
- Link new provider to current item being created

## Priority 4: LOW (UI/UX Improvements) 🟢

### 4.1 Form Field Improvements
**Areas**: All catalog forms
**Issues**: Selectors and input fields need validation
**Tasks**:
- Add proper form validation
- Improve error messages
- Add loading states
- Enhance user feedback

## Database Schema Fixes Required

### Migration 1: Fix Provider Multi-Category Support
```sql
-- Create junction table for provider categories
CREATE TABLE provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  category_type category_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider_id, category_type)
);

-- Migrate existing data
INSERT INTO provider_categories (provider_id, category_type, is_primary)
SELECT id, category_type, true FROM providers;

-- After verification, the category_type column can be deprecated from providers table
```

## Implementation Order

1. **Day 1**: Fix Critical Issues (1.1, 1.2, 1.3)
2. **Day 2**: Implement Provider Multi-Category Support (2.1)
3. **Day 3**: Fix Houses Module (3.1) and Create Missing Import Pages (2.2)
4. **Day 4**: Add Inline Provider Creation (3.2)
5. **Day 5**: UI/UX Improvements (4.1)

## Quick Fixes Checklist

### Immediate Actions:
- [X] Fix enum value from 'pending' to 'pending_review' in provider forms
- [X] Remove references to non-existent columns
- [X] Check all Astro files for TypeScript in script tags (add `is:inline` where needed)
- [X] Verify authentication patterns in all admin pages

### Testing Checklist:
- [ ] Test provider creation with correct enum values
- [ ] Verify hotspots page loads
- [ ] Test houses CRUD operations
- [ ] Verify all import functionalities
- [ ] Test pagination and filters

## Notes

- **Database Sync**: Always check Supabase database for actual column names and enum values
- **Type Generation**: Run `npx supabase gen types typescript --project-id ygetqjqtjhdlbksdpyyr > src/lib/database.types.ts` after schema changes
- **Authentication Pattern**: All admin pages must use `getAdminAuth(Astro)` and `requireAdmin(auth)`
- **Script Tags**: Use `is:inline` for CDN scripts and configuration objects in Astro files

## Support Files Locations

- Database Types: `src/lib/database.types.ts`
- Auth Helpers: `src/lib/auth.ts`
- Supabase Clients: `src/lib/supabase.ts` (server) & `src/lib/supabase-browser.ts` (client)
- Admin Components: `src/components/admin/catalog/`

