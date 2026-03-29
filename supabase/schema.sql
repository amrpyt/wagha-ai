-- ================================================
-- Wagha-ai Database Schema
-- Multi-tenant SaaS with Row-Level Security
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- FIRMS (Organizations)
-- ================================================
create table firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  brand_color text default '#1E3A5F',
  free_render_used boolean default false,
  owner_id uuid references auth.users not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table firms enable row level security;

-- Firms are selectable by their owner
create policy "Firms are viewable by their owner"
  on firms for select
  to authenticated
  using (owner_id = auth.uid());

-- Firms are updatable by their owner
create policy "Firms are updatable by their owner"
  on firms for update
  to authenticated
  using (owner_id = auth.uid());

-- New firms can be inserted (owner is set on signup)
create policy "Firms can be created by authenticated users"
  on firms for insert
  to authenticated
  with check (owner_id = auth.uid());

-- ================================================
-- FIRM MEMBERS (Team Members)
-- ================================================
create table firm_members (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  unique(firm_id, user_id)
);

alter table firm_members enable row level security;

-- Members can view their firm membership
create policy "Members can view their firm membership"
  on firm_members for select
  to authenticated
  using (user_id = auth.uid());

-- Firm owners can insert members
create policy "Firm owners can add members"
  on firm_members for insert
  to authenticated
  with check (
    exists (
      select 1 from firms
      where firms.id = firm_members.firm_id
      and firms.owner_id = auth.uid()
    )
  );

-- Members can delete themselves (not others)
create policy "Members can remove themselves"
  on firm_members for delete
  to authenticated
  using (user_id = auth.uid());

-- ================================================
-- FOLDERS (Project Organization)
-- ================================================
create table folders (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms on delete cascade not null,
  name text not null,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

alter table folders enable row level security;

-- Folder policy: user must be a firm member
create policy "Members can view firm folders"
  on folders for select
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = folders.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- Insert: must be firm member
create policy "Members can create folders"
  on folders for insert
  to authenticated
  with check (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = folders.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- Delete: must be firm member
create policy "Members can delete folders"
  on folders for delete
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = folders.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- ================================================
-- PROJECTS
-- ================================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms on delete cascade not null,
  folder_id uuid references folders on delete set null,
  name text not null,
  project_number text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'complete', 'failed')),
  render_url text,
  pdf_url text,
  error_message text,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

-- Select: must be firm member
create policy "Members can view firm projects"
  on projects for select
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = projects.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- Insert: must be firm member
create policy "Members can create projects"
  on projects for insert
  to authenticated
  with check (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = projects.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- Update: must be firm member
create policy "Members can update projects"
  on projects for update
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = projects.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- Delete: must be firm member
create policy "Members can delete projects"
  on projects for delete
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = projects.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- ================================================
-- SUBSCRIPTIONS
-- ================================================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms on delete cascade not null unique,
  plan text not null check (plan in ('starter', 'business', 'pro')),
  paymob_subscription_id text,
  credits_remaining integer not null default 0,
  billing_cycle_start timestamptz default now(),
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'past_due', 'trial')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

-- Select: must be firm member
create policy "Members can view their firm subscription"
  on subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = subscriptions.firm_id
      and firm_members.user_id = auth.uid()
    )
  );

-- Insert/Update: only via service role (webhooks) - restrict here too
create policy "Service role can manage subscriptions"
  on subscriptions for all
  to authenticated
  using (auth.jwt()->>'role' = 'service_role');

-- ================================================
-- INVITATIONS (Team Invite Flow)
-- ================================================
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms on delete cascade not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid references auth.users,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  token text unique not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now()
);

alter table invitations enable row level security;

-- Invitations viewable by firm owners
create policy "Owners can view firm invitations"
  on invitations for select
  to authenticated
  using (
    exists (
      select 1 from firms
      where firms.id = invitations.firm_id
      and firms.owner_id = auth.uid()
    )
  );

-- Anyone can insert an invitation (signup via invite link)
create policy "Anyone can create an invitation"
  on invitations for insert
  to authenticated
  with check (
    exists (
      select 1 from firms
      where firms.id = invitations.firm_id
      and firms.owner_id = auth.uid()
    )
  );

-- Invitee can update (accept/decline)
create policy "Invitee can update invitation status"
  on invitations for update
  to authenticated
  using (invitations.email = auth.jwt()->>'email');

-- ================================================
-- PENDING ORDERS (Paymob Order Tracking)
-- ================================================
create table pending_orders (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms not null,
  plan text not null,
  merchant_order_id text unique not null,
  amount integer not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table pending_orders enable row level security;

-- Users can view their own pending orders
create policy "Users can view their own pending orders"
  on pending_orders for select
  using (auth.uid() = firm_id);

-- Users can insert their own pending orders
create policy "Users can insert their own pending orders"
  on pending_orders for insert
  with check (auth.uid() = firm_id);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to get the current user's firm_id
create or replace function get_user_firm_id()
returns uuid as $$
  select firm_id
  from firm_members
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Function to get the current user's role in their firm
create or replace function get_user_firm_role()
returns text as $$
  select role
  from firm_members
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Trigger to auto-create firm_members on user signup
create or replace function handle_new_user()
returns trigger as $$
declare
  firm_id uuid;
begin
  -- If user was invited (has firm_id in app_metadata), add to firm_members
  if (new.raw_app_meta_data->>'firm_id') is not null then
    firm_id := (new.raw_app_meta_data->>'firm_id')::uuid;
    insert into firm_members (firm_id, user_id, role)
    values (firm_id, new.id, coalesce((new.raw_app_meta_data->>'role')::text, 'member'))
    on conflict (firm_id, user_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
