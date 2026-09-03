-- ============================================================
-- DIAGNOSTIC: Compare auth users & identities rows
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Check 1: Users side-by-side
SELECT
    u.email,
    u.id,
    u.email_confirmed_at,
    u.aud,
    u.role,
    u.instance_id,
    u.is_sso_user,
    u.raw_app_meta_data
FROM auth.users u
WHERE u.email IN (
    'alslearninghub.admin@gmail.com',
    'teacher.alslearninghub@gmail.com',
    'student.alslearninghub@gmail.com'
);

-- Check 2: Identities for all three users
SELECT
    u.email AS user_email,
    i.provider,
    i.id AS identity_id_value,
    i.provider_id,
    i.identity_data
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email IN (
    'alslearninghub.admin@gmail.com',
    'teacher.alslearninghub@gmail.com',
    'student.alslearninghub@gmail.com'
);