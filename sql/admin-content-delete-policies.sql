-- Admin policies required when deleting modules with quiz content.
-- Run after database.sql and content-management-upgrade.sql.

DROP POLICY IF EXISTS "quiz_questions_admin_delete" ON public.quiz_questions;
CREATE POLICY "quiz_questions_admin_delete"
ON public.quiz_questions FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "quiz_choices_admin_delete" ON public.quiz_choices;
CREATE POLICY "quiz_choices_admin_delete"
ON public.quiz_choices FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "quiz_attempts_admin_delete" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_admin_delete"
ON public.quiz_attempts FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "student_answers_admin_delete" ON public.student_answers;
CREATE POLICY "student_answers_admin_delete"
ON public.student_answers FOR DELETE TO authenticated
USING (public.is_admin());
