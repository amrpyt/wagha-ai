-- ============================================================
-- Migration: 002_platform_schema
-- Wagha-ai Platform Redesign — Multi-template rendering
-- ============================================================

-- ── New columns on projects ──────────────────────────────────────────

ALTER TABLE projects ADD COLUMN render_type TEXT DEFAULT 'exterior'
  CHECK (render_type IN ('exterior', 'interior'));

ALTER TABLE projects ADD COLUMN template TEXT DEFAULT 'modern'
  CHECK (template IN ('modern', 'classic', 'minimal', 'villa', 'commercial', 'landscape', 'residential', 'commercial', 'office', 'retail'));

ALTER TABLE projects ADD COLUMN modifiers JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN custom_prompt TEXT;
ALTER TABLE projects ADD COLUMN input_urls TEXT[];
ALTER TABLE projects ADD COLUMN reference_urls TEXT[];

-- ── Render presets ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS render_presets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id uuid REFERENCES firms ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  thumbnail_url text,
  render_type text NOT NULL CHECK (render_type IN ('exterior', 'interior')),
  template text NOT NULL,
  modifiers JSONB DEFAULT '{}',
  custom_prompt text,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE render_presets ENABLE ROW LEVEL SECURITY;

-- Firm members can view presets
CREATE POLICY "Members can view firm presets"
  ON render_presets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM firm_members
      WHERE firm_members.firm_id = render_presets.firm_id
      AND firm_members.user_id = auth.uid()
    )
  );

-- Firm members can insert presets
CREATE POLICY "Members can create presets"
  ON render_presets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM firm_members
      WHERE firm_members.firm_id = render_presets.firm_id
      AND firm_members.user_id = auth.uid()
    )
  );

-- Firm members can delete their own presets
CREATE POLICY "Members can delete own presets"
  ON render_presets FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM firm_members
      WHERE firm_members.firm_id = render_presets.firm_id
      AND firm_members.user_id = auth.uid()
    )
  );
