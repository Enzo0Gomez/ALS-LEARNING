-- ============================================================
-- SETUP: Teacher & Student accounts (fully via SQL - no emails)
-- Run in: Supabase Dashboard > SQL Editor > New query > Run
--
-- Creates:
--   TEACHER: teacher.alslearninghub@gmail.com / Teacher@12345
--   STUDENT: student.alslearninghub@gmail.com / Student@12345
--
-- Safe to run multiple times (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create TEACHER auth user (confirmed immediately)
-- ------------------------------------------------------------
DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'teacher.alslearninghub@gmail.com';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            last_sign_in_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('Teacher@12345', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"username":"teacher.maria","role":"teacher"}',
            now(),
            now(),
            now()
        ) RETURNING id INTO v_user_id;
    ELSE
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Teacher user not found after insert: %', v_email;
    END IF;

    -- Make sure the email is confirmed (covers partial signups)
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = v_email;

    -- Add identity row (adapts to old/new auth.identities schemas)
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM auth.identities
            WHERE provider = 'email' AND user_id = v_user_id
        ) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'auth'
                  AND table_name = 'identities'
                  AND column_name = 'identity_data'
            ) THEN
                -- Newer schema: identity_data jsonb is required
                INSERT INTO auth.identities (
                    id, user_id, provider_id, provider,
                    identity_data, last_sign_in_at, created_at, updated_at
                ) VALUES (
                    gen_random_uuid()::text,
                    v_user_id,
                    'email',
                    'email',
                    jsonb_build_object(
                        'sub', v_user_id::text,
                        'email', v_email,
                        'email_verified', true
                    ),
                    now(), now(), now()
                );
            ELSE
                -- Older schema: plain columns only
                INSERT INTO auth.identities (
                    id, user_id, provider_id, provider,
                    last_sign_in_at, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), v_user_id, 'email', 'email',
                    now(), now(), now()
                );
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Identity row is optional for password login - don't fail the setup
        RAISE NOTICE 'Skipping identity row for %: %', v_email, SQLERRM;
    END;
END $$;

-- ------------------------------------------------------------
-- 2. Create STUDENT auth user (confirmed immediately)
-- ------------------------------------------------------------
DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'student.alslearninghub@gmail.com';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            last_sign_in_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('Student@12345', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"username":"student.juan","role":"student","lrn":"136100123456"}',
            now(),
            now(),
            now()
        ) RETURNING id INTO v_user_id;
    ELSE
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Student user not found after insert: %', v_email;
    END IF;

    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = v_email;

    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM auth.identities
            WHERE provider = 'email' AND user_id = v_user_id
        ) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'auth'
                  AND table_name = 'identities'
                  AND column_name = 'identity_data'
            ) THEN
                INSERT INTO auth.identities (
                    id, user_id, provider_id, provider,
                    identity_data, last_sign_in_at, created_at, updated_at
                ) VALUES (
                    gen_random_uuid()::text,
                    v_user_id,
                    'email',
                    'email',
                    jsonb_build_object(
                        'sub', v_user_id::text,
                        'email', v_email,
                        'email_verified', true
                    ),
                    now(), now(), now()
                );
            ELSE
                INSERT INTO auth.identities (
                    id, user_id, provider_id, provider,
                    last_sign_in_at, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), v_user_id, 'email', 'email',
                    now(), now(), now()
                );
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipping identity row for %: %', v_email, SQLERRM;
    END;
END $$;

-- ------------------------------------------------------------
-- 3. Profile rows (teacher + student)
-- ------------------------------------------------------------
INSERT INTO public.profiles (id, first_name, last_name, role, username)
SELECT id, 'Maria', 'Tan', 'teacher', 'teacher.maria'
FROM auth.users
WHERE email = 'teacher.alslearninghub@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role, username)
SELECT id, 'Juan', 'Dela Cruz', 'student', 'student.juan'
FROM auth.users
WHERE email = 'student.alslearninghub@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. Teachers table row
-- ------------------------------------------------------------
INSERT INTO public.teachers (id, position, description)
SELECT p.id, 'ALS Teacher', 'Demo teacher account'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'teacher.alslearninghub@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 5. Students table row
--    Education level is looked up dynamically from the enum
--    (cast to the enum type), preferring a value containing
--    'junior' (case-insensitive).
-- ------------------------------------------------------------
INSERT INTO public.students (id, education_level, learner_id)
SELECT
    p.id,
    COALESCE(
        (SELECT e.enumlabel::text::public.education_level
         FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
         WHERE t.typname = 'education_level'
           AND e.enumlabel ILIKE '%junior%'
         ORDER BY e.enumsortorder
         LIMIT 1),
        (SELECT e.enumlabel::text::public.education_level
         FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
         WHERE t.typname = 'education_level'
         ORDER BY e.enumsortorder
         LIMIT 1)
    ),
    '136100123456'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'student.alslearninghub@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 6. RLS policies for students & teachers tables
--    (same pattern as profiles so signup/login work)
-- ------------------------------------------------------------

-- Clean slate: drop old policies on both tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('students', 'teachers')
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON public.%I',
            pol.policyname,
            pol.tablename
        );
    END LOOP;
END $$;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Students: own-row access
CREATE POLICY "students_select_own"
ON public.students FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "students_insert_own"
ON public.students FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "students_update_own"
ON public.students FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "students_admin_read_all"
ON public.students FOR SELECT TO authenticated
USING (public.is_admin());

-- Teachers: own-row access
CREATE POLICY "teachers_select_own"
ON public.teachers FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "teachers_insert_own"
ON public.teachers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "teachers_update_own"
ON public.teachers FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "teachers_admin_read_all"
ON public.teachers FOR SELECT TO authenticated
USING (public.is_admin());