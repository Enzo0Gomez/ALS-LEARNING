-- ============================================================
-- DIAGNOSTIC: Check what actually exists in the database
-- Run in: Supabase Dashboard > SQL Editor > New query
-- Then copy/paste the RESULTS back to me.
-- ============================================================

-- Check 1: Does the auth user exist and is it confirmed?
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'alslearninghub.admin@gmail.com';

-- Check 2: All rows in profiles table
SELECT id, first_name, last_name, role, username
FROM public.profiles;

-- Check 3: All rows in admins table
SELECT id, email
FROM public.admins;