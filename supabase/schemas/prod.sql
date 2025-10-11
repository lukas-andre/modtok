


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."category_type" AS ENUM (
    'fabrica',
    'casas',
    'habilitacion_servicios'
);


ALTER TYPE "public"."category_type" OWNER TO "postgres";


CREATE TYPE "public"."content_status" AS ENUM (
    'draft',
    'pending_review',
    'published',
    'archived'
);


ALTER TYPE "public"."content_status" OWNER TO "postgres";


CREATE TYPE "public"."feature_data_type" AS ENUM (
    'boolean',
    'number',
    'text',
    'text_array',
    'json'
);


ALTER TYPE "public"."feature_data_type" OWNER TO "postgres";


CREATE TYPE "public"."filter_type" AS ENUM (
    'checklist',
    'slider',
    'checkbox',
    'radio',
    'select'
);


ALTER TYPE "public"."filter_type" OWNER TO "postgres";


CREATE TYPE "public"."listing_status" AS ENUM (
    'draft',
    'pending_review',
    'active',
    'inactive',
    'rejected'
);


ALTER TYPE "public"."listing_status" OWNER TO "postgres";


CREATE TYPE "public"."listing_tier" AS ENUM (
    'premium',
    'destacado',
    'standard'
);


ALTER TYPE "public"."listing_tier" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'super_admin',
    'admin',
    'provider',
    'user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_verification'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        input_text,
                        '[áàäâã]', 'a', 'g'
                    ),
                    '[éèëê]', 'e', 'g'
                ),
                '[íìïî]', 'i', 'g'
            ),
            '[^a-z0-9\-]', '-', 'g'
        )
    );
END;
$$;


ALTER FUNCTION "public"."generate_slug"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_feature_value"("p_features" "jsonb", "p_group" "text", "p_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN p_features -> p_group -> p_key;
END;
$$;


ALTER FUNCTION "public"."get_feature_value"("p_features" "jsonb", "p_group" "text", "p_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_providers_by_category"("p_category" "public"."category_type", "p_status" "public"."listing_status" DEFAULT NULL::"public"."listing_status", "p_tier" "public"."listing_tier" DEFAULT NULL::"public"."listing_tier") RETURNS TABLE("id" "uuid", "company_name" "text", "slug" "text", "email" "text", "phone" "text", "status" "public"."listing_status", "tier" "public"."listing_tier", "categories" "public"."category_type"[])
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.company_name,
    p.slug,
    p.email,
    p.phone,
    p.status,
    p.tier,
    array_agg(DISTINCT pc.category ORDER BY pc.category) as categories
  FROM providers p
  INNER JOIN provider_categories pc ON pc.provider_id = p.id
  WHERE pc.category = p_category
    AND (p_status IS NULL OR p.status = p_status)
    AND (p_tier IS NULL OR p.tier = p_tier)
  GROUP BY p.id;
END;
$$;


ALTER FUNCTION "public"."get_providers_by_category"("p_category" "public"."category_type", "p_status" "public"."listing_status", "p_tier" "public"."listing_tier") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        'active'::public.user_status,
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_user_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role = ANY(ARRAY['super_admin'::user_role, 'admin'::user_role])
    );
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_admin_action"("p_admin_id" "uuid", "p_action_type" "text", "p_target_type" "text", "p_target_id" "uuid", "p_changes" "jsonb" DEFAULT '{}'::"jsonb", "p_ip_address" "inet" DEFAULT NULL::"inet") RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
    INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, changes, ip_address)
    VALUES (p_admin_id, p_action_type, p_target_type, p_target_id, p_changes, p_ip_address)
    RETURNING id;
$$;


ALTER FUNCTION "public"."log_admin_action"("p_admin_id" "uuid", "p_action_type" "text", "p_target_type" "text", "p_target_id" "uuid", "p_changes" "jsonb", "p_ip_address" "inet") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_providers_by_feature"("p_category" "public"."category_type", "p_group" "text", "p_key" "text", "p_value" boolean) RETURNS TABLE("id" "uuid", "company_name" "text", "slug" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.company_name,
    p.slug
  FROM providers p
  WHERE p.primary_category = p_category
    AND (p.features -> p_group ->> p_key)::boolean = p_value;
