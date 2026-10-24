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
      access_grants: {
        Row: {
          created_at: string
          id: string
          razorpay_payment_id: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          razorpay_payment_id?: string | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          razorpay_payment_id?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      applicant_profiles: {
        Row: {
          academics: Json
          activities: Json
          created_at: string
          essays: Json
          personal: Json
          preferences: Json
          recommendations: Json
          status: string
          submitted_at: string | null
          testing: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          academics?: Json
          activities?: Json
          created_at?: string
          essays?: Json
          personal?: Json
          preferences?: Json
          recommendations?: Json
          status?: string
          submitted_at?: string | null
          testing?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          academics?: Json
          activities?: Json
          created_at?: string
          essays?: Json
          personal?: Json
          preferences?: Json
          recommendations?: Json
          status?: string
          submitted_at?: string | null
          testing?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      university_benchmarks: {
        Row: {
          country: string | null
          course_key: string
          created_at: string
          id: string
          q1: number
          q10: number
          q2: number
          q3: number
          q4: number
          q5: number
          q6: number
          q7: number
          q8: number
          q9: number
          rank: number
          total: number
          university: string
        }
        Insert: {
          country?: string | null
          course_key: string
          created_at?: string
          id?: string
          q1?: number
          q10?: number
          q2?: number
          q3?: number
          q4?: number
          q5?: number
          q6?: number
          q7?: number
          q8?: number
          q9?: number
          rank: number
          total: number
          university: string
        }
        Update: {
          country?: string | null
          course_key?: string
          created_at?: string
          id?: string
          q1?: number
          q10?: number
          q2?: number
          q3?: number
          q4?: number
          q5?: number
          q6?: number
          q7?: number
          q8?: number
          q9?: number
          rank?: number
          total?: number
          university?: string
        }
        Relationships: []
      }
      university_weights: {
        Row: {
          academics_weight: number
          cocurricular_weight: number
          country: string
          course_key: string
          created_at: string
          cutoff_notes: string | null
          essay_sop_weight: number
          extracurricular_weight: number
          id: string
          leadership_weight: number
          logo_url: string | null
          minimum_profile_score: number
          projects_weight: number
          rank: number
          supercurricular_weight: number
          university: string
          updated_at: string
        }
        Insert: {
          academics_weight?: number
          cocurricular_weight?: number
          country?: string
          course_key?: string
          created_at?: string
          cutoff_notes?: string | null
          essay_sop_weight?: number
          extracurricular_weight?: number
          id?: string
          leadership_weight?: number
          logo_url?: string | null
          minimum_profile_score?: number
          projects_weight?: number
          rank: number
          supercurricular_weight?: number
          university: string
          updated_at?: string
        }
        Update: {
          academics_weight?: number
          cocurricular_weight?: number
          country?: string
          course_key?: string
          created_at?: string
          cutoff_notes?: string | null
          essay_sop_weight?: number
          extracurricular_weight?: number
          id?: string
          leadership_weight?: number
          logo_url?: string | null
          minimum_profile_score?: number
          projects_weight?: number
          rank?: number
          supercurricular_weight?: number
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
