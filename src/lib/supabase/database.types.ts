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
      firm_members: {
        Row: {
          created_at: string | null
          firm_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          firm_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          firm_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "firm_members_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          brand_color: string | null
          created_at: string | null
          free_render_used: boolean | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          created_at?: string | null
          free_render_used?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          created_at?: string | null
          free_render_used?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          firm_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          firm_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          firm_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          firm_id: string
          id: string
          invited_by: string | null
          role: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          firm_id: string
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          firm_id?: string
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_orders: {
        Row: {
          amount: number
          created_at: string | null
          firm_id: string
          id: string
          merchant_order_id: string
          plan: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          firm_id: string
          id?: string
          merchant_order_id: string
          plan: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          firm_id?: string
          id?: string
          merchant_order_id?: string
          plan?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_orders_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_prompt: string | null
          error_message: string | null
          firm_id: string
          folder_id: string | null
          id: string
          input_urls: string[] | null
          modifiers: Json | null
          name: string
          pdf_url: string | null
          project_number: string | null
          reference_urls: string[] | null
          render_type: string | null
          render_url: string | null
          status: string
          template: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_prompt?: string | null
          error_message?: string | null
          firm_id: string
          folder_id?: string | null
          id?: string
          input_urls?: string[] | null
          modifiers?: Json | null
          name: string
          pdf_url?: string | null
          project_number?: string | null
          reference_urls?: string[] | null
          render_type?: string | null
          render_url?: string | null
          status?: string
          template?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_prompt?: string | null
          error_message?: string | null
          firm_id?: string
          folder_id?: string | null
          id?: string
          input_urls?: string[] | null
          modifiers?: Json | null
          name?: string
          pdf_url?: string | null
          project_number?: string | null
          reference_urls?: string[] | null
          render_type?: string | null
          render_url?: string | null
          status?: string
          template?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      render_presets: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_prompt: string | null
          firm_id: string
          id: string
          modifiers: Json | null
          name: string
          render_type: string
          template: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_prompt?: string | null
          firm_id: string
          id?: string
          modifiers?: Json | null
          name: string
          render_type: string
          template: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_prompt?: string | null
          firm_id?: string
          id?: string
          modifiers?: Json | null
          name?: string
          render_type?: string
          template?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "render_presets_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle_start: string | null
          created_at: string | null
          credits_remaining: number
          firm_id: string
          id: string
          paymob_subscription_id: string | null
          plan: string
          status: string
          updated_at: string | null
        }
        Insert: {
          billing_cycle_start?: string | null
          created_at?: string | null
          credits_remaining?: number
          firm_id: string
          id?: string
          paymob_subscription_id?: string | null
          plan: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          billing_cycle_start?: string | null
          created_at?: string | null
          credits_remaining?: number
          firm_id?: string
          id?: string
          paymob_subscription_id?: string | null
          plan?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: true
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_firm_id: { Args: never; Returns: string }
      get_user_firm_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
