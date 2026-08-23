-- ============================================================
-- DIAGNOSTIC: Show RLS policies on profiles & admins tables
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Check 1: Is RLS enabled on these tables?
SELECT relname, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('profiles', 'admins')
  AND relnamespace = 'public'::regnamespace;

-- Check 2: All policies on profiles
SELECT schemaname, tablename, policyname, permissive, cmd,
       roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Check 3: All policies on admins
SELECT schemaname, tablename, policyname, permissive, cmd,
       roles, qual, with_check
FROM pg_policies
WHERE tablename = 'admins';