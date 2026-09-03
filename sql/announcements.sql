-- Run after database.sql and admin/content setup scripts.
CREATE TABLE IF NOT EXISTS public.announcements (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    image_url text,
    pdf_url text,
    for_teacher boolean NOT NULL DEFAULT true,
    for_student boolean NOT NULL DEFAULT true,
    post_landing boolean NOT NULL DEFAULT false,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_public_landing_read" ON public.announcements;
CREATE POLICY "announcements_public_landing_read" ON public.announcements FOR SELECT USING (post_landing = true);
DROP POLICY IF EXISTS "announcements_student_read" ON public.announcements;
CREATE POLICY "announcements_student_read" ON public.announcements FOR SELECT TO authenticated USING (
    for_student = true
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
);
DROP POLICY IF EXISTS "announcements_admin_read" ON public.announcements;
CREATE POLICY "announcements_admin_read" ON public.announcements FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "announcements_admin_insert" ON public.announcements;
CREATE POLICY "announcements_admin_insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "announcements_admin_update" ON public.announcements;
CREATE POLICY "announcements_admin_update" ON public.announcements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "announcements_admin_delete" ON public.announcements;
CREATE POLICY "announcements_admin_delete" ON public.announcements FOR DELETE TO authenticated USING (public.is_admin());