END;
$$;


ALTER FUNCTION "public"."search_providers_by_feature"("p_category" "public"."category_type", "p_group" "text", "p_key" "text", "p_value" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_provider_category"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- When category_type changes in providers table, sync with junction table
  IF TG_OP = 'UPDATE' AND OLD.category_type IS DISTINCT FROM NEW.category_type THEN
    -- Remove old category if exists
    IF OLD.category_type IS NOT NULL THEN
      DELETE FROM provider_categories 
      WHERE provider_id = NEW.id AND category_type = OLD.category_type;
    END IF;
    
    -- Add new category as primary
    IF NEW.category_type IS NOT NULL THEN
      INSERT INTO provider_categories (provider_id, category_type, is_primary)
      VALUES (NEW.id, NEW.category_type, true)
      ON CONFLICT (provider_id, category_type) 
      DO UPDATE SET is_primary = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_provider_category"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_provider_category_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.primary_category IS NOT NULL THEN
    INSERT INTO provider_categories (provider_id, category, is_primary)
    VALUES (NEW.id, NEW.primary_category, true);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_provider_category_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_view_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Increment view counter
    IF TG_TABLE_NAME = 'houses' THEN
        UPDATE houses SET views_count = views_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_TABLE_NAME = 'providers' THEN
        UPDATE providers SET views_count = views_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_TABLE_NAME = 'services' THEN
        UPDATE services SET views_count = views_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_TABLE_NAME = 'blog_posts' THEN
        UPDATE blog_posts SET views_count = views_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_view_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid",
    "changes" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "event_type" "text" NOT NULL,
    "event_category" "text",
    "event_action" "text",
    "event_label" "text",
    "event_value" numeric,
    "target_type" "text",
    "target_id" "uuid",
    "page_url" "text",
    "referrer_url" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "device_type" "text",
    "browser" "text",
    "os" "text",
    "country" "text",
    "region" "text",
    "city" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid",
    "editor_id" "uuid",
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "excerpt" "text",
    "content" "text" NOT NULL,
    "featured_image_url" "text",
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "public"."content_status" DEFAULT 'draft'::"public"."content_status",
    "published_at" timestamp with time zone,
    "meta_title" "text",
    "meta_description" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "views_count" integer DEFAULT 0,
    "likes_count" integer DEFAULT 0,
    "shares_count" integer DEFAULT 0,
    "reading_time_minutes" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "public"."category_type" NOT NULL,
    "group_name" "text" NOT NULL,
    "feature_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "display_order" integer DEFAULT 0,
    "data_type" "public"."feature_data_type" NOT NULL,
    "validation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "default_value" "jsonb",
    "is_filterable" boolean DEFAULT false,
    "filter_type" "public"."filter_type",
    "filter_location" "text",
    "filter_format" "text",
    "show_in_card_standard" boolean DEFAULT false,
    "show_in_card_destacado" boolean DEFAULT false,
    "show_in_card_premium" boolean DEFAULT false,
    "show_in_landing" boolean DEFAULT false,
    "requires_login" boolean DEFAULT false,
    "admin_input_type" "text",
    "admin_helper_text" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."feature_definitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."feature_definitions" IS 'Metadata completa de 123 features dinámicas por categoría. Define qué campos mostrar en cada tier y cómo filtrarlos.';



CREATE TABLE IF NOT EXISTS "public"."house_topologies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "bedrooms" integer NOT NULL,
    "bathrooms" numeric NOT NULL,
    "description" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."house_topologies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."houses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "model_code" "text",
    "sku" "text",
    "description" "text",
    "description_long" "text",
    "tier" "public"."listing_tier" DEFAULT 'standard'::"public"."listing_tier",
    "status" "public"."listing_status" DEFAULT 'active'::"public"."listing_status",
    "topology_code" "text",
    "bedrooms" integer,
    "bathrooms" numeric,
    "area_m2" numeric,
    "floors" integer DEFAULT 1,
    "price" numeric,
    "price_opportunity" numeric,
    "price_per_m2" numeric,
    "currency" "text" DEFAULT 'CLP'::"text",
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "main_image_url" "text",
    "gallery_images" "text"[] DEFAULT '{}'::"text"[],
    "floor_plans" "text"[] DEFAULT '{}'::"text"[],
    "videos" "text"[] DEFAULT '{}'::"text"[],
    "virtual_tour_url" "text",
    "brochure_pdf_url" "text",
    "location_city" "text",
    "location_region" "text",
    "latitude" numeric,
    "longitude" numeric,
    "delivery_time_days" integer,
    "assembly_time_days" integer,
    "warranty_years" integer,
    "meta_title" "text",
    "meta_description" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "stock_quantity" integer DEFAULT 0,
    "stock_status" "text" DEFAULT 'available'::"text",
    "is_available" boolean DEFAULT true,
    "has_variants" boolean DEFAULT false,
    "variant_attributes" "jsonb" DEFAULT '{}'::"jsonb",
    "parent_house_id" "uuid",
    "views_count" integer DEFAULT 0,
    "clicks_count" integer DEFAULT 0,
    "saves_count" integer DEFAULT 0,
    "inquiries_count" integer DEFAULT 0,
    "sales_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."houses" OWNER TO "postgres";


COMMENT ON TABLE "public"."houses" IS 'Catálogo de casas ofrecidas por las fábricas';



CREATE TABLE IF NOT EXISTS "public"."inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "provider_id" "uuid",
    "item_type" "text",
    "item_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "message" "text",
    "project_location" "text",
    "budget_min" numeric,
    "budget_max" numeric,
    "timeline" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "provider_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "avatar_url" "text",
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role",
    "status" "public"."user_status" DEFAULT 'active'::"public"."user_status",
    "company_name" "text",
    "rut" "text",
    "bio" "text",
    "website" "text",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "email_verified" boolean DEFAULT false,
    "phone_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provider_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "category" "public"."category_type" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."provider_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "company_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "primary_category" "public"."category_type" NOT NULL,
    "logo_url" "text",
    "cover_image_url" "text",
    "gallery_images" "text"[] DEFAULT '{}'::"text"[],
    "videos" "text"[] DEFAULT '{}'::"text"[],
    "description" "text",
    "description_long" "text",
    "tier" "public"."listing_tier" DEFAULT 'standard'::"public"."listing_tier",
    "status" "public"."listing_status" DEFAULT 'pending_review'::"public"."listing_status",
    "email" "text" NOT NULL,
    "phone" "text",
    "whatsapp" "text",
    "website" "text",
    "address" "text",
    "city" "text",
    "region" "text",
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "meta_title" "text",
    "meta_description" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "featured_until" timestamp with time zone,
    "premium_until" timestamp with time zone,
    "featured_order" integer,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "rejection_reason" "text",
    "admin_notes" "text",
    "internal_rating" integer,
    "has_quality_images" boolean DEFAULT false,
    "has_complete_info" boolean DEFAULT false,
    "editor_approved_for_premium" boolean DEFAULT false,
    "views_count" integer DEFAULT 0,
    "clicks_count" integer DEFAULT 0,
    "inquiries_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "providers_internal_rating_check" CHECK ((("internal_rating" >= 1) AND ("internal_rating" <= 5)))
);


