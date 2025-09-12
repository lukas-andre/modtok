# 🔐 Super Admin Setup Instructions

This document provides instructions for setting up the initial super admin user for the MODTOK CMS system.

## 📋 Prerequisites

- Supabase project with the MODTOK schema deployed
- Access to Supabase Dashboard or Service Role Key
- Node.js environment (if using the script method)

## 🚀 Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create Auth User via Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** 
4. Fill in the details:
   - **Email**: `super@modtok.cl`
   - **Password**: `SuperAdmin2024!` (change this!)
   - **Auto Confirm User**: ✅ Enabled

### Step 2: Update User Role via SQL Editor

1. Go to **SQL Editor** in your Supabase Dashboard
2. Run this query to update the user's role:

```sql
-- Get the user ID first
SELECT id, email FROM auth.users WHERE email = 'super@modtok.cl';

-- Update the profile with super admin role (replace USER_ID_HERE with actual ID)
UPDATE profiles 
SET 
  role = 'super_admin',
  full_name = 'Super Administrator',
  email_verified = true,
  status = 'active',
  updated_at = now()
WHERE id = 'USER_ID_HERE';

-- Verify the update
SELECT id, email, full_name, role, status 
FROM profiles 
WHERE role = 'super_admin';
```

## 🛠️ Method 2: Using the Seeding Script

### Step 1: Set Environment Variables

Make sure your `.env` file has:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Run the Seeding Script

```bash
# Install dependencies if not already installed
npm install @supabase/supabase-js dotenv

# Run the seeding script
node scripts/seed-super-admin.js
```

## 🔍 Method 3: Manual SQL Creation (Advanced)

If you have direct database access, you can run the SQL in `scripts/seed-super-admin.sql`, but you'll need to:

1. Generate a proper UUID
2. Hash the password using bcrypt
3. Insert into both `auth.users` and `public.profiles`

## ✅ Verification

After creating the super admin, verify the setup:

```sql
-- Check that super admin exists and has correct role
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  email_verified,
  created_at
FROM profiles 
WHERE role = 'super_admin';
```

## 🔐 Login Credentials

**Default credentials** (change immediately after first login):

- **Email**: `super@modtok.cl`  
- **Password**: `SuperAdmin2024!`
- **Login URL**: `https://your-domain.com/auth/login`
- **Admin Dashboard**: `https://your-domain.com/admin/super`

## 🔧 Post-Setup Tasks

After creating the super admin:

1. **Change the default password**
2. **Update the email** if using a different domain
3. **Create additional admin users** via the super admin dashboard
4. **Test the admin authentication** flow

## 🚨 Security Notes

- **Never** commit real passwords to version control
- Use strong, unique passwords in production
- Consider enabling 2FA for admin accounts
- Regularly rotate admin passwords
- Monitor admin activity via the `admin_actions` table

## 🐛 Troubleshooting

### "Profile not found" Error
- Ensure the auth user was created successfully
- Check that the profile trigger fired (there should be a profile record)
- Manually update the profile role if needed

### "Unauthorized" Error  
- Check that RLS policies allow super_admin access
- Verify the user's role in the profiles table
- Clear browser cookies and try again

### Authentication Issues
- Verify Supabase environment variables
- Check that email confirmation is enabled
- Ensure the user's email_confirmed_at is set

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase Auth logs
3. Verify database schema and migrations
4. Check RLS policies are correctly configured

---

**Remember**: After setup, the super admin can create additional admin users through the web interface at `/admin/super/admins/create`.