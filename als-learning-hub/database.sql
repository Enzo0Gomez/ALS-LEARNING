-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  profile_image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  username text UNIQUE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.teachers (
  id uuid NOT NULL,
  position text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teachers_pkey PRIMARY KEY (id),
  CONSTRAINT teachers_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL,
  education_level USER-DEFINED NOT NULL,
  learner_id text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);
CREATE TABLE public.subjects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text,
  education_level USER-DEFINED,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.modules (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subject_id bigint NOT NULL,
  teacher_id uuid,
  title text NOT NULL,
  description text,
  grade_level text,
  pdf_url text,
  thumbnail text,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::content_status,
  module_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT modules_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.quizzes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  module_id bigint NOT NULL,
  title text NOT NULL,
  description text,
  pdf_url text,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::content_status,
  time_limit_minutes integer,
  passing_score numeric,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.teachers(id)
);
CREATE TABLE public.quiz_questions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  quiz_id bigint NOT NULL,
  question text NOT NULL,
  question_type USER-DEFINED NOT NULL DEFAULT 'multiple_choice'::question_type,
  points integer NOT NULL DEFAULT 1,
  question_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.quiz_choices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  question_id bigint NOT NULL,
  choice_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  choice_order integer NOT NULL DEFAULT 0,
  CONSTRAINT quiz_choices_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id)
);
CREATE TABLE public.quiz_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  quiz_id bigint NOT NULL,
  student_id uuid NOT NULL,
  score numeric,
  total_points integer,
  percentage numeric,
  passed boolean,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
  CONSTRAINT quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.student_answers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  attempt_id bigint NOT NULL,
  question_id bigint NOT NULL,
  selected_choice_id bigint,
  answer_text text,
  is_correct boolean,
  points_earned numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_answers_pkey PRIMARY KEY (id),
  CONSTRAINT student_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(id),
  CONSTRAINT student_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id),
  CONSTRAINT student_answers_selected_choice_id_fkey FOREIGN KEY (selected_choice_id) REFERENCES public.quiz_choices(id)
);
CREATE TABLE public.module_progress (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  module_id bigint NOT NULL,
  student_id uuid NOT NULL,
  progress_percentage numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT module_progress_pkey PRIMARY KEY (id),
  CONSTRAINT module_progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT module_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.teacher_subjects (
  teacher_id uuid NOT NULL,
  subject_id bigint NOT NULL,
  CONSTRAINT teacher_subjects_pkey PRIMARY KEY (teacher_id, subject_id),
  CONSTRAINT teacher_subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id),
  CONSTRAINT teacher_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL,
  position text DEFAULT 'Administrator'::text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  email text UNIQUE,
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);