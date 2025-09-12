-- MODTOK Super Admin Seeding Script (Simplified SQL Version)
-- This script is designed to be run in Supabase Dashboard SQL Editor
-- 
-- IMPORTANT: This only creates the profile record. You'll need to create 
-- the auth user separately through Supabase Dashboard or use the JS script.

-- Method 1: Use this if you've already created the auth user via Supabase Dashboard
-- Replace 'your-auth-user-id-here' with the actual UUID from auth.users

-- First, let's see what auth users exist (if any)
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- If you have an auth user, update its profile to be super admin
-- REPLACE THE ID BELOW with your actual auth user ID
-- UPDATE public.profiles 
-- SET 
--   role = 'super_admin',
--   full_name = 'Super Administrator',
--   email_verified = true,
--   status = 'active',
--   updated_at = now()
-- WHERE id = 'your-auth-user-id-here';

-- Method 2: If no auth user exists, use Supabase Dashboard to create one:
-- 1. Go to Authentication -> Users in Supabase Dashboard
-- 2. Click "Add User"
-- 3. Enter email: super@modtok.cl
-- 4. Enter password: SuperAdmin1234
-- 5. Check "Auto Confirm User"
-- 6. Click "Create User"
-- 7. Then run the profile update above with the new user's ID

-- After creating/updating the profile, log the action
-- REPLACE THE ID BELOW with your actual user ID
-- INSERT INTO public.admin_actions (
--   admin_id,
--   action_type,
--   target_type,
--   target_id,
--   changes,
--   created_at
-- ) VALUES (
--   'your-auth-user-id-here',
--   'create',
--   'super_admin',
--   'your-auth-user-id-here',
--   '{"created_super_admin": true, "email": "super@modtok.cl", "method": "dashboard_sql"}',
--   now()
-- );

-- Verification: Check if super admin was created successfully
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.email_verified,
  p.created_at,
  u.email as auth_email,
  u.email_confirmed_at
FROM public.profiles p 
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'super_admin' 
ORDER BY p.created_at DESC;