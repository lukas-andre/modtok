# 🔐 MODTOK Authentication Flow Testing Guide

This guide provides comprehensive instructions for testing the authentication flow for all user roles in MODTOK. Follow these steps to test each role's complete journey through the system.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [User Roles Overview](#user-roles-overview)
- [Testing Scenarios](#testing-scenarios)
- [SQL Queries & Supabase Triggers](#sql-queries--supabase-triggers)
- [Verification Checklist](#verification-checklist)

---

## Prerequisites

1. **Local Environment Setup**
   ```bash
   pnpm install
   supabase start
   pnpm dev
   ```

2. **Access Points**
   - Application: http://localhost:4321
   - Supabase Studio: http://localhost:54323
   - Email Testing: Check Supabase Inbucket at http://localhost:54324

3. **Available User Roles** (from schema)
   - `super_admin` - Full system access
   - `admin` - Administrative access
   - `editor` - Content management
   - `author` - Blog/content creation
   - `provider` - Company/manufacturer account
   - `user` - Regular buyer/customer (default)

---

## User Roles Overview

### Role Capabilities & Access

| Role | Dashboard Access | Admin Panel | Provider Features | User Features | Content Management |
|------|-----------------|-------------|-------------------|---------------|-------------------|
| `super_admin` | ✅ | ✅ Full | ❌ | ❌ | ✅ |
| `admin` | ✅ | ✅ Limited | ❌ | ❌ | ✅ |
| `editor` | ✅ | ❌ | ❌ | ❌ | ✅ Blog/Content |
| `author` | ✅ | ❌ | ❌ | ❌ | ✅ Own Posts |
| `provider` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `user` | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## Testing Scenarios

### 🧪 Test Case 1: Regular User Registration & Login

**Flow:**
1. Navigate to `/auth/register`
2. Fill in registration form
3. Check email verification
4. Login and access dashboard

**Steps:**
```sql
-- 1. After user registers via UI, verify in Supabase Studio:
SELECT * FROM auth.users WHERE email = 'test-user@example.com';

-- 2. Check profile was created:
SELECT * FROM profiles WHERE email = 'test-user@example.com';

-- 3. Verify default role is 'user':
SELECT id, email, role, status, email_verified, phone_verified 
FROM profiles 
WHERE email = 'test-user@example.com';
```

**Expected Behavior:**
- Redirected to `/dashboard` after login
- Sees user-specific dashboard with:
  - Mis Favoritos
  - Mis Consultas  
  - Mi Perfil

---

### 🧪 Test Case 2: Provider Registration & Onboarding

**Flow:**
1. Register new account at `/auth/register`
2. Convert to provider role
3. Complete provider onboarding
4. Verify phone (if required)

**SQL Setup:**
```sql
-- 1. Create provider account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test-provider@example.com', crypt('Password123!', gen_salt('bf')), NOW());

-- 2. Get the user ID
SELECT id FROM auth.users WHERE email = 'test-provider@example.com';

-- 3. Update profile to provider role
UPDATE profiles 
SET 
  role = 'provider',
  company_name = 'Test Modular Company',
  phone = '+56912345678',
  phone_verified = false,
  email_verified = false
WHERE email = 'test-provider@example.com';

-- 4. Verify provider needs onboarding
SELECT * FROM profiles WHERE email = 'test-provider@example.com';
```

**Expected Behavior:**
- After login, redirected to `/onboarding/provider` (phone not verified)
- Must complete provider onboarding form
- After verification, access provider dashboard with:
  - Mi Empresa
  - Mis Productos
  - Consultas

**Phone Verification Simulation:**
```sql
-- Simulate phone verification completion
UPDATE profiles 
SET phone_verified = true 
WHERE email = 'test-provider@example.com';
```

---

### 🧪 Test Case 3: Admin User Access

**Flow:**
1. Create admin account
2. Login and verify admin panel access
3. Test provider management capabilities

**SQL Setup:**
```sql
-- 1. Create admin user (manually in Supabase)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@modtok.cl', crypt('AdminPass123!', gen_salt('bf')), NOW());

-- 2. Get user ID
SELECT id FROM auth.users WHERE email = 'admin@modtok.cl';

-- 3. Set admin role in profile
INSERT INTO profiles (id, email, full_name, role, status, email_verified, phone_verified)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@modtok.cl'),
  'admin@modtok.cl',
  'Admin User',
  'admin',
  'active',
  true,
  true
);

-- 4. Verify admin setup
SELECT * FROM profiles WHERE email = 'admin@modtok.cl';
```

**Expected Behavior:**
- Access to `/dashboard` with admin panels:
  - Proveedores (manage providers)
  - Usuarios (manage users)
  - Contenido (manage content)
- Can approve/reject provider accounts

---

### 🧪 Test Case 4: Super Admin Full Access

**SQL Setup:**
```sql
-- Create super admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('superadmin@modtok.cl', crypt('SuperAdmin123!', gen_salt('bf')), NOW());

-- Set super_admin role
INSERT INTO profiles (id, email, full_name, role, status, email_verified, phone_verified)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'superadmin@modtok.cl'),
  'superadmin@modtok.cl',
  'Super Admin',
  'super_admin',
  'active',
  true,
  true
);
```

---

### 🧪 Test Case 5: Editor/Author Roles

**SQL Setup for Editor:**
```sql
-- Create editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('editor@modtok.cl', crypt('Editor123!', gen_salt('bf')), NOW());

UPDATE profiles 
SET role = 'editor', email_verified = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'editor@modtok.cl');
```

**SQL Setup for Author:**
```sql
-- Create author
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('author@modtok.cl', crypt('Author123!', gen_salt('bf')), NOW());

UPDATE profiles 
SET role = 'author', email_verified = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'author@modtok.cl');
```

---

## SQL Queries & Supabase Triggers

### 🔧 Useful Monitoring Queries

```sql
-- View all users and their roles
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.email_verified,
  p.phone_verified,
  p.created_at,
  p.last_login_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Check pending provider approvals
SELECT 
  id,
  company_name,
  email,
  phone,
  status,
  created_at
FROM providers
WHERE status = 'pending_review';

-- View recent login activity
SELECT 
  email,
  role,
  last_login_at,
  CASE 
    WHEN last_login_at > NOW() - INTERVAL '1 day' THEN 'Active today'
    WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 'Active this week'
    ELSE 'Inactive'
  END as activity_status
FROM profiles
ORDER BY last_login_at DESC NULLS LAST;

-- Check email verification status
SELECT 
  email,
  role,
  email_verified,
  phone_verified,
  status
FROM profiles
WHERE email_verified = false OR phone_verified = false;
```

### 🔧 Role Management Queries

```sql
-- Promote user to provider
UPDATE profiles 
SET role = 'provider' 
WHERE email = 'user@example.com';

-- Deactivate user account
UPDATE profiles 
SET status = 'inactive' 
WHERE email = 'user@example.com';

-- Bulk verify emails (for testing)
UPDATE profiles 
SET email_verified = true 
WHERE email_verified = false;

-- Reset user for fresh testing
DELETE FROM profiles WHERE email = 'test@example.com';
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### 🔧 Supabase Auth Triggers

To properly test email flows, you need to configure Supabase Auth:

1. **Email Templates** (in Supabase Dashboard):
   - Confirmation Email
   - Password Reset
   - Magic Link

2. **Auth Settings**:
   ```sql
   -- Check auth config
   SELECT * FROM auth.config;
   
   -- View email logs (local dev)
   -- Visit http://localhost:54324 (Inbucket)
   ```

---

## Verification Checklist

### ✅ Registration Flow
- [ ] User can register with email/password
- [ ] Confirmation email is sent
- [ ] Profile is created with correct default role
- [ ] User cannot access dashboard without login
- [ ] Email verification link works

### ✅ Login Flow  
- [ ] Valid credentials allow login
- [ ] Invalid credentials show error
- [ ] Redirects to dashboard after login
- [ ] Session persists on page refresh
- [ ] Logout clears session

### ✅ Role-Based Access
- [ ] Users see only user features
- [ ] Providers see provider dashboard
- [ ] Admins see admin panel
- [ ] Unauthorized routes redirect appropriately
- [ ] Role changes reflect immediately

### ✅ Provider Onboarding
- [ ] Unverified providers redirect to onboarding
- [ ] Phone verification required for providers
- [ ] Company information saved correctly
- [ ] Provider listing created after onboarding

### ✅ Password Reset
- [ ] Forgot password link sends email
- [ ] Reset token is valid
- [ ] New password works for login
- [ ] Old password no longer works

### ✅ Security Checks
- [ ] RLS policies enforce data access
- [ ] Users can only edit own profile
- [ ] Providers can only manage own listings
- [ ] Admin actions are logged

---

## 🐛 Troubleshooting

### Common Issues & Solutions

1. **User created but can't login**
   ```sql
   -- Check if user exists in auth.users
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   
   -- Check if profile exists
   SELECT * FROM profiles WHERE email = 'user@example.com';
   
   -- Manually confirm email
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'user@example.com';
   ```

2. **Provider stuck in onboarding loop**
   ```sql
   -- Check verification status
   SELECT email_verified, phone_verified, role 
   FROM profiles 
   WHERE email = 'provider@example.com';
   
   -- Force verification
   UPDATE profiles 
   SET email_verified = true, phone_verified = true 
   WHERE email = 'provider@example.com';
   ```

3. **Admin panel not showing**
   ```sql
   -- Verify role is exactly 'admin' or 'super_admin'
   SELECT role, status FROM profiles WHERE email = 'admin@example.com';
   
   -- Check for typos in role
   UPDATE profiles 
   SET role = 'admin'  -- Ensure exact match
   WHERE email = 'admin@example.com';
   ```

---

## 📝 Test Data Reset

To start fresh testing:

```sql
-- Clean all test data
DELETE FROM inquiries WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%test%');
DELETE FROM user_favorites WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%test%');
DELETE FROM providers WHERE profile_id IN (SELECT id FROM profiles WHERE email LIKE '%test%');
DELETE FROM profiles WHERE email LIKE '%test%';
DELETE FROM auth.users WHERE email LIKE '%test%';

-- Verify cleanup
SELECT COUNT(*) as test_users FROM auth.users WHERE email LIKE '%test%';
```

---

## 🚀 Quick Start Test Accounts

Copy and run this script to create all test accounts at once:

```sql
-- Create test accounts for each role
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Regular User
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES ('user@test.com', crypt('Test123!', gen_salt('bf')), NOW())
  RETURNING id INTO user_id;
  
  INSERT INTO profiles (id, email, full_name, role, email_verified)
  VALUES (user_id, 'user@test.com', 'Test User', 'user', true);
  
  -- Provider
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES ('provider@test.com', crypt('Test123!', gen_salt('bf')), NOW())
  RETURNING id INTO user_id;
  
  INSERT INTO profiles (id, email, full_name, role, email_verified, phone_verified, company_name)
  VALUES (user_id, 'provider@test.com', 'Test Provider', 'provider', true, true, 'Test Company');
  
  -- Admin
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES ('admin@test.com', crypt('Test123!', gen_salt('bf')), NOW())
  RETURNING id INTO user_id;
  
  INSERT INTO profiles (id, email, full_name, role, email_verified)
  VALUES (user_id, 'admin@test.com', 'Test Admin', 'admin', true);
  
  -- Super Admin
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES ('super@test.com', crypt('Test123!', gen_salt('bf')), NOW())
  RETURNING id INTO user_id;
  
  INSERT INTO profiles (id, email, full_name, role, email_verified)
  VALUES (user_id, 'super@test.com', 'Test Super Admin', 'super_admin', true);
END $$;

-- Verify creation
SELECT email, role, email_verified, phone_verified 
FROM profiles 
WHERE email LIKE '%@test.com'
ORDER BY role;
```

**Test Credentials:**
- Regular User: `user@test.com` / `Test123!`
- Provider: `provider@test.com` / `Test123!`
- Admin: `admin@test.com` / `Test123!`
- Super Admin: `super@test.com` / `Test123!`

---

## 📊 Monitoring Dashboard

Run this query to get a complete overview of your auth system:

```sql
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
  COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_emails,
  COUNT(CASE WHEN phone_verified = true THEN 1 END) as verified_phones,
  COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_week
FROM profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'editor' THEN 3
    WHEN 'author' THEN 4
    WHEN 'provider' THEN 5
    WHEN 'user' THEN 6
  END;
```

---

## 🎯 Next Steps

1. Test each role systematically using the provided SQL scripts
2. Document any issues or unexpected behaviors
3. Verify RLS policies are working correctly
4. Test edge cases (expired tokens, simultaneous logins, etc.)
5. Performance test with multiple concurrent users

Remember to check the Supabase logs and browser console for any errors during testing!