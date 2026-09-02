-- ============================================================
-- DIAGNOSTIC: Show all enum type values in the database
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

SELECT t.typname AS enum_type, e.enumlabel AS value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;