-- ============================================================
-- ADMIN ACCOUNT SETUP SCRIPT
-- Run this in: Supabase Dashboard > SQL Editor > New query
--
-- This will:
--   1. Confirm the email of the admin auth user (already created)
--   2. Create the profile row with role = 'admin'
--   3. Add the user to the admins table
-- ============================================================

-- 1. Confirm the email so login is allowed immediately
UPDATE auth.users
SET
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'alslearninghub.admin@gmail.com';

-- 2. Create the profile with role = 'admin'
INSERT INTO public.profiles (id, first_name, last_name, role, username)
VALUES (
    'f1bfed89-0660-45d4-82fe-1dc3c1d08e53',
    'System',
    'Administrator',
    'admin',
    'admin'
)
ON CONFLICT (id) DO UPDATE
SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = 'admin',
    username = EXCLUDED.username;

-- 3. Register in the admins table
INSERT INTO public.admins (id, email)
VALUES (
    'f1bfed89-0660-45d4-82fe-1dc3c1d08e53',
    'alslearninghub.admin@gmail.com'
)
ON CONFLICT (id) DO NOTHING;