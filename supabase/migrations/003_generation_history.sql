-- ============================================================
-- Migration: 003_generation_history
-- Stores each generation version for a project (v1, v2, v3...)
-- ============================================================

CREATE TABLE IF NOT EXISTS generation_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  render_url text NOT NULL,
  input_url text NOT NULL,
  render_type text NOT NULL CHECK (render_type IN ('exterior', 'interior')),
  template text NOT NULL,
  modifiers JSONB DEFAULT '{}',
  custom_prompt text,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- Firm members can view generation history
CREATE POLICY "Firm members can view generation history"
  ON generation_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generation_history.project_id
      AND projects.firm_id IN (
        SELECT firm_id FROM firm_members WHERE user_id = auth.uid()
      )
    )
  );

-- Firm members can insert generation history
CREATE POLICY "Firm members can insert generation history"
  ON generation_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generation_history.project_id
      AND projects.created_by = auth.uid()
    )
  );
