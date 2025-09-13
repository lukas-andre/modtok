# 📦 MODTOK Catalog Management System

## Overview

Complete enterprise-grade catalog management system for MODTOK marketplace, supporting Houses, Services, and Decorations with full CRUD operations, bulk import/export, and advanced features.

## 🏗️ Architecture

### Database Structure

```sql
-- Main catalog tables
houses            -- Modular houses catalog
services          -- Services catalog
decorations       -- Decoration products catalog
providers         -- Manufacturers and service providers

-- Supporting tables
product_variants  -- Product variations (colors, sizes, etc.)
import_logs       -- Bulk import operation logs
comparison_lists  -- User product comparisons
house_topologies  -- House configurations (2B1B, 3B2B, etc.)
features          -- Filterable attributes per category
```

### Key Database Enhancements

#### Houses Table Extensions
- `sku` - Stock keeping unit
- `stock_quantity` - Available stock
- `stock_status` - in_stock, low_stock, out_of_stock, pre_order
- `is_available` - Product availability flag
- `has_variants` - Variant support flag
- `variant_attributes` - JSON variant configuration
- `parent_house_id` - For variant relationships
- `sales_count` - Sales tracking

#### Services Table Extensions
- `sku` - Service identifier
- `is_available` - Service availability
- `max_bookings` - Booking limits
- `current_bookings` - Active bookings
- `booking_calendar` - Availability calendar
- `sales_count` - Service sales tracking

#### New Decorations Table
Complete product catalog for decoration items with:
- Full pricing management (retail, wholesale, discounts)
- Stock management
- Variant support
- Installation tracking
- Multi-media support

## 🧩 Reusable Components

### 1. DataTable Component
**Location:** `src/components/admin/catalog/DataTable.tsx`

**Features:**
- Server-side pagination
- Multi-column sorting
- Advanced filtering
- Bulk selection
- Row actions (view, edit, duplicate, delete)
- Export functionality
- Responsive design

**Usage:**
```tsx
<DataTable
  data={houses}
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', render: (val) => formatCurrency(val) }
  ]}
  onEdit={(item) => handleEdit(item)}
  onDelete={(item) => handleDelete(item)}
  searchable={true}
  selectable={true}
/>
```

### 2. ImageGalleryManager Component
**Location:** `src/components/admin/catalog/ImageGalleryManager.tsx`

**Features:**
- Drag & drop upload
- Multiple image support
- Main image selection
- Drag to reorder
- Paste from clipboard
- URL import
- Image preview modal
- Upload progress tracking

**Usage:**
```tsx
<ImageGalleryManager
  images={galleryImages}
  mainImage={mainImageUrl}
  onImagesChange={(images) => setGalleryImages(images)}
  onMainImageChange={(main) => setMainImageUrl(main)}
  maxImages={10}
  maxSizeMB={5}
/>
```

### 3. SpecificationBuilder Component
**Location:** `src/components/admin/catalog/SpecificationBuilder.tsx`

**Features:**
- Dynamic specification categories
- Pre-defined templates
- Custom field types (text, number, boolean, select)
- Import/export specifications
- Collapsible categories
- Unit support

**Usage:**
```tsx
<SpecificationBuilder
  specifications={specs}
  onChange={(newSpecs) => setSpecs(newSpecs)}
  predefinedCategories={['Dimensions', 'Materials', 'Energy']}
  predefinedSpecs={templateSpecs}
/>
```

### 4. BulkImport Component
**Location:** `src/components/admin/catalog/BulkImport.tsx`

**Features:**
- CSV/Excel file support
- 4-step wizard interface
- Column mapping
- Data transformation
- Validation & error reporting
- Template download
- Import history

**Usage:**
```tsx
<BulkImport
  entityType="houses"
  onImport={handleBulkImport}
  availableFields={houseFields}
  sampleCsvUrl="/templates/houses.csv"
/>
```

## 📄 Page Structure

### Catalog List Page Pattern
**Example:** `/admin/catalog/houses/index.astro`

**Key Elements:**
1. Header with title and actions
2. Filter bar with search and dropdowns
3. Data table with pagination
4. Bulk actions toolbar
5. Quick actions per row

### Create/Edit Form Pattern
**Example:** `/admin/catalog/houses/create.astro`

**Sections:**
1. Basic Information
2. Specifications & Dimensions
3. Pricing & Stock
4. Features & Characteristics
5. Image Gallery
6. Delivery & Location
7. SEO & Metadata
8. Status & Publishing

## 🔌 API Endpoints

### Standard CRUD Pattern

```typescript
// List & Create
GET    /api/admin/{entity}        // List with filters
POST   /api/admin/{entity}        // Create new

// Individual Operations
GET    /api/admin/{entity}/[id]   // Get single
PUT    /api/admin/{entity}/[id]   // Update
DELETE /api/admin/{entity}/[id]   // Delete

// Special Operations
POST   /api/admin/{entity}/[id]/duplicate  // Duplicate
POST   /api/admin/{entity}/import          // Bulk import
GET    /api/admin/{entity}/export          // Export template
PUT    /api/admin/{entity}/bulk            // Bulk update
DELETE /api/admin/{entity}/bulk            // Bulk delete
```

### Query Parameters

```typescript
// Filtering
?status=active
?tier=premium
?provider_id=uuid
?search=keyword

// Pagination
?page=1
?limit=10

// Sorting
?sort=created_at
?order=desc
```

## 🚀 Implementation Guide

