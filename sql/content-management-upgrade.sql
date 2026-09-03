-- Add authorship and attempt-limit fields for admin content management.
-- Run after database.sql in Supabase SQL Editor.

ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS created_by_profile uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS max_attempts integer;

ALTER TABLE public.quiz_questions
ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.quizzes
DROP CONSTRAINT IF EXISTS quizzes_max_attempts_check;

ALTER TABLE public.quizzes
ADD CONSTRAINT quizzes_max_attempts_check
CHECK (max_attempts IS NULL OR max_attempts > 0);

-- Allow admins to view and manage quiz metadata from the admin portal.
DROP POLICY IF EXISTS "quizzes_admin_read_all" ON public.quizzes;
CREATE POLICY "quizzes_admin_read_all"
ON public.quizzes FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "quizzes_admin_insert" ON public.quizzes;
CREATE POLICY "quizzes_admin_insert"
ON public.quizzes FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "quizzes_admin_update" ON public.quizzes;
CREATE POLICY "quizzes_admin_update"
ON public.quizzes FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "quizzes_admin_delete" ON public.quizzes;
CREATE POLICY "quizzes_admin_delete"
ON public.quizzes FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "quiz_questions_admin_read_all" ON public.quiz_questions;
CREATE POLICY "quiz_questions_admin_read_all"
ON public.quiz_questions FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "quiz_questions_admin_insert" ON public.quiz_questions;
CREATE POLICY "quiz_questions_admin_insert"
ON public.quiz_questions FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "quiz_choices_admin_read_all" ON public.quiz_choices;
CREATE POLICY "quiz_choices_admin_read_all"
ON public.quiz_choices FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "quiz_choices_admin_insert" ON public.quiz_choices;
CREATE POLICY "quiz_choices_admin_insert"
ON public.quiz_choices FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- Teachers can view students and create content, but cannot manage accounts.
DROP POLICY IF EXISTS "profiles_teacher_read_students" ON public.profiles;
CREATE POLICY "profiles_teacher_read_students"
ON public.profiles FOR SELECT TO authenticated
USING (
  role = 'student'
  OR id = auth.uid()
);

DROP POLICY IF EXISTS "students_teacher_read_all" ON public.students;
CREATE POLICY "students_teacher_read_all"
ON public.students FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  OR id = auth.uid()
);

DROP POLICY IF EXISTS "subjects_teacher_read_all" ON public.subjects;
CREATE POLICY "subjects_teacher_read_all"
ON public.subjects FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

DROP POLICY IF EXISTS "modules_teacher_read_all" ON public.modules;
CREATE POLICY "modules_teacher_read_all"
ON public.modules FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

DROP POLICY IF EXISTS "quizzes_teacher_read_all" ON public.quizzes;
CREATE POLICY "quizzes_teacher_read_all"
ON public.quizzes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

DROP POLICY IF EXISTS "modules_teacher_insert" ON public.modules;
CREATE POLICY "modules_teacher_insert"
ON public.modules FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  AND teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "quizzes_teacher_insert" ON public.quizzes;
CREATE POLICY "quizzes_teacher_insert"
ON public.quizzes FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "quiz_questions_teacher_insert" ON public.quiz_questions;
CREATE POLICY "quiz_questions_teacher_insert"
ON public.quiz_questions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quizzes
    WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "quiz_choices_teacher_insert" ON public.quiz_choices;
CREATE POLICY "quiz_choices_teacher_insert"
ON public.quiz_choices FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quiz_questions
    JOIN public.quizzes ON quizzes.id = quiz_questions.quiz_id
    WHERE quiz_questions.id = quiz_choices.question_id
      AND quizzes.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "subjects_student_read_published" ON public.subjects;
CREATE POLICY "subjects_student_read_published"
ON public.subjects FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student'));

DROP POLICY IF EXISTS "modules_student_read_published" ON public.modules;
CREATE POLICY "modules_student_read_published"
ON public.modules FOR SELECT TO authenticated
USING (
  status = 'published'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
);

DROP POLICY IF EXISTS "quizzes_student_read_published" ON public.quizzes;
CREATE POLICY "quizzes_student_read_published"
ON public.quizzes FOR SELECT TO authenticated
USING (
  status = 'published'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
);

DROP POLICY IF EXISTS "quiz_questions_student_read_published" ON public.quiz_questions;
CREATE POLICY "quiz_questions_student_read_published"
ON public.quiz_questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.status = 'published'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
  )
);

DROP POLICY IF EXISTS "quiz_choices_student_read_published" ON public.quiz_choices;
CREATE POLICY "quiz_choices_student_read_published"
ON public.quiz_choices FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.quiz_questions
    JOIN public.quizzes ON quizzes.id = quiz_questions.quiz_id
    WHERE quiz_questions.id = quiz_choices.question_id
      AND quizzes.status = 'published'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
  )
);

DROP POLICY IF EXISTS "quiz_attempts_student_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_student_own"
ON public.quiz_attempts FOR ALL TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "student_answers_student_own" ON public.student_answers;
CREATE POLICY "student_answers_student_own"
ON public.student_answers FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE quiz_attempts.id = student_answers.attempt_id
      AND quiz_attempts.student_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE quiz_attempts.id = student_answers.attempt_id
      AND quiz_attempts.student_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "module_progress_student_own" ON public.module_progress;
CREATE POLICY "module_progress_student_own"
ON public.module_progress FOR SELECT TO authenticated
USING (student_id = auth.uid());

DROP POLICY IF EXISTS "module_progress_student_insert" ON public.module_progress;
CREATE POLICY "module_progress_student_insert"
ON public.module_progress FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "module_progress_student_update" ON public.module_progress;
CREATE POLICY "module_progress_student_update"
ON public.module_progress FOR UPDATE TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Backfill existing admin-created modules where the original script did not
-- store an uploader. The profile id is resolved by email, not hard-coded.
UPDATE public.modules
SET uploaded_by = profiles.id
FROM public.profiles
WHERE modules.uploaded_by IS NULL
  AND profiles.role = 'admin'
  AND profiles.username = 'admin';