-- ============================================================
-- FIX: RLS policies for public.profiles
-- Run in: Supabase Dashboard > SQL Editor > New query > Run
--
-- What this does:
--   1. Creates an is_admin() helper function (safe, no recursion)
--   2. Removes ALL old/broken policies on profiles
--   3. Recreates correct policies:
--        - Users can SELECT their own profile   (needed for login)
--        - Users can INSERT their own profile   (needed for signup)
--        - Users can UPDATE their own profile
--        - Admins can SELECT all profiles       (for admin features)
-- ============================================================

-- 1. Helper function: check if current user is an admin
--    SECURITY DEFINER lets it read profiles without hitting RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$;

-- 2. Make sure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies on profiles (clean slate)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON public.profiles',
            pol.policyname
        );
    END LOOP;
END $$;

-- 4. Recreate correct policies

-- Everyone logged in can read their OWN profile (required by Login.jsx)
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- New users can create their OWN profile row (required by Signup.jsx)
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their OWN profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can read ALL profiles (useful for managing users later)
CREATE POLICY "profiles_admin_read_all"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());