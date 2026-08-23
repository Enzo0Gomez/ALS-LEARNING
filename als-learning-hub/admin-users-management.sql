-- ============================================================
-- ADMIN USER MANAGEMENT
-- Run in: Supabase Dashboard > SQL Editor > New query > Run
--
-- Adds:
--   1. is_active column on profiles (account status tracking)
--   2. Admin UPDATE policy on profiles (edit name/role)
--   3. admin_set_user_password() RPC (reset any user's password)
--   4. admin_set_user_active() RPC (deactivate/activate accounts)
--
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Track account status on profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ------------------------------------------------------------
-- 2. Admins can update ANY profile (name, role, etc.)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;

CREATE POLICY "profiles_admin_update_all"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 3. Admin-only password reset
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_user_password(
    target_user_id uuid,
    new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can reset passwords.';
    END IF;

    IF LENGTH(new_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters.';
    END IF;

    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf'))
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_password(uuid, text)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(uuid, text)
TO authenticated;

-- ------------------------------------------------------------
-- 4. Admin-only activate / deactivate account
--    Deactivated users can no longer log in (GoTrue ban).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_user_active(
    target_user_id uuid,
    is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can manage account status.';
    END IF;

    UPDATE auth.users
    SET banned_until = CASE
        WHEN admin_set_user_active.is_active THEN NULL
        ELSE now() + INTERVAL '100 years'
    END
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;

    UPDATE public.profiles
    SET is_active = admin_set_user_active.is_active
    WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_active(uuid, boolean)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_active(uuid, boolean)
TO authenticated;