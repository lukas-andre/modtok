-- =============================================
-- PROFILE CREATION TRIGGER
-- =============================================
-- This trigger automatically creates a profile when a new user signs up

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        role,
        status,
        email_verified,
        phone_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
        'active'::user_status,
        COALESCE((NEW.email_confirmed_at IS NOT NULL), false),
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = CASE 
            WHEN profiles.full_name IS NULL OR profiles.full_name = '' 
            THEN EXCLUDED.full_name 
            ELSE profiles.full_name 
        END,
        phone = CASE 
            WHEN profiles.phone IS NULL 
            THEN EXCLUDED.phone 
            ELSE profiles.phone 
        END,
        email_verified = EXCLUDED.email_verified,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger for when users are updated (e.g., email confirmed)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update email_verified status when email is confirmed
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        UPDATE public.profiles
        SET 
            email_verified = true,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    -- Update email if it changes
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.profiles
        SET 
            email = NEW.email,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create profiles for any existing users that don't have one
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    status,
    email_verified,
    phone_verified,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    u.raw_user_meta_data->>'phone',
    COALESCE((u.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    'active'::user_status,
    (u.email_confirmed_at IS NOT NULL),
    false,
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;