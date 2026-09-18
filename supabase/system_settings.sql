-- =====================================================================
-- Migration: system_settings
-- Description: Single-row global configuration table for Davelon Ent.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  support_email TEXT NOT NULL DEFAULT 'support@davelon.com',
  company_phone TEXT NOT NULL DEFAULT '+1 (555) 234-5678',
  office_address TEXT NOT NULL DEFAULT '100 Industrial Parkway, Suite 400, Austin, TX 78701',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  require_email_verification BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by TEXT
);

-- Seed default global row if absent
INSERT INTO public.system_settings (id, support_email, company_phone, office_address, maintenance_mode, require_email_verification)
VALUES ('global', 'support@davelon.com', '+1 (555) 234-5678', '100 Industrial Parkway, Suite 400, Austin, TX 78701', false, true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row-Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated users to read settings
DROP POLICY IF EXISTS "Allow read access to system_settings" ON public.system_settings;
CREATE POLICY "Allow read access to system_settings"
  ON public.system_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow Staff and Super Admins to update settings
DROP POLICY IF EXISTS "Allow staff and super admin update" ON public.system_settings;
CREATE POLICY "Allow staff and super admin update"
  ON public.system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'staff_admin')
    )
  );
