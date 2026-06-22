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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          author_name_en: string | null
          category: string | null
          category_en: string | null
          content: string
          content_en: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          excerpt_en: string | null
          featured: boolean
          gallery_urls: string[]
          id: string
          published: boolean
          reading_time: number | null
          sort_order: number
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          author_name_en?: string | null
          category?: string | null
          category_en?: string | null
          content: string
          content_en?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          featured?: boolean
          gallery_urls?: string[]
          id?: string
          published?: boolean
          reading_time?: number | null
          sort_order?: number
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          author_name_en?: string | null
          category?: string | null
          category_en?: string | null
          content?: string
          content_en?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          featured?: boolean
          gallery_urls?: string[]
          id?: string
          published?: boolean
          reading_time?: number | null
          sort_order?: number
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
        }
        Relationships: []
      }
      order_meetings: {
        Row: {
          channel: string
          created_at: string
          duration_minutes: number
          id: string
          location: string | null
          notes: string | null
          order_id: string
          scheduled_at: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          order_id: string
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          order_id?: string
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          published: boolean
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          method: string
          notes: string | null
          order_id: string
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method?: string
          notes?: string | null
          order_id: string
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string
          notes?: string | null
          order_id?: string
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          accent: string
          category: string
          client_ar: string | null
          client_en: string | null
          color: string
          content_ar: string | null
          content_en: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          duration: string | null
          gallery_urls: string[] | null
          id: string
          process_steps_ar: string[] | null
          process_steps_en: string[] | null
          project_url: string | null
          published: boolean
          sort_order: number
          title_ar: string
          title_en: string
          updated_at: string
          year: string | null
        }
        Insert: {
          accent?: string
          category?: string
          client_ar?: string | null
          client_en?: string | null
          color?: string
          content_ar?: string | null
          content_en?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration?: string | null
          gallery_urls?: string[] | null
          id?: string
          process_steps_ar?: string[] | null
          process_steps_en?: string[] | null
          project_url?: string | null
          published?: boolean
          sort_order?: number
          title_ar: string
          title_en: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          accent?: string
          category?: string
          client_ar?: string | null
          client_en?: string | null
          color?: string
          content_ar?: string | null
          content_en?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration?: string | null
          gallery_urls?: string[] | null
          id?: string
          process_steps_ar?: string[] | null
          process_steps_en?: string[] | null
          project_url?: string | null
          published?: boolean
          sort_order?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_type: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_type?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          id: string
          interests?: string[] | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_type?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          currency: string
          current_stage: number
          description: string | null
          estimated_delivery: string | null
          id: string
          paid_amount: number
          service_key: string
          service_name_ar: string
          service_name_en: string | null
          stage1_completed_at: string | null
          stage1_name: string
          stage2_completed_at: string | null
          stage2_name: string
          stage3_completed_at: string | null
          stage3_name: string
          stage4_completed_at: string | null
          stage4_name: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          currency?: string
          current_stage?: number
          description?: string | null
          estimated_delivery?: string | null
          id?: string
          paid_amount?: number
          service_key: string
          service_name_ar: string
          service_name_en?: string | null
          stage1_completed_at?: string | null
          stage1_name?: string
          stage2_completed_at?: string | null
          stage2_name?: string
          stage3_completed_at?: string | null
          stage3_name?: string
          stage4_completed_at?: string | null
          stage4_name?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          currency?: string
          current_stage?: number
          description?: string | null
          estimated_delivery?: string | null
          id?: string
          paid_amount?: number
          service_key?: string
          service_name_ar?: string
          service_name_en?: string | null
          stage1_completed_at?: string | null
          stage1_name?: string
          stage2_completed_at?: string | null
          stage2_name?: string
          stage3_completed_at?: string | null
          stage3_name?: string
          stage4_completed_at?: string | null
          stage4_name?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          availability_badge: string | null
          bullets: string[]
          created_at: string
          cta_section_description: string | null
          cta_section_title: string | null
          cta_text: string | null
          currency: string
          deliverables: string[]
          deliverables_title: string | null
          description: string | null
          duration: string | null
          faqs: Json
          faqs_title: string | null
          features: string[]
          features_title: string | null
          gallery: Json
          hero_subtitle: string | null
          id: string
          image_alt: string | null
          image_caption: string | null
          image_fit: string
          image_height: number
          image_url: string | null
          long_description: string | null
          number: string
          overview_title: string | null
          price_from: number | null
          process_steps: string[]
          process_title: string | null
          published: boolean
          reasons: string[]
          reasons_title: string | null
          seo_description: string | null
          seo_title: string | null
          sort_order: number
          summary_title: string | null
          tagline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          availability_badge?: string | null
          bullets?: string[]
          created_at?: string
          cta_section_description?: string | null
          cta_section_title?: string | null
          cta_text?: string | null
          currency?: string
          deliverables?: string[]
          deliverables_title?: string | null
          description?: string | null
          duration?: string | null
          faqs?: Json
          faqs_title?: string | null
          features?: string[]
          features_title?: string | null
          gallery?: Json
          hero_subtitle?: string | null
          id: string
          image_alt?: string | null
          image_caption?: string | null
          image_fit?: string
          image_height?: number
          image_url?: string | null
          long_description?: string | null
          number?: string
          overview_title?: string | null
          price_from?: number | null
          process_steps?: string[]
          process_title?: string | null
          published?: boolean
          reasons?: string[]
          reasons_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: number
          summary_title?: string | null
          tagline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          availability_badge?: string | null
          bullets?: string[]
          created_at?: string
          cta_section_description?: string | null
          cta_section_title?: string | null
          cta_text?: string | null
          currency?: string
          deliverables?: string[]
          deliverables_title?: string | null
          description?: string | null
          duration?: string | null
          faqs?: Json
          faqs_title?: string | null
          features?: string[]
          features_title?: string | null
          gallery?: Json
          hero_subtitle?: string | null
          id?: string
          image_alt?: string | null
          image_caption?: string | null
          image_fit?: string
          image_height?: number
          image_url?: string | null
          long_description?: string | null
          number?: string
          overview_title?: string | null
          price_from?: number | null
          process_steps?: string[]
          process_title?: string | null
          published?: boolean
          reasons?: string[]
          reasons_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: number
          summary_title?: string | null
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: Json
          page_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          page_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          page_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          published: boolean
          quote: string
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          published?: boolean
          quote: string
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          published?: boolean
          quote?: string
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_is_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_email: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