ALTER TABLE "public"."providers" OWNER TO "postgres";


COMMENT ON TABLE "public"."providers" IS 'Proveedores principales (Fábricas y Servicios de Habilitación)';



COMMENT ON COLUMN "public"."providers"."tier" IS 'premium: 1-2 por columna + landing, destacado: 4 por columna, standard: listado básico';



COMMENT ON COLUMN "public"."providers"."features" IS 'Features dinámicas en formato JSONB según categoría';



COMMENT ON COLUMN "public"."providers"."editor_approved_for_premium" IS 'Flag de control editorial para aprobar contenido premium basado en calidad';



CREATE OR REPLACE VIEW "public"."providers_with_categories" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "profile_id",
    NULL::"text" AS "company_name",
    NULL::"text" AS "slug",
    NULL::"public"."category_type" AS "primary_category",
    NULL::"text" AS "logo_url",
    NULL::"text" AS "cover_image_url",
    NULL::"text"[] AS "gallery_images",
    NULL::"text"[] AS "videos",
    NULL::"text" AS "description",
    NULL::"text" AS "description_long",
    NULL::"public"."listing_tier" AS "tier",
    NULL::"public"."listing_status" AS "status",
    NULL::"text" AS "email",
    NULL::"text" AS "phone",
    NULL::"text" AS "whatsapp",
    NULL::"text" AS "website",
    NULL::"text" AS "address",
    NULL::"text" AS "city",
    NULL::"text" AS "region",
    NULL::"jsonb" AS "features",
    NULL::"text" AS "meta_title",
    NULL::"text" AS "meta_description",
    NULL::"text"[] AS "keywords",
    NULL::timestamp with time zone AS "featured_until",
    NULL::timestamp with time zone AS "premium_until",
    NULL::integer AS "featured_order",
    NULL::"uuid" AS "approved_by",
    NULL::timestamp with time zone AS "approved_at",
    NULL::"text" AS "rejection_reason",
    NULL::"text" AS "admin_notes",
    NULL::integer AS "internal_rating",
    NULL::boolean AS "has_quality_images",
    NULL::boolean AS "has_complete_info",
    NULL::boolean AS "editor_approved_for_premium",
    NULL::integer AS "views_count",
    NULL::integer AS "clicks_count",
    NULL::integer AS "inquiries_count",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"jsonb" AS "metadata",
    NULL::"public"."category_type"[] AS "categories",
    NULL::"public"."category_type" AS "primary_category_from_junction";


