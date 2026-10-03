-- =====================================================================
-- Migration: system_settings
-- Description: Single-row global configuration table for Davelon Ent.
-- Allows Super Admin updates and public reads for Maintenance Mode.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by TEXT
);

-- Seed default single global configuration row if absent
INSERT INTO public.system_settings (id, maintenance_mode)
VALUES ('global', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row-Level Security (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (Anon and Authenticated can read maintenance mode)
DROP POLICY IF EXISTS "Allow public read access to system_settings" ON public.system_settings;
CREATE POLICY "Allow public read access to system_settings"
  ON public.system_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Allow Super Admin updates only
DROP POLICY IF EXISTS "Allow super admin update to system_settings" ON public.system_settings;
CREATE POLICY "Allow super admin update to system_settings"
  ON public.system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Policy 3: Allow Super Admin inserts
DROP POLICY IF EXISTS "Allow super admin insert to system_settings" ON public.system_settings;
CREATE POLICY "Allow super admin insert to system_settings"
  ON public.system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );
