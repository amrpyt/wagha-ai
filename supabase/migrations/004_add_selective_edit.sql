-- ============================================================
-- Migration: 004_add_selective_edit
-- Add selective_edit column to projects for D-12/D-13/D-14
-- ============================================================

ALTER TABLE projects ADD COLUMN selective_edit BOOLEAN DEFAULT false;