ALTER VIEW "public"."providers_with_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sku" "text",
    "description" "text",
    "description_long" "text",
    "tier" "public"."listing_tier" DEFAULT 'standard'::"public"."listing_tier",
    "status" "public"."listing_status" DEFAULT 'active'::"public"."listing_status",
    "service_family" "text",
    "service_type" "text",
    "price_from" numeric,
    "price_to" numeric,
    "price_unit" "text",
    "currency" "text" DEFAULT 'CLP'::"text",
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "coverage_areas" "text"[] DEFAULT '{}'::"text"[],
    "main_image_url" "text",
    "gallery_images" "text"[] DEFAULT '{}'::"text"[],
    "videos" "text"[] DEFAULT '{}'::"text"[],
    "meta_title" "text",
    "meta_description" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "is_available" boolean DEFAULT true,
    "max_bookings" integer,
    "current_bookings" integer DEFAULT 0,
    "booking_calendar" "jsonb" DEFAULT '{}'::"jsonb",
    "views_count" integer DEFAULT 0,
    "clicks_count" integer DEFAULT 0,
    "inquiries_count" integer DEFAULT 0,
    "sales_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."service_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."service_products" IS 'Productos/servicios específicos ofrecidos por proveedores de habilitación';



CREATE TABLE IF NOT EXISTS "public"."static_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text",
    "excerpt" "text",
    "featured_image_url" "text",
    "status" "public"."content_status" DEFAULT 'draft'::"public"."content_status",
    "published_at" timestamp with time zone,
    "meta_title" "text",
    "meta_description" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "display_order" integer DEFAULT 0,
    "is_system_page" boolean DEFAULT false,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."static_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "item_type" "text" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "notes" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "priority" integer DEFAULT 1,
    "is_archived" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."feature_definitions"
    ADD CONSTRAINT "feature_definitions_category_feature_key_key" UNIQUE ("category", "feature_key");



ALTER TABLE ONLY "public"."feature_definitions"
    ADD CONSTRAINT "feature_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."house_topologies"
    ADD CONSTRAINT "house_topologies_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."house_topologies"
    ADD CONSTRAINT "house_topologies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."houses"
    ADD CONSTRAINT "houses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."houses"
    ADD CONSTRAINT "houses_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provider_categories"
    ADD CONSTRAINT "provider_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provider_categories"
    ADD CONSTRAINT "provider_categories_provider_id_category_key" UNIQUE ("provider_id", "category");



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."service_products"
    ADD CONSTRAINT "service_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_products"
    ADD CONSTRAINT "service_products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."static_pages"
    ADD CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."static_pages"
    ADD CONSTRAINT "static_pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_item_type_item_id_key" UNIQUE ("user_id", "item_type", "item_id");



