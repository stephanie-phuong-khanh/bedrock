export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          supabase_uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          supabase_uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          supabase_uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          ocr_data: Json | null
          storage_path: string
          supabase_uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ocr_data?: Json | null
          storage_path: string
          supabase_uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ocr_data?: Json | null
          storage_path?: string
          supabase_uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          supabase_uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          supabase_uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          supabase_uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          department_id: string | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_id: string | null
          invoice_number: string | null
          memo: string | null
          paid_date: string | null
          payment_network: Database["public"]["Enums"]["payment_network"]
          receiver_wallet_address: string
          sender_wallet_address: string
          status: Database["public"]["Enums"]["payment_status"]
          supabase_uid: string
          tx_hash: string | null
          updated_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          department_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_id?: string | null
          invoice_number?: string | null
          memo?: string | null
          paid_date?: string | null
          payment_network: Database["public"]["Enums"]["payment_network"]
          receiver_wallet_address: string
          sender_wallet_address: string
          status?: Database["public"]["Enums"]["payment_status"]
          supabase_uid: string
          tx_hash?: string | null
          updated_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          department_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_id?: string | null
          invoice_number?: string | null
          memo?: string | null
          paid_date?: string | null
          payment_network?: Database["public"]["Enums"]["payment_network"]
          receiver_wallet_address?: string
          sender_wallet_address?: string
          status?: Database["public"]["Enums"]["payment_status"]
          supabase_uid?: string
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "payment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_provider: string
          auth_provider_id: string
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          supabase_uid: string
          updated_at: string
        }
        Insert: {
          auth_provider: string
          auth_provider_id: string
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          supabase_uid: string
          updated_at?: string
        }
        Update: {
          auth_provider?: string
          auth_provider_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          supabase_uid?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          supabase_uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          supabase_uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          supabase_uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      currency_code: "USDC"
      payment_network:
        | "ethereum"
        | "base"
        | "arbitrum"
        | "optimism"
        | "polygon"
        | "avalanche"
        | "base-sepolia"
      payment_status: "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED"
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
      currency_code: ["USDC"],
      payment_network: [
        "ethereum",
        "base",
        "arbitrum",
        "optimism",
        "polygon",
        "avalanche",
        "base-sepolia",
      ],
      payment_status: ["PENDING", "SUBMITTED", "CONFIRMED", "FAILED"],
    },
  },
} as const
