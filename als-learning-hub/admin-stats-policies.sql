-- ============================================================
-- ADMIN DASHBOARD STATS: Read access for admin
-- Run in: Supabase Dashboard > SQL Editor > New query > Run
--
-- Lets admins read modules & quiz_attempts so the dashboard
-- can show upload counts and quiz participation numbers.
-- ============================================================

-- Drop old versions if re-running
DROP POLICY IF EXISTS "modules_admin_read_all" ON public.modules;
DROP POLICY IF EXISTS "quiz_attempts_admin_read_all" ON public.quiz_attempts;

-- Admins can view all modules (to count Google Drive uploads)
CREATE POLICY "modules_admin_read_all"
ON public.modules FOR SELECT TO authenticated
USING (public.is_admin());

-- Admins can view all quiz attempts (to count quiz takers)
CREATE POLICY "quiz_attempts_admin_read_all"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (public.is_admin());