CREATE INDEX "idx_admin_actions_admin" ON "public"."admin_actions" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_actions_target" ON "public"."admin_actions" USING "btree" ("target_type", "target_id");



CREATE INDEX "idx_admin_actions_type" ON "public"."admin_actions" USING "btree" ("action_type");



CREATE INDEX "idx_analytics_events_created" ON "public"."analytics_events" USING "btree" ("created_at");



CREATE INDEX "idx_analytics_events_target" ON "public"."analytics_events" USING "btree" ("target_type", "target_id");



CREATE INDEX "idx_analytics_events_type" ON "public"."analytics_events" USING "btree" ("event_type");



CREATE INDEX "idx_blog_posts_author" ON "public"."blog_posts" USING "btree" ("author_id");



CREATE INDEX "idx_blog_posts_published" ON "public"."blog_posts" USING "btree" ("published_at") WHERE ("status" = 'published'::"public"."content_status");



CREATE INDEX "idx_blog_posts_slug" ON "public"."blog_posts" USING "btree" ("slug");



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_feature_definitions_category" ON "public"."feature_definitions" USING "btree" ("category");



CREATE INDEX "idx_feature_definitions_filterable" ON "public"."feature_definitions" USING "btree" ("is_filterable") WHERE ("is_filterable" = true);



CREATE INDEX "idx_feature_definitions_group" ON "public"."feature_definitions" USING "btree" ("category", "group_name");



CREATE INDEX "idx_houses_area" ON "public"."houses" USING "btree" ("area_m2");



CREATE INDEX "idx_houses_features" ON "public"."houses" USING "gin" ("features");



CREATE INDEX "idx_houses_price" ON "public"."houses" USING "btree" ("price");



CREATE INDEX "idx_houses_provider" ON "public"."houses" USING "btree" ("provider_id");



CREATE INDEX "idx_houses_slug" ON "public"."houses" USING "btree" ("slug");



CREATE INDEX "idx_houses_status" ON "public"."houses" USING "btree" ("status");



CREATE INDEX "idx_houses_tier" ON "public"."houses" USING "btree" ("tier");



CREATE INDEX "idx_houses_topology" ON "public"."houses" USING "btree" ("topology_code");



CREATE INDEX "idx_inquiries_provider" ON "public"."inquiries" USING "btree" ("provider_id");



CREATE INDEX "idx_inquiries_status" ON "public"."inquiries" USING "btree" ("status");



CREATE INDEX "idx_inquiries_user" ON "public"."inquiries" USING "btree" ("user_id");



CREATE INDEX "idx_provider_categories_category" ON "public"."provider_categories" USING "btree" ("category");



CREATE INDEX "idx_provider_categories_primary" ON "public"."provider_categories" USING "btree" ("provider_id", "is_primary") WHERE ("is_primary" = true);



CREATE INDEX "idx_provider_categories_provider" ON "public"."provider_categories" USING "btree" ("provider_id");



CREATE INDEX "idx_providers_featured_order" ON "public"."providers" USING "btree" ("featured_order") WHERE ("featured_order" IS NOT NULL);



CREATE INDEX "idx_providers_features" ON "public"."providers" USING "gin" ("features");



CREATE INDEX "idx_providers_primary_category" ON "public"."providers" USING "btree" ("primary_category");



CREATE INDEX "idx_providers_region" ON "public"."providers" USING "btree" ("region");



CREATE INDEX "idx_providers_slug" ON "public"."providers" USING "btree" ("slug");



CREATE INDEX "idx_providers_status" ON "public"."providers" USING "btree" ("status");



CREATE INDEX "idx_providers_tier" ON "public"."providers" USING "btree" ("tier");



CREATE INDEX "idx_service_products_family" ON "public"."service_products" USING "btree" ("service_family");



CREATE INDEX "idx_service_products_features" ON "public"."service_products" USING "gin" ("features");



CREATE INDEX "idx_service_products_provider" ON "public"."service_products" USING "btree" ("provider_id");



CREATE INDEX "idx_service_products_slug" ON "public"."service_products" USING "btree" ("slug");



CREATE INDEX "idx_service_products_status" ON "public"."service_products" USING "btree" ("status");



CREATE INDEX "idx_static_pages_slug" ON "public"."static_pages" USING "btree" ("slug");



CREATE INDEX "idx_static_pages_status" ON "public"."static_pages" USING "btree" ("status");



CREATE INDEX "idx_static_pages_type" ON "public"."static_pages" USING "btree" ("type");



CREATE INDEX "idx_user_favorites_item" ON "public"."user_favorites" USING "btree" ("item_type", "item_id");



CREATE INDEX "idx_user_favorites_user" ON "public"."user_favorites" USING "btree" ("user_id");



CREATE OR REPLACE VIEW "public"."providers_with_categories" AS
 SELECT "p"."id",
    "p"."profile_id",
    "p"."company_name",
    "p"."slug",
    "p"."primary_category",
    "p"."logo_url",
    "p"."cover_image_url",
    "p"."gallery_images",
    "p"."videos",
    "p"."description",
    "p"."description_long",
    "p"."tier",
    "p"."status",
    "p"."email",
    "p"."phone",
    "p"."whatsapp",
    "p"."website",
    "p"."address",
    "p"."city",
    "p"."region",
    "p"."features",
    "p"."meta_title",
    "p"."meta_description",
    "p"."keywords",
    "p"."featured_until",
    "p"."premium_until",
    "p"."featured_order",
    "p"."approved_by",
    "p"."approved_at",
    "p"."rejection_reason",
    "p"."admin_notes",
    "p"."internal_rating",
    "p"."has_quality_images",
    "p"."has_complete_info",
    "p"."editor_approved_for_premium",
    "p"."views_count",
    "p"."clicks_count",
    "p"."inquiries_count",
    "p"."created_at",
    "p"."updated_at",
    "p"."metadata",
    "array_agg"(DISTINCT "pc"."category" ORDER BY "pc"."category") FILTER (WHERE ("pc"."category" IS NOT NULL)) AS "categories",
    ( SELECT "provider_categories"."category"
           FROM "public"."provider_categories"
          WHERE (("provider_categories"."provider_id" = "p"."id") AND ("provider_categories"."is_primary" = true))
         LIMIT 1) AS "primary_category_from_junction"
   FROM ("public"."providers" "p"
     LEFT JOIN "public"."provider_categories" "pc" ON (("pc"."provider_id" = "p"."id")))
  GROUP BY "p"."id";



CREATE OR REPLACE TRIGGER "sync_provider_category_trigger" AFTER INSERT ON "public"."providers" FOR EACH ROW EXECUTE FUNCTION "public"."sync_provider_category_on_insert"();



CREATE OR REPLACE TRIGGER "update_blog_posts_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_houses_updated_at" BEFORE UPDATE ON "public"."houses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_providers_updated_at" BEFORE UPDATE ON "public"."providers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_service_products_updated_at" BEFORE UPDATE ON "public"."service_products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_static_pages_updated_at" BEFORE UPDATE ON "public"."static_pages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."houses"
    ADD CONSTRAINT "houses_parent_house_id_fkey" FOREIGN KEY ("parent_house_id") REFERENCES "public"."houses"("id");



ALTER TABLE ONLY "public"."houses"
    ADD CONSTRAINT "houses_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id");



ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."provider_categories"
    ADD CONSTRAINT "provider_categories_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_products"
    ADD CONSTRAINT "service_products_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."static_pages"
    ADD CONSTRAINT "static_pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."static_pages"
    ADD CONSTRAINT "static_pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Active houses are viewable by everyone" ON "public"."houses" FOR SELECT USING ((("status" = 'active'::"public"."listing_status") OR (EXISTS ( SELECT 1
   FROM "public"."providers"
  WHERE (("providers"."id" = "houses"."provider_id") AND ("providers"."profile_id" = "auth"."uid"()))))));



CREATE POLICY "Active providers are viewable by everyone" ON "public"."providers" FOR SELECT USING ((("status" = 'active'::"public"."listing_status") OR ("profile_id" = "auth"."uid"())));



CREATE POLICY "Admins can manage all houses" ON "public"."houses" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Admins can manage all providers" ON "public"."providers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"]))))));



CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Providers can manage own houses" ON "public"."houses" USING ((EXISTS ( SELECT 1
   FROM "public"."providers"
  WHERE (("providers"."id" = "houses"."provider_id") AND ("providers"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Providers can update own listing" ON "public"."providers" FOR UPDATE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."houses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."provider_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."static_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_feature_value"("p_features" "jsonb", "p_group" "text", "p_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_feature_value"("p_features" "jsonb", "p_group" "text", "p_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_feature_value"("p_features" "jsonb", "p_group" "text", "p_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_providers_by_category"("p_category" "public"."category_type", "p_status" "public"."listing_status", "p_tier" "public"."listing_tier") TO "anon";
GRANT ALL ON FUNCTION "public"."get_providers_by_category"("p_category" "public"."category_type", "p_status" "public"."listing_status", "p_tier" "public"."listing_tier") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_providers_by_category"("p_category" "public"."category_type", "p_status" "public"."listing_status", "p_tier" "public"."listing_tier") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_admin_action"("p_admin_id" "uuid", "p_action_type" "text", "p_target_type" "text", "p_target_id" "uuid", "p_changes" "jsonb", "p_ip_address" "inet") TO "anon";
GRANT ALL ON FUNCTION "public"."log_admin_action"("p_admin_id" "uuid", "p_action_type" "text", "p_target_type" "text", "p_target_id" "uuid", "p_changes" "jsonb", "p_ip_address" "inet") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_admin_action"("p_admin_id" "uuid", "p_action_type" "text", "p_target_type" "text", "p_target_id" "uuid", "p_changes" "jsonb", "p_ip_address" "inet") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_providers_by_feature"("p_category" "public"."category_type", "p_group" "text", "p_key" "text", "p_value" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."search_providers_by_feature"("p_category" "public"."category_type", "p_group" "text", "p_key" "text", "p_value" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_providers_by_feature"("p_category" "public"."category_type", "p_group" "text", "p_key" "text", "p_value" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_provider_category"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_provider_category"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_provider_category"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_provider_category_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_provider_category_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_provider_category_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_view_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_view_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_view_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_actions" TO "anon";
GRANT ALL ON TABLE "public"."admin_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_actions" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."feature_definitions" TO "anon";
GRANT ALL ON TABLE "public"."feature_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."house_topologies" TO "anon";
GRANT ALL ON TABLE "public"."house_topologies" TO "authenticated";
GRANT ALL ON TABLE "public"."house_topologies" TO "service_role";



GRANT ALL ON TABLE "public"."houses" TO "anon";
GRANT ALL ON TABLE "public"."houses" TO "authenticated";
GRANT ALL ON TABLE "public"."houses" TO "service_role";



GRANT ALL ON TABLE "public"."inquiries" TO "anon";
GRANT ALL ON TABLE "public"."inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."provider_categories" TO "anon";
GRANT ALL ON TABLE "public"."provider_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."provider_categories" TO "service_role";



GRANT ALL ON TABLE "public"."providers" TO "anon";
GRANT ALL ON TABLE "public"."providers" TO "authenticated";
GRANT ALL ON TABLE "public"."providers" TO "service_role";



GRANT ALL ON TABLE "public"."providers_with_categories" TO "anon";
GRANT ALL ON TABLE "public"."providers_with_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."providers_with_categories" TO "service_role";



GRANT ALL ON TABLE "public"."service_products" TO "anon";
GRANT ALL ON TABLE "public"."service_products" TO "authenticated";
GRANT ALL ON TABLE "public"."service_products" TO "service_role";



GRANT ALL ON TABLE "public"."static_pages" TO "anon";
GRANT ALL ON TABLE "public"."static_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."static_pages" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