### Adding a New Catalog Type (e.g., Decorations)

1. **Create Database Migration**
```sql
CREATE TABLE decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  -- Add specific fields
);
```

2. **Create List Page**
Copy and modify: `src/pages/admin/catalog/houses/index.astro`
- Update queries to use decorations table
- Adjust columns for decoration-specific fields
- Update filter options

3. **Create Form Page**
Copy and modify: `src/pages/admin/catalog/houses/create.astro`
- Update form fields
- Adjust validation rules
- Customize sections

4. **Create API Endpoints**
Copy and modify: `src/pages/api/admin/houses/`
- Update table references
- Adjust field validation
- Add specific business logic

5. **Add Navigation**
Update admin layout to include new catalog section

## 🔒 Security & Permissions

### Authentication Check
```typescript
const session = await getSession(Astro);
if (!session || !['super_admin', 'admin'].includes(session.user.role)) {
  return Astro.redirect('/admin/login');
}
```

### API Protection
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401
  });
}
```

### Audit Trail
All operations are logged to `admin_actions` table:
```typescript
await supabase.from('admin_actions').insert({
  admin_id: user.id,
  action_type: 'create|update|delete',
  target_type: 'house|service|decoration',
  target_id: item.id,
  changes: { /* before/after values */ }
});
```

## 📊 Features Matrix

| Feature | Houses | Services | Decorations |
|---------|--------|----------|-------------|
| Basic CRUD | ✅ | 🔄 | 🔄 |
| Bulk Import | ✅ | 🔄 | 🔄 |
| Image Gallery | ✅ | 🔄 | 🔄 |
| Specifications | ✅ | 🔄 | 🔄 |
| Stock Management | ✅ | ✅ | ✅ |
| Variants | ✅ | ❌ | ✅ |
| Pricing Tiers | ✅ | ✅ | ✅ |
| SEO Management | ✅ | ✅ | ✅ |
| Audit Trail | ✅ | ✅ | ✅ |
| Comparison | 🔄 | 🔄 | 🔄 |

Legend: ✅ Complete | 🔄 In Progress | ❌ Not Applicable

## 🎯 Best Practices

### 1. Type Safety
Always use TypeScript types from database:
```typescript
import type { HouseInsert, ServiceUpdate } from '@/lib/database.types';
```

### 2. Error Handling
Consistent error responses:
```typescript
try {
  // operation
} catch (error) {
  return new Response(JSON.stringify({ 
    error: error.message || 'Operation failed' 
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 3. Data Validation
Validate before database operations:
```typescript
if (!body.name || !body.provider_id) {
  return new Response(JSON.stringify({ 
    error: 'Missing required fields' 
  }), { status: 400 });
}
```

### 4. Slug Generation
Auto-generate URL-friendly slugs:
```typescript
const slug = name
  .toLowerCase()
  .replace(/[áàäâã]/g, 'a')
  .replace(/[éèëê]/g, 'e')
  .replace(/[íìïî]/g, 'i')
  .replace(/[óòöôõ]/g, 'o')
  .replace(/[úùüû]/g, 'u')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
```

### 5. Numeric Field Conversion
Handle form data properly:
```typescript
const numericFields = ['price', 'stock_quantity', 'area_m2'];
numericFields.forEach(field => {
  if (body[field] !== undefined && body[field] !== '') {
    body[field] = parseFloat(body[field]) || null;
  }
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Import Fails Silently**
   - Check `import_logs` table for detailed errors
   - Verify CSV column headers match exactly
   - Ensure required fields are present

2. **Images Not Uploading**
   - Check file size limits (default 5MB)
   - Verify accepted formats (JPG, PNG, WebP)
   - Check Supabase storage bucket permissions

3. **Duplicate Slug Errors**
   - System auto-appends timestamp for uniqueness
   - Check for existing slugs before insert

4. **Missing Provider Dropdown**
   - Ensure providers have `status = 'active'`
   - Check `category_type` matches

## 📈 Performance Optimization

### Database Indexes
Ensure these indexes exist:
```sql
CREATE INDEX idx_houses_provider ON houses(provider_id);
CREATE INDEX idx_houses_status ON houses(status);
CREATE INDEX idx_houses_slug ON houses(slug);
CREATE INDEX idx_houses_tier ON houses(tier);
```

### Query Optimization
Use selective queries:
```typescript
// Good - Select only needed fields
.select('id, name, price, status')

// Bad - Select everything
.select('*')
```

### Pagination
Always paginate large datasets:
```typescript
const limit = 10;
const offset = (page - 1) * limit;
query.range(offset, offset + limit - 1);
```

## 🚦 Status Workflow

### Product Status Flow
```
draft → pending_review → active → inactive
         ↓
      rejected
```

### Stock Status Logic
```typescript
if (quantity === 0) status = 'out_of_stock';
else if (quantity < 5) status = 'low_stock';
else status = 'in_stock';
```

## 🔮 Future Enhancements

- [ ] Real-time stock synchronization
- [ ] Advanced pricing rules engine
- [ ] Multi-language support
- [ ] Bulk image optimization
- [ ] AI-powered description generation
- [ ] Advanced analytics dashboard
- [ ] Mobile app for catalog management
- [ ] Webhook integrations
- [ ] Version control for products
- [ ] A/B testing for listings

## 📚 Related Documentation

- [Supabase Documentation](https://supabase.io/docs)
- [Astro Documentation](https://docs.astro.build)
- [React Components Guide](./REACT_COMPONENTS.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)