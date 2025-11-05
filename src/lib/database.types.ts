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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
          area_built_m2: number | null
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
          energy_rating: string | null
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
          main_material: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          model_code: string | null
          name: string
          parent_house_id: string | null
          price: number | null
          price_opportunity: number | null
          price_per_m2: number | null
          provider_id: string
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
          area_built_m2?: number | null
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
          energy_rating?: string | null
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
          main_material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          model_code?: string | null
          name: string
          parent_house_id?: string | null
          price?: number | null
          price_opportunity?: number | null
          price_per_m2?: number | null
          provider_id: string
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
          area_built_m2?: number | null
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
          energy_rating?: string | null
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
          main_material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          model_code?: string | null
          name?: string
          parent_house_id?: string | null
          price?: number | null
          price_opportunity?: number | null
          price_per_m2?: number | null
          provider_id?: string
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
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
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
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
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
      manufacturer_profiles: {
        Row: {
          ases_legal: boolean | null
          ases_tecnica: boolean | null
          contr_terreno: boolean | null
          created_at: string | null
          declared_at: string | null
          declared_by: string | null
          dise_pers: boolean | null
          dise_std: boolean | null
          experiencia_years: number | null
          financiamiento: boolean | null
          insta_premontada: boolean | null
          instalacion: boolean | null
          kit_autocons: boolean | null
          llave_en_mano: boolean | null
          logist_transporte: boolean | null
          modulares_container: boolean | null
          modulares_hormigon: boolean | null
          modulares_madera: boolean | null
          modulares_sip: boolean | null
          oficinas_modulares: boolean | null
          precio_ref_max_m2: number | null
          precio_ref_min_m2: number | null
          prefabricada_tradicional: boolean | null
          provider_id: string
          publica_precios: boolean | null
          tiny_houses: boolean | null
          updated_at: string | null
          verified_by_admin: boolean | null
        }
        Insert: {
          ases_legal?: boolean | null
          ases_tecnica?: boolean | null
          contr_terreno?: boolean | null
          created_at?: string | null
          declared_at?: string | null
          declared_by?: string | null
          dise_pers?: boolean | null
          dise_std?: boolean | null
          experiencia_years?: number | null
          financiamiento?: boolean | null
          insta_premontada?: boolean | null
          instalacion?: boolean | null
          kit_autocons?: boolean | null
          llave_en_mano?: boolean | null
          logist_transporte?: boolean | null
          modulares_container?: boolean | null
          modulares_hormigon?: boolean | null
          modulares_madera?: boolean | null
          modulares_sip?: boolean | null
          oficinas_modulares?: boolean | null
          precio_ref_max_m2?: number | null
          precio_ref_min_m2?: number | null
          prefabricada_tradicional?: boolean | null
          provider_id: string
          publica_precios?: boolean | null
          tiny_houses?: boolean | null
          updated_at?: string | null
          verified_by_admin?: boolean | null
        }
        Update: {
          ases_legal?: boolean | null
          ases_tecnica?: boolean | null
          contr_terreno?: boolean | null
          created_at?: string | null
          declared_at?: string | null
          declared_by?: string | null
          dise_pers?: boolean | null
          dise_std?: boolean | null
          experiencia_years?: number | null
          financiamiento?: boolean | null
          insta_premontada?: boolean | null
          instalacion?: boolean | null
          kit_autocons?: boolean | null
          llave_en_mano?: boolean | null
          logist_transporte?: boolean | null
          modulares_container?: boolean | null
          modulares_hormigon?: boolean | null
          modulares_madera?: boolean | null
          modulares_sip?: boolean | null
          oficinas_modulares?: boolean | null
          precio_ref_max_m2?: number | null
          precio_ref_min_m2?: number | null
          prefabricada_tradicional?: boolean | null
          provider_id?: string
          publica_precios?: boolean | null
          tiny_houses?: boolean | null
          updated_at?: string | null
          verified_by_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_profiles_declared_by_fkey"
            columns: ["declared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_profiles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "manufacturer_profiles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_profiles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          id: string
          kind: string
          meta: Json | null
          owner_context: string | null
          owner_id: string
          owner_type: string
          position: number
          role: Database["public"]["Enums"]["media_role"] | null
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          kind: string
          meta?: Json | null
          owner_context?: string | null
          owner_id: string
          owner_type: string
          position?: number
          role?: Database["public"]["Enums"]["media_role"] | null
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          kind?: string
          meta?: Json | null
          owner_context?: string | null
          owner_id?: string
          owner_type?: string
          position?: number
          role?: Database["public"]["Enums"]["media_role"] | null
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
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
      provider_aliases: {
        Row: {
          created_at: string | null
          id: string
          kind: string
          provider_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kind: string
          provider_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kind?: string
          provider_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_aliases_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_aliases_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_aliases_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_coverage_regions: {
        Row: {
          created_at: string | null
          id: string
          provider_id: string
          region_code: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider_id: string
          region_code: string
        }
        Update: {
          created_at?: string | null
          id?: string
          provider_id?: string
          region_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_coverage_regions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_coverage_regions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_coverage_regions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_coverage_regions_region_code_fkey"
            columns: ["region_code"]
            isOneToOne: false
            referencedRelation: "regions_lkp"
            referencedColumns: ["code"]
          },
        ]
      }
      provider_landings: {
        Row: {
          created_at: string
          created_by: string | null
          editorial_status: string
          enabled: boolean
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          provider_id: string
          published_at: string | null
          sections: Json | null
          slug: string
          template: string
          tier: Database["public"]["Enums"]["listing_tier"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          editorial_status?: string
          enabled?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          provider_id: string
          published_at?: string | null
          sections?: Json | null
          slug: string
          template?: string
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          editorial_status?: string
          enabled?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          provider_id?: string
          published_at?: string | null
          sections?: Json | null
          slug?: string
          template?: string
          tier?: Database["public"]["Enums"]["listing_tier"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_landings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_landings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_landings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_landings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_landings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          company_name: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string
          has_complete_info: boolean | null
          has_quality_images: boolean | null
          hq_region_code: string | null
          id: string
          is_manufacturer: boolean | null
          is_service_provider: boolean | null
          logo_url: string | null
          metadata: Json | null
          phone: string | null
          profile_id: string | null
          rejection_reason: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          company_name: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          has_complete_info?: boolean | null
          has_quality_images?: boolean | null
          hq_region_code?: string | null
          id?: string
          is_manufacturer?: boolean | null
          is_service_provider?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          profile_id?: string | null
          rejection_reason?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          company_name?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          has_complete_info?: boolean | null
          has_quality_images?: boolean | null
          hq_region_code?: string | null
          id?: string
          is_manufacturer?: boolean | null
          is_service_provider?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          profile_id?: string | null
          rejection_reason?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          updated_at?: string | null
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
            foreignKeyName: "providers_hq_region_code_fkey"
            columns: ["hq_region_code"]
            isOneToOne: false
            referencedRelation: "regions_lkp"
            referencedColumns: ["code"]
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
      raw_provider_leads: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          idempotency_key: string | null
          normalized: Json | null
          payload: Json
          provider_id: string | null
          received_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string | null
          normalized?: Json | null
          payload: Json
          provider_id?: string | null
          received_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string | null
          normalized?: Json | null
          payload?: Json
          provider_id?: string | null
          received_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_provider_leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "raw_provider_leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_provider_leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      regions_lkp: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      service_product_coverage_deltas: {
        Row: {
          created_at: string
          id: string
          op: string
          region_code: string
          service_product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          op: string
          region_code: string
          service_product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          op?: string
          region_code?: string
          service_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_product_coverage_deltas_region_code_fkey"
            columns: ["region_code"]
            isOneToOne: false
            referencedRelation: "regions_lkp"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "service_product_coverage_deltas_service_product_id_fkey"
            columns: ["service_product_id"]
            isOneToOne: false
            referencedRelation: "service_products"
            referencedColumns: ["id"]
          },
        ]
      }
      service_products: {
        Row: {
          booking_calendar: Json | null
          clicks_count: number | null
          coverage_mode: string
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
          provider_id: string
          sales_count: number | null
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
          coverage_mode?: string
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
          provider_id: string
          sales_count?: number | null
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
          coverage_mode?: string
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
          provider_id?: string
          sales_count?: number | null
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
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
          },
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
      slot_orders: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean
          monthly_price: number
          notes: string | null
          rotation_order: number
          slot_type: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          monthly_price: number
          notes?: string | null
          rotation_order?: number
          slot_type: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          monthly_price?: number
          notes?: string | null
          rotation_order?: number
          slot_type?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      slot_positions: {
        Row: {
          id: number
          slot_type: string
          updated_at: string | null
          visible_count: number
        }
        Insert: {
          id?: number
          slot_type: string
          updated_at?: string | null
          visible_count: number
        }
        Update: {
          id?: number
          slot_type?: string
          updated_at?: string | null
          visible_count?: number
        }
        Relationships: []
      }
      slot_rotation_state: {
        Row: {
          last_pointer: number | null
          last_rotation_at: string | null
          slot_type: string
        }
        Insert: {
          last_pointer?: number | null
          last_rotation_at?: string | null
          slot_type: string
        }
        Update: {
          last_pointer?: number | null
          last_rotation_at?: string | null
          slot_type?: string
        }
        Relationships: []
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
      house_facets_by_provider: {
        Row: {
          house_count: number | null
          house_destacado_count: number | null
          house_premium_count: number | null
          provider_id: string | null
          v_ases_legal: boolean | null
          v_ases_tecnica: boolean | null
          v_contr_terreno: boolean | null
          v_dise_pers: boolean | null
          v_dise_std: boolean | null
          v_financiamiento: boolean | null
          v_insta_premontada: boolean | null
          v_instalacion: boolean | null
          v_kit_autocons: boolean | null
          v_llave_en_mano: boolean | null
          v_logist_transporte: boolean | null
          v_modulares_container: boolean | null
          v_modulares_hormigon: boolean | null
          v_modulares_madera: boolean | null
          v_modulares_sip: boolean | null
          v_oficinas_modulares: boolean | null
          v_prefabricada_tradicional: boolean | null
          v_price_m2_max: number | null
          v_price_m2_min: number | null
          v_publica_precios: boolean | null
          v_tiny_houses: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "houses_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_facets_effective"
            referencedColumns: ["provider_id"]
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
      manufacturer_facets_effective: {
        Row: {
          address: string | null
          ases_legal: boolean | null
          ases_tecnica: boolean | null
          city: string | null
          company_name: string | null
          contr_terreno: boolean | null
          cover_image_url: string | null
          created_at: string | null
          declared_at: string | null
          description: string | null
          dise_pers: boolean | null
          dise_std: boolean | null
          email: string | null
          experiencia_years: number | null
          financiamiento: boolean | null
          has_landing: boolean | null
          has_verified: boolean | null
          house_count: number | null
          house_destacado_count: number | null
          house_premium_count: number | null
          hq_region_code: string | null
          insta_premontada: boolean | null
          instalacion: boolean | null
          is_manufacturer: boolean | null
          is_service_provider: boolean | null
          kit_autocons: boolean | null
          landing_slug: string | null
          landing_template: string | null
          llave_en_mano: boolean | null
          logist_transporte: boolean | null
          logo_url: string | null
          modulares_container: boolean | null
          modulares_hormigon: boolean | null
          modulares_madera: boolean | null
          modulares_sip: boolean | null
          oficinas_modulares: boolean | null
          phone: string | null
          prefabricada_tradicional: boolean | null
          price_m2_max: number | null
          price_m2_min: number | null
          provider_id: string | null
          publica_precios: boolean | null
          regions: string[] | null
          slug: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          tiny_houses: boolean | null
          updated_at: string | null
          verified_by_admin: boolean | null
          website: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_hq_region_code_fkey"
            columns: ["hq_region_code"]
            isOneToOne: false
            referencedRelation: "regions_lkp"
            referencedColumns: ["code"]
          },
        ]
      }
      providers_with_categories: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          categories: string[] | null
          city: string | null
          company_name: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          has_complete_info: boolean | null
          has_quality_images: boolean | null
          hq_region_code: string | null
          id: string | null
          is_manufacturer: boolean | null
          is_service_provider: boolean | null
          logo_url: string | null
          metadata: Json | null
          phone: string | null
          primary_category_from_roles: string | null
          profile_id: string | null
          rejection_reason: string | null
          slug: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          categories?: never
          city?: string | null
          company_name?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          has_complete_info?: boolean | null
          has_quality_images?: boolean | null
          hq_region_code?: string | null
          id?: string | null
          is_manufacturer?: boolean | null
          is_service_provider?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          primary_category_from_roles?: never
          profile_id?: string | null
          rejection_reason?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          categories?: never
          city?: string | null
          company_name?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          has_complete_info?: boolean | null
          has_quality_images?: boolean | null
          hq_region_code?: string | null
          id?: string | null
          is_manufacturer?: boolean | null
          is_service_provider?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          primary_category_from_roles?: never
          profile_id?: string | null
          rejection_reason?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          updated_at?: string | null
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
            foreignKeyName: "providers_hq_region_code_fkey"
            columns: ["hq_region_code"]
            isOneToOne: false
            referencedRelation: "regions_lkp"
            referencedColumns: ["code"]
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
      service_product_effective_regions: {
        Row: {
          region_code: string | null
          service_product_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_slug: { Args: { input_text: string }; Returns: string }
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
      is_admin: { Args: { user_id: string }; Returns: boolean }
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
      media_role:
        | "thumbnail"
        | "landing_hero"
        | "landing_secondary"
        | "landing_third"
        | "gallery"
        | "plan"
        | "brochure_pdf"
        | "cover"
        | "logo"
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
      media_role: [
        "thumbnail",
        "landing_hero",
        "landing_secondary",
        "landing_third",
        "gallery",
        "plan",
        "brochure_pdf",
        "cover",
        "logo",
      ],
      user_role: ["super_admin", "admin", "provider", "user"],
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const
