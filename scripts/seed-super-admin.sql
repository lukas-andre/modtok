-- MODTOK Super Admin Seeding Script (SQL Version)
-- This creates a super admin user directly in the database
-- 
-- IMPORTANT: You need to run this with Supabase's auth.users table access
-- This is typically done via the Supabase Dashboard SQL Editor or with service role access

-- Step 1: Insert into auth.users (this requires service role or dashboard access)
-- Replace 'your-uuid-here' with a generated UUID
-- Replace 'your-encrypted-password-hash' with properly hashed password

-- Note: For production, you should use the JavaScript version (seed-super-admin.js) 
-- which properly handles password hashing and auth user creation

-- This is just for reference/manual creation if needed:

-- Check if user already exists first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'super@modtok.cl') THEN
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          role,
          aud
        ) VALUES (
          'd9df4870-d552-487f-b9cf-5f18e8664744',
          '87388c25-a9c2-44eb-bd2b-5421a3e4ad12',
          'super@modtok.cl',
          crypt('SuperAdmin1234', gen_salt('bf')),
          now(),
          now(),
          now(),
          'authenticated',
          'authenticated'
        );
    END IF;
END $$;

-- Step 2: Create/update the profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  status,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'd9df4870-d552-487f-b9cf-5f18e8664744', -- Must match auth.users.id
  'super@modtok.cl',
  'Super Administrator',
  'super_admin',
  'active',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  full_name = EXCLUDED.full_name,
  email_verified = true,
  status = 'active',
  updated_at = now();

-- Step 3: Log the creation
INSERT INTO public.admin_actions (
  admin_id,
  action_type,
  target_type,
  target_id,
  changes,
  created_at
) VALUES (
  'd9df4870-d552-487f-b9cf-5f18e8664744',
  'create',
  'super_admin',
  'd9df4870-d552-487f-b9cf-5f18e8664744',
  '{"created_super_admin": true, "email": "super@modtok.cl", "method": "sql_seed"}',
  now()
);

-- Verification query - run this to confirm creation
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.email_verified,
  p.created_at
FROM public.profiles p 
WHERE p.role = 'super_admin' 
ORDER BY p.created_at DESC;