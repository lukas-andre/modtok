#!/usr/bin/env node

/**
 * MODTOK Super Admin Seeding Script
 * 
 * This script creates the initial super admin user for the MODTOK CMS system.
 * It uses Supabase Admin API to create the user directly in the auth system.
 * 
 * Usage:
 * node scripts/seed-super-admin.js
 * 
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (not anon key!)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Super admin credentials
const SUPER_ADMIN = {
  email: 'super@modtok.cl',
  password: 'SuperAdmin2024!', // Change this in production!
  full_name: 'Super Administrator',
  role: 'super_admin'
};

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   - PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedSuperAdmin() {
  console.log('🌱 Starting super admin seeding process...');
  console.log(`📧 Email: ${SUPER_ADMIN.email}`);

  try {
    // Check if super admin already exists
    console.log('🔍 Checking if super admin already exists...');
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', SUPER_ADMIN.email)
      .eq('role', 'super_admin')
      .single();

    if (existingProfile) {
      console.log('⚠️  Super admin already exists!');
      console.log(`   Name: ${existingProfile.full_name}`);
      console.log(`   Email: ${existingProfile.email}`);
      console.log(`   Created: ${new Date(existingProfile.created_at).toLocaleString()}`);
      return;
    }

    // Create the auth user
    console.log('👤 Creating auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: SUPER_ADMIN.email,
      password: SUPER_ADMIN.password,
      email_confirm: true,
      user_metadata: {
        full_name: SUPER_ADMIN.full_name,
        role: SUPER_ADMIN.role
      }
    });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    console.log('✅ Auth user created successfully');
    console.log(`   User ID: ${authUser.user.id}`);

    // Update the profile with super admin role
    console.log('📝 Updating user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: SUPER_ADMIN.full_name,
        role: SUPER_ADMIN.role,
        email_verified: true,
        status: 'active'
      })
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to update profile:', profileError.message);
      // Try to clean up the auth user
      console.log('🧹 Cleaning up auth user...');
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Profile creation failed, auth user cleaned up');
    }

    console.log('✅ Profile updated successfully');
    
    // Log admin action
    console.log('📊 Logging admin action...');
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: authUser.user.id,
        action_type: 'create',
        target_type: 'super_admin',
        target_id: authUser.user.id,
        changes: {
          created_super_admin: true,
          email: SUPER_ADMIN.email,
          full_name: SUPER_ADMIN.full_name
        }
      });

    console.log('\n🎉 Super admin created successfully!');
    console.log('📋 Login credentials:');
    console.log(`   Email: ${SUPER_ADMIN.email}`);
    console.log(`   Password: ${SUPER_ADMIN.password}`);
    console.log(`   Login URL: ${SUPABASE_URL.replace('supabase.co', 'supabase.co')}/auth/login`);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    console.log('🔗 Access the super admin dashboard at: /admin/super');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedSuperAdmin();