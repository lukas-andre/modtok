export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_action: string | null
          event_category: string | null
          event_label: string | null
          event_type: string
          event_value: number | null
          id: string
          ip_address: unknown | null
          os: string | null
          page_url: string | null
          referrer_url: string | null
          region: string | null
          session_id: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type: string
          event_value?: number | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          page_url?: string | null
          referrer_url?: string | null
          region?: string | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type?: string
          event_value?: number | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          page_url?: string | null
          referrer_url?: string | null
          region?: string | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          canonical_url: string | null
          category: string | null
          content: string
          created_at: string | null
          editor_id: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          keywords: string[] | null
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          published_at: string | null
          reading_time_minutes: number | null
          scheduled_for: string | null
          shares_count: number | null
          slug: string
          status: Database["public"]["Enums"]["content_status"] | null
          structured_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          editor_id?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_for?: string | null
          shares_count?: number | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"] | null
          structured_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          editor_id?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_for?: string | null
          shares_count?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          structured_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_views: {
        Row: {
          content_id: string
          content_type: string
          id: string
          referrer: string | null
          viewed_at: string | null
          viewer_ip: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          referrer?: string | null
          viewed_at?: string | null
          viewer_ip?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          referrer?: string | null
          viewed_at?: string | null
          viewer_ip?: string | null
        }
        Relationships: []
      }
      feature_definitions: {
        Row: {
          admin_helper_text: string | null
          admin_input_type: string | null
          category: Database["public"]["Enums"]["category_type"]
          created_at: string | null
          data_type: Database["public"]["Enums"]["feature_data_type"]
          default_value: Json | null
          description: string | null
          display_order: number | null
          feature_key: string
          filter_format: string | null
          filter_location: string | null
          filter_type: Database["public"]["Enums"]["filter_type"] | null
          group_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_filterable: boolean | null
          label: string
          requires_login: boolean | null
          show_in_card_destacado: boolean | null
          show_in_card_premium: boolean | null
          show_in_card_standard: boolean | null
          show_in_landing: boolean | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          admin_helper_text?: string | null
          admin_input_type?: string | null
          category: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          data_type: Database["public"]["Enums"]["feature_data_type"]
          default_value?: Json | null
          description?: string | null
          display_order?: number | null
          feature_key: string
          filter_format?: string | null
          filter_location?: string | null
          filter_type?: Database["public"]["Enums"]["filter_type"] | null
          group_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_filterable?: boolean | null
          label: string
          requires_login?: boolean | null
          show_in_card_destacado?: boolean | null
          show_in_card_premium?: boolean | null
          show_in_card_standard?: boolean | null
          show_in_landing?: boolean | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          admin_helper_text?: string | null
          admin_input_type?: string | null
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          data_type?: Database["public"]["Enums"]["feature_data_type"]
          default_value?: Json | null
          description?: string | null
          display_order?: number | null
          feature_key?: string
          filter_format?: string | null
          filter_location?: string | null
          filter_type?: Database["public"]["Enums"]["filter_type"] | null
          group_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_filterable?: boolean | null
          label?: string
          requires_login?: boolean | null
          show_in_card_destacado?: boolean | null
          show_in_card_premium?: boolean | null
          show_in_card_standard?: boolean | null
          show_in_landing?: boolean | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      homepage_slots: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          monthly_price: number | null
          rotation_order: number | null
          slot_position: number
          slot_type: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price?: number | null
          rotation_order?: number | null
          slot_position: number
          slot_type: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price?: number | null
          rotation_order?: number | null
          slot_position?: number
          slot_type?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      house_topologies: {
        Row: {
          bathrooms: number
          bedrooms: number
          code: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          bathrooms: number
          bedrooms: number
          code: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          bathrooms?: number
          bedrooms?: number
          code?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      houses: {
        Row: {
          area_m2: number | null
          assembly_time_days: number | null
          bathrooms: number | null
          bedrooms: number | null
          brochure_pdf_url: string | null
          clicks_count: number | null
          created_at: string | null
          currency: string | null
          delivery_time_days: number | null
          description: string | null
          description_long: string | null
          editor_approved_for_premium: boolean | null
          features: Json | null
          floor_plans: string[] | null
          floors: number | null
          gallery_images: string[] | null
          has_complete_info: boolean | null
          has_landing_page: boolean | null
          has_quality_images: boolean | null
          has_variants: boolean | null
          id: string
          inquiries_count: number | null
          is_available: boolean | null
          keywords: string[] | null
          landing_slug: string | null
          latitude: number | null
          location_city: string | null
          location_region: string | null
          longitude: number | null
          main_image_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          model_code: string | null
          name: string
          parent_house_id: string | null
          price: number | null
          price_opportunity: number | null
          price_per_m2: number | null
          provider_id: string | null
          sales_count: number | null
          saves_count: number | null
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity: number | null
          stock_status: string | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          topology_code: string | null
          updated_at: string | null
          variant_attributes: Json | null
          videos: string[] | null
          views_count: number | null
          virtual_tour_url: string | null
          warranty_years: number | null
        }
        Insert: {
          area_m2?: number | null
          assembly_time_days?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          brochure_pdf_url?: string | null
          clicks_count?: number | null
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          description_long?: string | null
          editor_approved_for_premium?: boolean | null
          features?: Json | null
          floor_plans?: string[] | null
          floors?: number | null
          gallery_images?: string[] | null
          has_complete_info?: boolean | null
          has_landing_page?: boolean | null
          has_quality_images?: boolean | null
          has_variants?: boolean | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          landing_slug?: string | null
          latitude?: number | null
          location_city?: string | null
          location_region?: string | null
          longitude?: number | null
          main_image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          model_code?: string | null
          name: string
          parent_house_id?: string | null
          price?: number | null
          price_opportunity?: number | null
          price_per_m2?: number | null
          provider_id?: string | null
          sales_count?: number | null
          saves_count?: number | null
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          topology_code?: string | null
          updated_at?: string | null
          variant_attributes?: Json | null
          videos?: string[] | null
          views_count?: number | null
          virtual_tour_url?: string | null
          warranty_years?: number | null
        }
        Update: {
          area_m2?: number | null
          assembly_time_days?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          brochure_pdf_url?: string | null
          clicks_count?: number | null
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          description_long?: string | null
          editor_approved_for_premium?: boolean | null
          features?: Json | null
          floor_plans?: string[] | null
          floors?: number | null
          gallery_images?: string[] | null
          has_complete_info?: boolean | null
          has_landing_page?: boolean | null
          has_quality_images?: boolean | null
          has_variants?: boolean | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          landing_slug?: string | null
          latitude?: number | null
          location_city?: string | null
          location_region?: string | null
          longitude?: number | null
          main_image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          model_code?: string | null
          name?: string
          parent_house_id?: string | null
          price?: number | null
          price_opportunity?: number | null
          price_per_m2?: number | null
          provider_id?: string | null
          sales_count?: number | null
          saves_count?: number | null
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          topology_code?: string | null
          updated_at?: string | null
          variant_attributes?: Json | null
          videos?: string[] | null
          views_count?: number | null
          virtual_tour_url?: string | null
          warranty_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "houses_parent_house_id_fkey"
            columns: ["parent_house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "houses_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "houses_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string | null
          email: string
          id: string
          item_id: string | null
          item_type: string | null
          message: string | null
          name: string
          phone: string
          project_location: string | null
          provider_id: string | null
          provider_notes: string | null
          status: string | null
          timeline: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          email: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          message?: string | null
          name: string
          phone: string
          project_location?: string | null
          provider_id?: string | null
          provider_notes?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          email?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          message?: string | null
          name?: string
          phone?: string
          project_location?: string | null
          provider_id?: string | null
          provider_notes?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          canonical_url: string | null
          content: string
          created_at: string | null
          expires_at: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          is_breaking: boolean | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          news_type: string | null
          og_image_url: string | null
          published_at: string | null
          reading_time_minutes: number | null
          scheduled_for: string | null
          slug: string
          status: string | null
          structured_data: Json | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          content: string
          created_at?: string | null
          expires_at?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_breaking?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          news_type?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_for?: string | null
          slug: string
          status?: string | null
          structured_data?: Json | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          canonical_url?: string | null
          content?: string
          created_at?: string | null
          expires_at?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_breaking?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          news_type?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_for?: string | null
          slug?: string
          status?: string | null
          structured_data?: Json | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          last_login_at: string | null
          metadata: Json | null
          phone: string | null
          phone_verified: boolean | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          rut: string | null
          social_links: Json | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id: string
          last_login_at?: string | null
          metadata?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          rut?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          last_login_at?: string | null
          metadata?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          rut?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      provider_categories: {
        Row: {
          category: Database["public"]["Enums"]["category_type"]
          created_at: string | null
          id: string
          is_primary: boolean | null
          provider_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          provider_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          clicks_count: number | null
          company_name: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          description_long: string | null
          editor_approved_for_premium: boolean | null
          email: string
          featured_order: number | null
          featured_until: string | null
          features: Json | null
          gallery_images: string[] | null
          has_complete_info: boolean | null
          has_landing_page: boolean | null
          has_quality_images: boolean | null
          id: string
          inquiries_count: number | null
          internal_rating: number | null
          is_manufacturer: boolean | null
          is_service_provider: boolean | null
          keywords: string[] | null
          landing_slug: string | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          phone: string | null
          premium_until: string | null
          primary_category: Database["public"]["Enums"]["category_type"]
          profile_id: string | null
          region: string | null
          rejection_reason: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          videos: string[] | null
          views_count: number | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          clicks_count?: number | null
          company_name: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          editor_approved_for_premium?: boolean | null
          email: string
          featured_order?: number | null
          featured_until?: string | null
          features?: Json | null
          gallery_images?: string[] | null
          has_complete_info?: boolean | null
          has_landing_page?: boolean | null
          has_quality_images?: boolean | null
          id?: string
          inquiries_count?: number | null
          internal_rating?: number | null
          is_manufacturer?: boolean | null
          is_service_provider?: boolean | null
          keywords?: string[] | null
          landing_slug?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          phone?: string | null
          premium_until?: string | null
          primary_category: Database["public"]["Enums"]["category_type"]
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          editor_approved_for_premium?: boolean | null
          email?: string
          featured_order?: number | null
          featured_until?: string | null
          features?: Json | null
          gallery_images?: string[] | null
          has_complete_info?: boolean | null
          has_landing_page?: boolean | null
          has_quality_images?: boolean | null
          id?: string
          inquiries_count?: number | null
          internal_rating?: number | null
          is_manufacturer?: boolean | null
          is_service_provider?: boolean | null
          keywords?: string[] | null
          landing_slug?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          phone?: string | null
          premium_until?: string | null
          primary_category?: Database["public"]["Enums"]["category_type"]
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_products: {
        Row: {
          booking_calendar: Json | null
          clicks_count: number | null
          coverage_areas: string[] | null
          created_at: string | null
          currency: string | null
          current_bookings: number | null
          description: string | null
          description_long: string | null
          editor_approved_for_premium: boolean | null
          features: Json | null
          gallery_images: string[] | null
          has_complete_info: boolean | null
          has_landing_page: boolean | null
          has_quality_images: boolean | null
          id: string
          inquiries_count: number | null
          is_available: boolean | null
          keywords: string[] | null
          landing_slug: string | null
          main_image_url: string | null
          max_bookings: number | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          name: string
          price_from: number | null
          price_to: number | null
          price_unit: string | null
          provider_id: string | null
          sales_count: number | null
          service_family: string | null
          service_type: string | null
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          videos: string[] | null
          views_count: number | null
        }
        Insert: {
          booking_calendar?: Json | null
          clicks_count?: number | null
          coverage_areas?: string[] | null
          created_at?: string | null
          currency?: string | null
          current_bookings?: number | null
          description?: string | null
          description_long?: string | null
          editor_approved_for_premium?: boolean | null
          features?: Json | null
          gallery_images?: string[] | null
          has_complete_info?: boolean | null
          has_landing_page?: boolean | null
          has_quality_images?: boolean | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          landing_slug?: string | null
          main_image_url?: string | null
          max_bookings?: number | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          name: string
          price_from?: number | null
          price_to?: number | null
          price_unit?: string | null
          provider_id?: string | null
          sales_count?: number | null
          service_family?: string | null
          service_type?: string | null
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
        }
        Update: {
          booking_calendar?: Json | null
          clicks_count?: number | null
          coverage_areas?: string[] | null
          created_at?: string | null
          currency?: string | null
          current_bookings?: number | null
          description?: string | null
          description_long?: string | null
          editor_approved_for_premium?: boolean | null
          features?: Json | null
          gallery_images?: string[] | null
          has_complete_info?: boolean | null
          has_landing_page?: boolean | null
          has_quality_images?: boolean | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          landing_slug?: string | null
          main_image_url?: string | null
          max_bookings?: number | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          name?: string
          price_from?: number | null
          price_to?: number | null
          price_unit?: string | null
          provider_id?: string | null
          sales_count?: number | null
          service_family?: string | null
          service_type?: string | null
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      static_pages: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          display_order: number | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_system_page: boolean | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_system_page?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_system_page?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "static_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "static_pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean | null
          item_id: string
          item_type: string
          notes: string | null
          priority: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          item_id: string
          item_type: string
          notes?: string | null
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          item_id?: string
          item_type?: string
          notes?: string | null
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      providers_with_categories: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          categories: Database["public"]["Enums"]["category_type"][] | null
          city: string | null
          clicks_count: number | null
          company_name: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          description_long: string | null
          editor_approved_for_premium: boolean | null
          email: string | null
          featured_order: number | null
          featured_until: string | null
          features: Json | null
          gallery_images: string[] | null
          has_complete_info: boolean | null
          has_quality_images: boolean | null
          id: string | null
          inquiries_count: number | null
          internal_rating: number | null
          keywords: string[] | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          phone: string | null
          premium_until: string | null
          primary_category: Database["public"]["Enums"]["category_type"] | null
          primary_category_from_junction:
            | Database["public"]["Enums"]["category_type"]
            | null
          profile_id: string | null
          region: string | null
          rejection_reason: string | null
          slug: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          videos: string[] | null
          views_count: number | null
          website: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_feature_value: {
        Args: { p_features: Json; p_group: string; p_key: string }
        Returns: Json
      }
      get_provider_services: {
        Args: { provider_uuid: string }
        Returns: {
          is_manufacturer: boolean
          is_service_provider: boolean
          services_offered: string[]
        }[]
      }
      get_providers_by_category: {
        Args: {
          p_category: Database["public"]["Enums"]["category_type"]
          p_status?: Database["public"]["Enums"]["listing_status"]
          p_tier?: Database["public"]["Enums"]["listing_tier"]
        }
        Returns: {
          categories: Database["public"]["Enums"]["category_type"][]
          company_name: string
          email: string
          id: string
          phone: string
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          tier: Database["public"]["Enums"]["listing_tier"]
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_admin_id: string
          p_changes?: Json
          p_ip_address?: unknown
          p_target_id: string
          p_target_type: string
        }
        Returns: string
      }
      search_providers_by_feature: {
        Args: {
          p_category: Database["public"]["Enums"]["category_type"]
          p_group: string
          p_key: string
          p_value: boolean
        }
        Returns: {
          company_name: string
          id: string
          slug: string
        }[]
      }
    }
    Enums: {
      category_type: "fabrica" | "casas" | "habilitacion_servicios"
      content_status:
        | "draft"
        | "pending_review"
        | "published"
        | "archived"
        | "scheduled"
      feature_data_type: "boolean" | "number" | "text" | "text_array" | "json"
      filter_type: "checklist" | "slider" | "checkbox" | "radio" | "select"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "inactive"
        | "rejected"
      listing_tier: "premium" | "destacado" | "standard"
      user_role: "super_admin" | "admin" | "provider" | "user"
      user_status: "active" | "inactive" | "suspended" | "pending_verification"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      category_type: ["fabrica", "casas", "habilitacion_servicios"],
      content_status: [
        "draft",
        "pending_review",
        "published",
        "archived",
        "scheduled",
      ],
      feature_data_type: ["boolean", "number", "text", "text_array", "json"],
      filter_type: ["checklist", "slider", "checkbox", "radio", "select"],
      listing_status: [
        "draft",
        "pending_review",
        "active",
        "inactive",
        "rejected",
      ],
      listing_tier: ["premium", "destacado", "standard"],
      user_role: ["super_admin", "admin", "provider", "user"],
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const

// Convenience type aliases
export type BlogPost = Tables<'blog_posts'>
export type BlogPostInsert = TablesInsert<'blog_posts'>
export type BlogPostUpdate = TablesUpdate<'blog_posts'>

export type NewsPost = Tables<'news_posts'>
export type NewsPostInsert = TablesInsert<'news_posts'>
export type NewsPostUpdate = TablesUpdate<'news_posts'>

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type Provider = Tables<'providers'>
export type ProviderInsert = TablesInsert<'providers'>
export type ProviderUpdate = TablesUpdate<'providers'>

export type House = Tables<'houses'>
export type HouseInsert = TablesInsert<'houses'>
export type HouseUpdate = TablesUpdate<'houses'>

export type ServiceProduct = Tables<'service_products'>
export type ServiceProductInsert = TablesInsert<'service_products'>
export type ServiceProductUpdate = TablesUpdate<'service_products'>
