export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          description: string | null
          description_long: string | null
          email: string
          featured_until: string | null
          features: Json | null
          financing_available: boolean | null
          gallery_images: string[] | null
          id: string
          inquiries_count: number | null
          keywords: string[] | null
          llave_en_mano: boolean | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
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
          category_type: Database["public"]["Enums"]["category_type"]
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name: string
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          email: string
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string
          inquiries_count?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
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
          category_type?: Database["public"]["Enums"]["category_type"]
          certifications?: Json | null
          city?: string | null
          clicks_count?: number | null
          company_name?: string
          cover_image_url?: string | null
          coverage_areas?: string[] | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          email?: string
          featured_until?: string | null
          features?: Json | null
          financing_available?: boolean | null
          gallery_images?: string[] | null
          id?: string
          inquiries_count?: number | null
          keywords?: string[] | null
          llave_en_mano?: boolean | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
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
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
      user_role:
        | "super_admin"
        | "admin"
        | "editor"
        | "author"
        | "provider"
        | "user"
      user_status: "active" | "inactive" | "suspended" | "pending_verification"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Export type helpers for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenience types
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type Provider = Tables<'providers'>
export type ProviderInsert = TablesInsert<'providers'>
export type ProviderUpdate = TablesUpdate<'providers'>

export type UserRole = Enums<'user_role'>
export type UserStatus = Enums<'user_status'>
export type CategoryType = Enums<'category_type'>
export type ListingStatus = Enums<'listing_status'>
export type ListingTier = Enums<'listing_tier'>