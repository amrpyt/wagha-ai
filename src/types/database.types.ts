export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Firm = {
  id: string
  name: string
  logo_url: string | null
  brand_color: string
  free_render_used: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export type FirmMember = {
  id: string
  firm_id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
}

export type Folder = {
  id: string
  firm_id: string
  name: string
  created_by: string | null
  created_at: string
}

export type Project = {
  id: string
  firm_id: string
  folder_id: string | null
  name: string
  project_number: string | null
  status: 'pending' | 'processing' | 'complete' | 'failed'
  render_url: string | null
  pdf_url: string | null
  error_message: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  render_type?: 'exterior' | 'interior'
  template?: string
  modifiers?: Json
  custom_prompt?: string | null
  input_urls?: string[] | null
  reference_urls?: string[] | null
}

export type GenerationHistory = {
  id: string
  project_id: string
  render_url: string
  input_url: string
  render_type: 'exterior' | 'interior'
  template: string
  modifiers: Json
  custom_prompt: string | null
  created_by: string | null
  created_at: string
}

export type RenderPreset = {
  id: string
  firm_id: string
  name: string
  thumbnail_url: string | null
  render_type: 'exterior' | 'interior'
  template: string
  modifiers: Json
  custom_prompt: string | null
  created_by: string | null
  created_at: string
}

export type Subscription = {
  id: string
  firm_id: string
  plan: 'starter' | 'business' | 'pro'
  paymob_subscription_id: string | null
  credits_remaining: number
  billing_cycle_start: string
  status: 'active' | 'cancelled' | 'past_due' | 'trial'
  created_at: string
  updated_at: string
}

export type Invitation = {
  id: string
  firm_id: string
  email: string
  role: 'admin' | 'member'
  invited_by: string | null
  status: 'pending' | 'accepted' | 'declined'
  token: string
  expires_at: string
  created_at: string
}

export type PendingOrder = {
  id: string
  firm_id: string
  plan: string
  merchant_order_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      firms: {
        Row: Firm
        Insert: Omit<Firm, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Firm, 'id' | 'created_at'>>
      }
      firm_members: {
        Row: FirmMember
        Insert: Omit<FirmMember, 'id' | 'created_at'>
        Update: Partial<Omit<FirmMember, 'id'>>
      }
      folders: {
        Row: Folder
        Insert: Omit<Folder, 'id' | 'created_at'>
        Update: Partial<Omit<Folder, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id'>>
      }
      invitations: {
        Row: Invitation
        Insert: Omit<Invitation, 'id' | 'created_at'>
        Update: Partial<Omit<Invitation, 'id'>>
      }
      pending_orders: {
        Row: PendingOrder
        Insert: Omit<PendingOrder, 'id' | 'created_at'>
        Update: Partial<Omit<PendingOrder, 'id'>>
      }
      generation_history: {
        Row: GenerationHistory
        Insert: Omit<GenerationHistory, 'id' | 'created_at'>
        Update: Partial<Omit<GenerationHistory, 'id'>>
      }
      render_presets: {
        Row: RenderPreset
        Insert: Omit<RenderPreset, 'id' | 'created_at'>
        Update: Partial<Omit<RenderPreset, 'id'>>
      }
    }
  }
}
