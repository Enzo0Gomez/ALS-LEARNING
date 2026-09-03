-- Persistent landing page content managed from Admin > Settings > General.
-- Run after database.sql and the admin/RLS setup scripts.

CREATE TABLE IF NOT EXISTS public.site_settings (
    id boolean PRIMARY KEY DEFAULT true CHECK (id),
    hero_title text NOT NULL DEFAULT 'Learn.\nGrow.\nAchieve.',
    hero_description text NOT NULL DEFAULT 'Accessible learning materials designed to support every ALS learner on their journey toward achieving their goals.',
    primary_button_text text NOT NULL DEFAULT 'Explore Learning Materials',
    secondary_button_text text NOT NULL DEFAULT 'Learn About ALS',
    about_title text NOT NULL DEFAULT 'Alternative Learning System',
    about_description text NOT NULL DEFAULT 'The Alternative Learning System (ALS) is a parallel learning system of the Department of Education that provides a practical option for Filipinos who cannot access formal schooling.',
    teacher_name text NOT NULL DEFAULT 'Ma’am Tan',
    teacher_role text NOT NULL DEFAULT 'Elementary ALS Coordinator',
    teacher_bio text NOT NULL DEFAULT 'Hello, I am Ma’am Tan, an Elementary ALS Coordinator with eight years of service in the Alternative Learning System.',
    teacher_quote text NOT NULL DEFAULT 'Every learner deserves a supportive path back to education.',
    report_text text NOT NULL DEFAULT 'Track learner participation, quiz performance, and learning progress through the admin reports.',
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES public.profiles(id)
);

INSERT INTO public.site_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS about_title text NOT NULL DEFAULT 'Alternative Learning System',
ADD COLUMN IF NOT EXISTS about_description text NOT NULL DEFAULT 'The Alternative Learning System (ALS) is a parallel learning system of the Department of Education that provides a practical option for Filipinos who cannot access formal schooling.',
ADD COLUMN IF NOT EXISTS teacher_name text NOT NULL DEFAULT 'Ma’am Tan',
ADD COLUMN IF NOT EXISTS teacher_role text NOT NULL DEFAULT 'Elementary ALS Coordinator',
ADD COLUMN IF NOT EXISTS teacher_bio text NOT NULL DEFAULT 'Hello, I am Ma’am Tan, an Elementary ALS Coordinator with eight years of service in the Alternative Learning System.',
ADD COLUMN IF NOT EXISTS teacher_quote text NOT NULL DEFAULT 'Every learner deserves a supportive path back to education.',
ADD COLUMN IF NOT EXISTS report_text text NOT NULL DEFAULT 'Track learner participation, quiz performance, and learning progress through the admin reports.';

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.site_teachers (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    quote text,
    image_url text,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.site_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_teachers_public_read" ON public.site_teachers;
CREATE POLICY "site_teachers_public_read"
ON public.site_teachers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "site_teachers_admin_insert" ON public.site_teachers;
CREATE POLICY "site_teachers_admin_insert"
ON public.site_teachers FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_teachers_admin_update" ON public.site_teachers;
CREATE POLICY "site_teachers_admin_update"
ON public.site_teachers FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_teachers_admin_delete" ON public.site_teachers;
CREATE POLICY "site_teachers_admin_delete"
ON public.site_teachers FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
ON public.site_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "site_settings_admin_update" ON public.site_settings;
CREATE POLICY "site_settings_admin_update"
ON public.site_settings FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());