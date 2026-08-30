-- ============================================================
-- ADMIN CONTENT + USER CREATION SETUP
-- Run in: Supabase Dashboard > SQL Editor > New query > Run
--
-- Adds:
--   1. learning-materials storage bucket for PDFs/DOCs
--   2. Admin-friendly storage policies for learning materials
--   3. Admin insert/update/delete policies for subjects/modules
--   4. admin_create_user() RPC used by Admin > Users > Add User
--
-- Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. Storage bucket for learning materials
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-materials', 'learning-materials', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

DROP POLICY IF EXISTS "learning_materials_read" ON storage.objects;
CREATE POLICY "learning_materials_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'learning-materials');

DROP POLICY IF EXISTS "learning_materials_admin_insert" ON storage.objects;
CREATE POLICY "learning_materials_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'learning-materials'
    AND public.is_admin()
);

DROP POLICY IF EXISTS "learning_materials_admin_update" ON storage.objects;
CREATE POLICY "learning_materials_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'learning-materials'
    AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'learning-materials'
    AND public.is_admin()
);

DROP POLICY IF EXISTS "learning_materials_admin_delete" ON storage.objects;
CREATE POLICY "learning_materials_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'learning-materials'
    AND public.is_admin()
);

-- ------------------------------------------------------------
-- 2. Admin content policies
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "subjects_admin_insert" ON public.subjects;
CREATE POLICY "subjects_admin_insert"
ON public.subjects FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "subjects_admin_update" ON public.subjects;
CREATE POLICY "subjects_admin_update"
ON public.subjects FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "subjects_admin_delete" ON public.subjects;
CREATE POLICY "subjects_admin_delete"
ON public.subjects FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "modules_admin_insert" ON public.modules;
CREATE POLICY "modules_admin_insert"
ON public.modules FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "modules_admin_update" ON public.modules;
CREATE POLICY "modules_admin_update"
ON public.modules FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "modules_admin_delete" ON public.modules;
CREATE POLICY "modules_admin_delete"
ON public.modules FOR DELETE TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------
-- 3. Admin-only create user RPC
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_user(
    user_email text,
    user_password text,
    user_first_name text,
    user_last_name text,
    user_username text,
    user_role text,
    user_education_level text DEFAULT NULL,
    user_lrn text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can create users.';
    END IF;

    IF user_email IS NULL OR btrim(user_email) = '' THEN
        RAISE EXCEPTION 'Email is required.';
    END IF;

    IF user_password IS NULL OR length(user_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters.';
    END IF;

    IF user_role NOT IN ('admin', 'teacher', 'student') THEN
        RAISE EXCEPTION 'Invalid role.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM auth.users WHERE lower(email) = lower(btrim(user_email))
    ) THEN
        RAISE EXCEPTION 'Email is already registered.';
    END IF;

    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    )
    VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        lower(btrim(user_email)),
        crypt(user_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now()
    );

    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        role,
        username,
        is_active
    )
    VALUES (
        new_user_id,
        btrim(user_first_name),
        btrim(user_last_name),
        user_role::public.user_role,
        btrim(user_username),
        true
    );

    IF user_role = 'student' THEN
        INSERT INTO public.students (id, education_level, learner_id)
        VALUES (
            new_user_id,
            COALESCE(
                NULLIF(user_education_level, ''),
                'junior_high_school'
            )::public.education_level,
            NULLIF(btrim(user_lrn), '')
        );
    ELSIF user_role = 'teacher' THEN
        INSERT INTO public.teachers (id)
        VALUES (new_user_id);
    ELSIF user_role = 'admin' THEN
        INSERT INTO public.admins (id, email)
        VALUES (new_user_id, lower(btrim(user_email)));
    END IF;

    RETURN new_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_user(
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_create_user(
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text
) TO authenticated;
