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
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_daily: {
        Row: {
          clicks_contact: number | null
          clicks_detail: number | null
          date: string
          id: string
          inquiries_count: number | null
          item_id: string
          item_type: string
          saves_count: number | null
          shares_count: number | null
          unique_visitors: number | null
          views_count: number | null
        }
        Insert: {
          clicks_contact?: number | null
          clicks_detail?: number | null
          date: string
          id?: string
          inquiries_count?: number | null
          item_id: string
          item_type: string
          saves_count?: number | null
          shares_count?: number | null
          unique_visitors?: number | null
          views_count?: number | null
        }
        Update: {
          clicks_contact?: number | null
          clicks_detail?: number | null
          date?: string
          id?: string
          inquiries_count?: number | null
          item_id?: string
          item_type?: string
          saves_count?: number | null
          shares_count?: number | null
          unique_visitors?: number | null
          views_count?: number | null
        }
        Relationships: []
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
      blog_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_user_id_fkey"
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
          category: Database["public"]["Enums"]["blog_category"] | null
          content: string
          created_at: string | null
          editor_id: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          keywords: string[] | null
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          shares_count: number | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["blog_category"] | null
          content: string
          created_at?: string | null
          editor_id?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          shares_count?: number | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["blog_category"] | null
          content?: string
          created_at?: string | null
          editor_id?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          shares_count?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"] | null
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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          parent_id: string | null
          slug: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          parent_id?: string | null
          slug: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          slug?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_lists: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          item_ids: string[] | null
          item_type: string
          name: string | null
          share_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          item_ids?: string[] | null
          item_type: string
          name?: string | null
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          item_ids?: string[] | null
          item_type?: string
          name?: string | null
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          created_at: string | null
          display_order: number | null
          extra_data: Json | null
          id: string
          is_active: boolean | null
          setting_type: string
          title: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          extra_data?: Json | null
          id?: string
          is_active?: boolean | null
          setting_type: string
          title?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          extra_data?: Json | null
          id?: string
          is_active?: boolean | null
          setting_type?: string
          title?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      content_reviews: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          notes: string | null
          reviewed_by: string
          status: string
          updated_at: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      decorations: {
        Row: {
          availability_date: string | null
          brand: string | null
          category_id: string | null
          clicks_count: number | null
          colors: string[] | null
          created_at: string | null
          currency: string | null
          delivery_time_days: number | null
          description: string | null
          description_long: string | null
          dimensions: Json | null
          discount_percentage: number | null
          features: Json | null
          gallery_images: string[] | null
          has_variants: boolean | null
          id: string
          inquiries_count: number | null
          installation_guide_url: string | null
          installation_price: number | null
          installation_required: boolean | null
          is_available: boolean | null
          keywords: string[] | null
          main_image_url: string | null
          materials: string[] | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          model: string | null
          name: string
          parent_product_id: string | null
          price: number | null
          price_wholesale: number | null
          product_type: string
          provider_id: string | null
          sales_count: number | null
          saves_count: number | null
          sizes: string[] | null
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity: number | null
          stock_status: string | null
          technical_sheet_url: string | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          variant_attributes: Json | null
          videos: string[] | null
          views_count: number | null
          warranty_months: number | null
        }
        Insert: {
          availability_date?: string | null
          brand?: string | null
          category_id?: string | null
          clicks_count?: number | null
          colors?: string[] | null
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          description_long?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          features?: Json | null
          gallery_images?: string[] | null
          has_variants?: boolean | null
          id?: string
          inquiries_count?: number | null
          installation_guide_url?: string | null
          installation_price?: number | null
          installation_required?: boolean | null
          is_available?: boolean | null
          keywords?: string[] | null
          main_image_url?: string | null
          materials?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          model?: string | null
          name: string
          parent_product_id?: string | null
          price?: number | null
          price_wholesale?: number | null
          product_type: string
          provider_id?: string | null
          sales_count?: number | null
          saves_count?: number | null
          sizes?: string[] | null
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          technical_sheet_url?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          variant_attributes?: Json | null
          videos?: string[] | null
          views_count?: number | null
          warranty_months?: number | null
        }
        Update: {
          availability_date?: string | null
          brand?: string | null
          category_id?: string | null
          clicks_count?: number | null
          colors?: string[] | null
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          description_long?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          features?: Json | null
          gallery_images?: string[] | null
          has_variants?: boolean | null
          id?: string
          inquiries_count?: number | null
          installation_guide_url?: string | null
          installation_price?: number | null
          installation_required?: boolean | null
          is_available?: boolean | null
          keywords?: string[] | null
          main_image_url?: string | null
          materials?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          model?: string | null
          name?: string
          parent_product_id?: string | null
          price?: number | null
          price_wholesale?: number | null
          product_type?: string
          provider_id?: string | null
          sales_count?: number | null
          saves_count?: number | null
          sizes?: string[] | null
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          technical_sheet_url?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          variant_attributes?: Json | null
          videos?: string[] | null
          views_count?: number | null
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "decorations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decorations_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "decorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decorations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decorations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decorations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          page_id: string | null
          question: string
          tags: string[] | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          page_id?: string | null
          question: string
          tags?: string[] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          page_id?: string | null
          question?: string
          tags?: string[] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "static_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          category_id: string | null
          created_at: string | null
          display_order: number | null
          filter_format: string | null
          filter_location: string | null
          id: string
          is_active: boolean | null
          name: string
          options: Json | null
          show_in_card_featured: boolean | null
          show_in_card_premium: boolean | null
          show_in_landing: boolean | null
          slug: string
          type: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          filter_format?: string | null
          filter_location?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          options?: Json | null
          show_in_card_featured?: boolean | null
          show_in_card_premium?: boolean | null
          show_in_landing?: boolean | null
          slug: string
          type: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          filter_format?: string | null
          filter_location?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          options?: Json | null
          show_in_card_featured?: boolean | null
          show_in_card_premium?: boolean | null
          show_in_landing?: boolean | null
          slug?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "features_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_cost_estimates: {
        Row: {
          avg_cost: number | null
          category: string
          created_at: string | null
          currency: string | null
          estimate_type: string
          hotspot_id: string | null
          id: string
          last_updated: string | null
          max_cost: number | null
          min_cost: number | null
          notes: string | null
          source: string | null
          unit: string | null
        }
        Insert: {
          avg_cost?: number | null
          category: string
          created_at?: string | null
          currency?: string | null
          estimate_type: string
          hotspot_id?: string | null
          id?: string
          last_updated?: string | null
          max_cost?: number | null
          min_cost?: number | null
          notes?: string | null
          source?: string | null
          unit?: string | null
        }
        Update: {
          avg_cost?: number | null
          category?: string
          created_at?: string | null
          currency?: string | null
          estimate_type?: string
          hotspot_id?: string | null
          id?: string
          last_updated?: string | null
          max_cost?: number | null
          min_cost?: number | null
          notes?: string | null
          source?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_cost_estimates_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_demographics: {
        Row: {
          age_distribution: Json | null
          created_at: string | null
          economic_indicators: Json | null
          education_index: number | null
          hotspot_id: string | null
          id: string
          median_income: number | null
          population: number | null
          population_density: number | null
          year: number
        }
        Insert: {
          age_distribution?: Json | null
          created_at?: string | null
          economic_indicators?: Json | null
          education_index?: number | null
          hotspot_id?: string | null
          id?: string
          median_income?: number | null
          population?: number | null
          population_density?: number | null
          year: number
        }
        Update: {
          age_distribution?: Json | null
          created_at?: string | null
          economic_indicators?: Json | null
          education_index?: number | null
          hotspot_id?: string | null
          id?: string
          median_income?: number | null
          population?: number | null
          population_density?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_demographics_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_features: {
        Row: {
          created_at: string | null
          description: string | null
          distance_km: number | null
          feature_type: string
          hotspot_id: string | null
          icon: string | null
          id: string
          name: string
          rating: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          distance_km?: number | null
          feature_type: string
          hotspot_id?: string | null
          icon?: string | null
          id?: string
          name: string
          rating?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          distance_km?: number | null
          feature_type?: string
          hotspot_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_features_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_providers: {
        Row: {
          coverage_type: string | null
          created_at: string | null
          hotspot_id: string | null
          id: string
          notes: string | null
          priority_order: number | null
          provider_id: string | null
          service_radius_km: number | null
        }
        Insert: {
          coverage_type?: string | null
          created_at?: string | null
          hotspot_id?: string | null
          id?: string
          notes?: string | null
          priority_order?: number | null
          provider_id?: string | null
          service_radius_km?: number | null
        }
        Update: {
          coverage_type?: string | null
          created_at?: string | null
          hotspot_id?: string | null
          id?: string
          notes?: string | null
          priority_order?: number | null
          provider_id?: string | null
          service_radius_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_providers_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspots: {
        Row: {
          altitude_m: number | null
          city: string
          climate_data: Json | null
          construction_cost_m2_avg: number | null
          created_at: string | null
          description: string | null
          description_long: string | null
          distance_santiago_km: number | null
          gallery_images: string[] | null
          hero_image_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          nearest_airport: string | null
          permits_info: string | null
          population: number | null
          projects_count: number | null
          providers_count: number | null
          region: string
          regulations_info: string | null
          restrictions: string | null
          slug: string
          terrain_cost_max: number | null
          terrain_cost_min: number | null
          updated_at: string | null
          useful_links: Json | null
          why_build_here: string | null
        }
        Insert: {
          altitude_m?: number | null
          city: string
          climate_data?: Json | null
          construction_cost_m2_avg?: number | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          distance_santiago_km?: number | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          nearest_airport?: string | null
          permits_info?: string | null
          population?: number | null
          projects_count?: number | null
          providers_count?: number | null
          region: string
          regulations_info?: string | null
          restrictions?: string | null
          slug: string
          terrain_cost_max?: number | null
          terrain_cost_min?: number | null
          updated_at?: string | null
          useful_links?: Json | null
          why_build_here?: string | null
        }
        Update: {
          altitude_m?: number | null
          city?: string
          climate_data?: Json | null
          construction_cost_m2_avg?: number | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          distance_santiago_km?: number | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          nearest_airport?: string | null
          permits_info?: string | null
          population?: number | null
          projects_count?: number | null
          providers_count?: number | null
          region?: string
          regulations_info?: string | null
          restrictions?: string | null
          slug?: string
          terrain_cost_max?: number | null
          terrain_cost_min?: number | null
          updated_at?: string | null
          useful_links?: Json | null
          why_build_here?: string | null
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
          certifications: Json | null
          clicks_count: number | null
          created_at: string | null
          currency: string | null
          delivery_time_days: number | null
          description: string | null
          description_long: string | null
          energy_rating: string | null
          expandable: boolean | null
          features: Json | null
          floor_plans: string[] | null
          floors: number | null
          gallery_images: string[] | null
          has_variants: boolean | null
          id: string
          inquiries_count: number | null
          is_available: boolean | null
          keywords: string[] | null
          latitude: number | null
          llave_en_mano: boolean | null
          location_city: string | null
          location_region: string | null
          longitude: number | null
          main_image_url: string | null
          main_material: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          mobile: boolean | null
          model_code: string | null
          name: string
          off_grid_ready: boolean | null
          parent_house_id: string | null
          price: number | null
          price_opportunity: number | null
          price_per_m2: number | null
          provider_id: string | null
          sales_count: number | null
          saves_count: number | null
          services_included: string[] | null
          sku: string | null
          slug: string
          smart_home: boolean | null
          status: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity: number | null
          stock_status: string | null
          sustainable: boolean | null
          technology_materials: string[] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          topology_id: string | null
          updated_at: string | null
          variant_attributes: Json | null
          videos: string[] | null
          views_count: number | null
          virtual_tour_url: string | null
          warranty_years: number | null
          windows_type: string[] | null
        }
        Insert: {
          area_built_m2?: number | null
          area_m2?: number | null
          assembly_time_days?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          brochure_pdf_url?: string | null
          certifications?: Json | null
          clicks_count?: number | null
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          description_long?: string | null
          energy_rating?: string | null
          expandable?: boolean | null
          features?: Json | null
          floor_plans?: string[] | null
          floors?: number | null
          gallery_images?: string[] | null
          has_variants?: boolean | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          latitude?: number | null
          llave_en_mano?: boolean | null
          location_city?: string | null
          location_region?: string | null
          longitude?: number | null
          main_image_url?: string | null
          main_material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          mobile?: boolean | null
          model_code?: string | null
          name: string
          off_grid_ready?: boolean | null
          parent_house_id?: string | null
          price?: number | null
          price_opportunity?: number | null
          price_per_m2?: number | null
          provider_id?: string | null
          sales_count?: number | null
          saves_count?: number | null
          services_included?: string[] | null
          sku?: string | null
          slug: string
          smart_home?: boolean | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          sustainable?: boolean | null
          technology_materials?: string[] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          topology_id?: string | null
          updated_at?: string | null
          variant_attributes?: Json | null
          videos?: string[] | null
          views_count?: number | null
          virtual_tour_url?: string | null
          warranty_years?: number | null
          windows_type?: string[] | null
        }
        Update: {
          area_built_m2?: number | null
          area_m2?: number | null
          assembly_time_days?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          brochure_pdf_url?: string | null
          certifications?: Json | null
          clicks_count?: number | null
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          description_long?: string | null
          energy_rating?: string | null
          expandable?: boolean | null
          features?: Json | null
          floor_plans?: string[] | null
          floors?: number | null
          gallery_images?: string[] | null
          has_variants?: boolean | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          latitude?: number | null
          llave_en_mano?: boolean | null
          location_city?: string | null
          location_region?: string | null
          longitude?: number | null
          main_image_url?: string | null
          main_material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          mobile?: boolean | null
          model_code?: string | null
          name?: string
          off_grid_ready?: boolean | null
          parent_house_id?: string | null
          price?: number | null
          price_opportunity?: number | null
          price_per_m2?: number | null
          provider_id?: string | null
          sales_count?: number | null
          saves_count?: number | null
          services_included?: string[] | null
          sku?: string | null
          slug?: string
          smart_home?: boolean | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_quantity?: number | null
          stock_status?: string | null
          sustainable?: boolean | null
          technology_materials?: string[] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          topology_id?: string | null
          updated_at?: string | null
          variant_attributes?: Json | null
          videos?: string[] | null
          views_count?: number | null
          virtual_tour_url?: string | null
          warranty_years?: number | null
          windows_type?: string[] | null
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
            referencedRelation: "provider_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "houses_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_public_view"
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
            foreignKeyName: "houses_topology_id_fkey"
            columns: ["topology_id"]
            isOneToOne: false
            referencedRelation: "house_topologies"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          completed_at: string | null
          errors: Json | null
          failed_rows: number | null
          file_name: string
          id: string
          import_type: string
          imported_by: string | null
          metadata: Json | null
          started_at: string | null
          status: string | null
          successful_rows: number | null
          total_rows: number | null
        }
        Insert: {
          completed_at?: string | null
          errors?: Json | null
          failed_rows?: number | null
          file_name: string
          id?: string
          import_type: string
          imported_by?: string | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          successful_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          completed_at?: string | null
          errors?: Json | null
          failed_rows?: number | null
          file_name?: string
          id?: string
          import_type?: string
          imported_by?: string | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          successful_rows?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_logs_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "provider_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
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
      landing_sections: {
        Row: {
          background_image_url: string | null
          content: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          page_id: string | null
          section_type: string
          settings: Json | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          background_image_url?: string | null
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          page_id?: string | null
          section_type: string
          settings?: Json | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          background_image_url?: string | null
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          page_id?: string | null
          section_type?: string
          settings?: Json | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "static_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          created_at: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          price: number | null
          product_id: string
          product_type: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
          variant_name: string
        }
        Insert: {
          attributes: Json
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          price?: number | null
          product_id: string
          product_type: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          variant_name: string
        }
        Update: {
          attributes?: Json
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          price?: number | null
          product_id?: string
          product_type?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          variant_name?: string
        }
        Relationships: []
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
      providers: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          catalog_pdf_url: string | null
          category_type: Database["public"]["Enums"]["category_type"]
          certifications: Json | null
          city: string | null
          clicks_count: number | null
          company_name: string
          cover_image_url: string | null
          coverage_areas: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_long: string | null
          email: string
          featured_order: number | null
          featured_until: string | null
          features: Json | null
          financing_available: boolean | null
          gallery_images: string[] | null
          id: string
          inquiries_count: number | null
          internal_rating: number | null
          keywords: string[] | null
          llave_en_mano: boolean | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          onboarding_completed: boolean | null
          phone: string
          premium_until: string | null
          price_per_m2_max: number | null
          price_per_m2_min: number | null
          price_range_max: number | null
          price_range_min: number | null
          profile_id: string | null
          region: string | null
          rejection_reason: string | null
          services_offered: string[] | null
          slug: string
          specialties: string[] | null
          status: Database["public"]["Enums"]["listing_status"] | null
          temp_password: string | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          videos: string[] | null
          views_count: number | null
          website: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_pdf_url?: string | null
          category_type: Database["public"]["Enums"]["category_type"]
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name: string
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_long?: string | null
          email: string
          featured_order?: number | null
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string
          inquiries_count?: number | null
          internal_rating?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone: string
          premium_until?: string | null
          price_per_m2_max?: number | null
          price_per_m2_min?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          services_offered?: string[] | null
          slug: string
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          temp_password?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_pdf_url?: string | null
          category_type?: Database["public"]["Enums"]["category_type"]
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_long?: string | null
          email?: string
          featured_order?: number | null
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string
          inquiries_count?: number | null
          internal_rating?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string
          premium_until?: string | null
          price_per_m2_max?: number | null
          price_per_m2_min?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          services_offered?: string[] | null
          slug?: string
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          temp_password?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
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
            foreignKeyName: "providers_created_by_fkey"
            columns: ["created_by"]
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
      services: {
        Row: {
          booking_calendar: Json | null
          category_id: string | null
          clicks_count: number | null
          coverage_areas: string[] | null
          created_at: string | null
          current_bookings: number | null
          description: string | null
          description_long: string | null
          features: Json | null
          gallery_images: string[] | null
          id: string
          inquiries_count: number | null
          is_available: boolean | null
          keywords: string[] | null
          main_image_url: string | null
          max_bookings: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price_from: number | null
          price_to: number | null
          price_unit: string | null
          provider_id: string | null
          sales_count: number | null
          service_type: string
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          booking_calendar?: Json | null
          category_id?: string | null
          clicks_count?: number | null
          coverage_areas?: string[] | null
          created_at?: string | null
          current_bookings?: number | null
          description?: string | null
          description_long?: string | null
          features?: Json | null
          gallery_images?: string[] | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          main_image_url?: string | null
          max_bookings?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price_from?: number | null
          price_to?: number | null
          price_unit?: string | null
          provider_id?: string | null
          sales_count?: number | null
          service_type: string
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          booking_calendar?: Json | null
          category_id?: string | null
          clicks_count?: number | null
          coverage_areas?: string[] | null
          created_at?: string | null
          current_bookings?: number | null
          description?: string | null
          description_long?: string | null
          features?: Json | null
          gallery_images?: string[] | null
          id?: string
          inquiries_count?: number | null
          is_available?: boolean | null
          keywords?: string[] | null
          main_image_url?: string | null
          max_bookings?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price_from?: number | null
          price_to?: number | null
          price_unit?: string | null
          provider_id?: string | null
          sales_count?: number | null
          service_type?: string
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
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
          status: Database["public"]["Enums"]["page_status"]
          title: string
          type: Database["public"]["Enums"]["page_type"]
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
          status?: Database["public"]["Enums"]["page_status"]
          title: string
          type: Database["public"]["Enums"]["page_type"]
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
          status?: Database["public"]["Enums"]["page_status"]
          title?: string
          type?: Database["public"]["Enums"]["page_type"]
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
      user_searches: {
        Row: {
          alert_enabled: boolean | null
          created_at: string | null
          id: string
          name: string | null
          search_params: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          name?: string | null
          search_params: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          name?: string | null
          search_params?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      provider_admin_view: {
        Row: {
          address: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          catalog_pdf_url: string | null
          category_type: Database["public"]["Enums"]["category_type"] | null
          certifications: Json | null
          city: string | null
          clicks_count: number | null
          company_name: string | null
          cover_image_url: string | null
          coverage_areas: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_long: string | null
          email: string | null
          featured_order: number | null
          featured_until: string | null
          features: Json | null
          financing_available: boolean | null
          gallery_images: string[] | null
          id: string | null
          inquiries_count: number | null
          internal_rating: number | null
          keywords: string[] | null
          llave_en_mano: boolean | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          onboarding_completed: boolean | null
          phone: string | null
          premium_until: string | null
          price_per_m2_max: number | null
          price_per_m2_min: number | null
          price_range_max: number | null
          price_range_min: number | null
          profile_id: string | null
          region: string | null
          rejection_reason: string | null
          services_offered: string[] | null
          slug: string | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["listing_status"] | null
          temp_password: string | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          videos: string[] | null
          views_count: number | null
          website: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_pdf_url?: string | null
          category_type?: Database["public"]["Enums"]["category_type"] | null
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string | null
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_long?: string | null
          email?: string | null
          featured_order?: number | null
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string | null
          inquiries_count?: number | null
          internal_rating?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          premium_until?: string | null
          price_per_m2_max?: number | null
          price_per_m2_min?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          services_offered?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          temp_password?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_pdf_url?: string | null
          category_type?: Database["public"]["Enums"]["category_type"] | null
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string | null
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_long?: string | null
          email?: string | null
          featured_order?: number | null
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string | null
          inquiries_count?: number | null
          internal_rating?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          premium_until?: string | null
          price_per_m2_max?: number | null
          price_per_m2_min?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          services_offered?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          temp_password?: string | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
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
            foreignKeyName: "providers_created_by_fkey"
            columns: ["created_by"]
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
      provider_public_view: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          catalog_pdf_url: string | null
          category_type: Database["public"]["Enums"]["category_type"] | null
          certifications: Json | null
          city: string | null
          clicks_count: number | null
          company_name: string | null
          cover_image_url: string | null
          coverage_areas: string[] | null
          created_at: string | null
          description: string | null
          description_long: string | null
          email: string | null
          featured_until: string | null
          features: Json | null
          financing_available: boolean | null
          gallery_images: string[] | null
          id: string | null
          inquiries_count: number | null
          keywords: string[] | null
          llave_en_mano: boolean | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          onboarding_completed: boolean | null
          phone: string | null
          premium_until: string | null
          price_per_m2_max: number | null
          price_per_m2_min: number | null
          price_range_max: number | null
          price_range_min: number | null
          profile_id: string | null
          region: string | null
          rejection_reason: string | null
          services_offered: string[] | null
          slug: string | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["listing_status"] | null
          tier: Database["public"]["Enums"]["listing_tier"] | null
          updated_at: string | null
          videos: string[] | null
          views_count: number | null
          website: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_pdf_url?: string | null
          category_type?: Database["public"]["Enums"]["category_type"] | null
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string | null
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          email?: string | null
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string | null
          inquiries_count?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          premium_until?: string | null
          price_per_m2_max?: number | null
          price_per_m2_min?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          services_offered?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          catalog_pdf_url?: string | null
          category_type?: Database["public"]["Enums"]["category_type"] | null
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string | null
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          email?: string | null
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string | null
          inquiries_count?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          premium_until?: string | null
          price_per_m2_max?: number | null
          price_per_m2_min?: number | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_id?: string | null
          region?: string | null
          rejection_reason?: string | null
          services_offered?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          tier?: Database["public"]["Enums"]["listing_tier"] | null
          updated_at?: string | null
          videos?: string[] | null
          views_count?: number | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
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
    }
    Enums: {
      blog_category:
        | "tendencias"
        | "guias"
        | "casos_exito"
        | "noticias"
        | "tutoriales"
      blog_status: "draft" | "pending_review" | "published" | "archived"
      category_type:
        | "casas"
        | "fabricantes"
        | "habilitacion_servicios"
        | "decoracion"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "inactive"
        | "rejected"
      listing_tier: "premium" | "destacado" | "standard"
      page_status: "draft" | "published" | "archived"
      page_type:
        | "about_us"
        | "terms_conditions"
        | "privacy_policy"
        | "faq"
        | "contact"
        | "landing_section"
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
      blog_category: [
        "tendencias",
        "guias",
        "casos_exito",
        "noticias",
        "tutoriales",
      ],
      blog_status: ["draft", "pending_review", "published", "archived"],
      category_type: [
        "casas",
        "fabricantes",
        "habilitacion_servicios",
        "decoracion",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "active",
        "inactive",
        "rejected",
      ],
      listing_tier: ["premium", "destacado", "standard"],
      page_status: ["draft", "published", "archived"],
      page_type: [
        "about_us",
        "terms_conditions",
        "privacy_policy",
        "faq",
        "contact",
        "landing_section",
      ],
      user_role: ["super_admin", "admin", "provider", "user"],
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const


// Type aliases for easier use
export type Profile = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">
export type ProfileUpdate = TablesUpdate<"profiles">

export type Provider = Tables<"providers">
export type ProviderInsert = TablesInsert<"providers">
export type ProviderUpdate = TablesUpdate<"providers">

export type House = Tables<"houses">
export type HouseInsert = TablesInsert<"houses">
export type HouseUpdate = TablesUpdate<"houses">

export type Service = Tables<"services">
export type ServiceInsert = TablesInsert<"services">
export type ServiceUpdate = TablesUpdate<"services">

export type Inquiry = Tables<"inquiries">
export type InquiryInsert = TablesInsert<"inquiries">
export type InquiryUpdate = TablesUpdate<"inquiries">

export type Category = Tables<"categories">
export type CategoryInsert = TablesInsert<"categories">
export type CategoryUpdate = TablesUpdate<"categories">

export type BlogPost = Tables<"blog_posts">
export type BlogPostInsert = TablesInsert<"blog_posts">
export type BlogPostUpdate = TablesUpdate<"blog_posts">

export type BlogComment = Tables<"blog_comments">
export type BlogCommentInsert = TablesInsert<"blog_comments">
export type BlogCommentUpdate = TablesUpdate<"blog_comments">

export type UserFavorite = Tables<"user_favorites">
export type UserFavoriteInsert = TablesInsert<"user_favorites">
export type UserFavoriteUpdate = TablesUpdate<"user_favorites">

export type UserSearch = Tables<"user_searches">
export type UserSearchInsert = TablesInsert<"user_searches">
export type UserSearchUpdate = TablesUpdate<"user_searches">

export type Hotspot = Tables<"hotspots">
export type HotspotInsert = TablesInsert<"hotspots">
export type HotspotUpdate = TablesUpdate<"hotspots">

export type HouseTopology = Tables<"house_topologies">
export type HouseTopologyInsert = TablesInsert<"house_topologies">
export type HouseTopologyUpdate = TablesUpdate<"house_topologies">

export type Feature = Tables<"features">
export type FeatureInsert = TablesInsert<"features">
export type FeatureUpdate = TablesUpdate<"features">

export type AdminAction = Tables<"admin_actions">
export type AdminActionInsert = TablesInsert<"admin_actions">
export type AdminActionUpdate = TablesUpdate<"admin_actions">

export type AdminLog = Tables<"admin_logs">
export type AdminLogInsert = TablesInsert<"admin_logs">
export type AdminLogUpdate = TablesUpdate<"admin_logs">

export type AnalyticsDaily = Tables<"analytics_daily">
export type AnalyticsDailyInsert = TablesInsert<"analytics_daily">
export type AnalyticsDailyUpdate = TablesUpdate<"analytics_daily">

export type AnalyticsEvent = Tables<"analytics_events">
export type AnalyticsEventInsert = TablesInsert<"analytics_events">
export type AnalyticsEventUpdate = TablesUpdate<"analytics_events">

export type ContentReview = Tables<"content_reviews">
export type ContentReviewInsert = TablesInsert<"content_reviews">
export type ContentReviewUpdate = TablesUpdate<"content_reviews">

// Enum type exports
export type UserRole = Enums<"user_role">
export type UserStatus = Enums<"user_status">
export type CategoryType = Enums<"category_type">
export type ListingStatus = Enums<"listing_status">
export type ListingTier = Enums<"listing_tier">
export type BlogStatus = Enums<"blog_status">
export type BlogCategory = Enums<"blog_category">
