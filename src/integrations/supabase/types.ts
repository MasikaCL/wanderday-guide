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
      adventure_collaborators: {
        Row: {
          adventure_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["adventure_role"]
          user_id: string
        }
        Insert: {
          adventure_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["adventure_role"]
          user_id: string
        }
        Update: {
          adventure_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["adventure_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adventure_collaborators_adventure_id_fkey"
            columns: ["adventure_id"]
            isOneToOne: false
            referencedRelation: "adventures"
            referencedColumns: ["id"]
          },
        ]
      }
      adventure_folders: {
        Row: {
          created_at: string
          emoji: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      adventure_invitations: {
        Row: {
          accepted_at: string | null
          adventure_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["adventure_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          adventure_id: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["adventure_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          adventure_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["adventure_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "adventure_invitations_adventure_id_fkey"
            columns: ["adventure_id"]
            isOneToOne: false
            referencedRelation: "adventures"
            referencedColumns: ["id"]
          },
        ]
      }
      adventures: {
        Row: {
          city: string
          cover_emoji: string
          created_at: string
          current_stop_index: number
          date: string | null
          folder_id: string | null
          id: string
          kid_mode: boolean
          name: string
          shape_variant: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          cover_emoji?: string
          created_at?: string
          current_stop_index?: number
          date?: string | null
          folder_id?: string | null
          id?: string
          kid_mode?: boolean
          name: string
          shape_variant?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          cover_emoji?: string
          created_at?: string
          current_stop_index?: number
          date?: string | null
          folder_id?: string | null
          id?: string
          kid_mode?: boolean
          name?: string
          shape_variant?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adventures_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "adventure_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      stops: {
        Row: {
          address: string | null
          adventure_id: string
          category: string
          completed: boolean
          created_at: string
          duration: number | null
          emoji: string
          facts: string[]
          google_maps_url: string | null
          id: string
          kid_description: string | null
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          order_index: number
          spot_it: string | null
          start_time: string | null
          tags: string[]
          updated_at: string
          user_id: string
          walking_time_to_next: number | null
        }
        Insert: {
          address?: string | null
          adventure_id: string
          category: string
          completed?: boolean
          created_at?: string
          duration?: number | null
          emoji?: string
          facts?: string[]
          google_maps_url?: string | null
          id?: string
          kid_description?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          order_index: number
          spot_it?: string | null
          start_time?: string | null
          tags?: string[]
          updated_at?: string
          user_id: string
          walking_time_to_next?: number | null
        }
        Update: {
          address?: string | null
          adventure_id?: string
          category?: string
          completed?: boolean
          created_at?: string
          duration?: number | null
          emoji?: string
          facts?: string[]
          google_maps_url?: string | null
          id?: string
          kid_description?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          order_index?: number
          spot_it?: string | null
          start_time?: string | null
          tags?: string[]
          updated_at?: string
          user_id?: string
          walking_time_to_next?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stops_adventure_id_fkey"
            columns: ["adventure_id"]
            isOneToOne: false
            referencedRelation: "adventures"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_adventure_invitation: { Args: { _token: string }; Returns: string }
      get_invitation_by_token: {
        Args: { _token: string }
        Returns: {
          accepted_at: string
          adventure_city: string
          adventure_id: string
          adventure_name: string
          email: string
          role: Database["public"]["Enums"]["adventure_role"]
        }[]
      }
      has_adventure_access: {
        Args: {
          _adventure_id: string
          _min_role?: Database["public"]["Enums"]["adventure_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      adventure_role: "owner" | "editor" | "viewer"
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
      adventure_role: ["owner", "editor", "viewer"],
    },
  },
} as const
