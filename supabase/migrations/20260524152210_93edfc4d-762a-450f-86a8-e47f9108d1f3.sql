DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.university_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank integer NOT NULL,
  university text NOT NULL,
  country text NOT NULL DEFAULT '',
  logo_url text,
  course_key text NOT NULL DEFAULT 'all',
  academics_weight numeric NOT NULL DEFAULT 0,
  supercurricular_weight numeric NOT NULL DEFAULT 0,
  extracurricular_weight numeric NOT NULL DEFAULT 0,
  cocurricular_weight numeric NOT NULL DEFAULT 0,
  essay_sop_weight numeric NOT NULL DEFAULT 0,
  projects_weight numeric NOT NULL DEFAULT 0,
  leadership_weight numeric NOT NULL DEFAULT 0,
  minimum_profile_score numeric NOT NULL DEFAULT 0,
  cutoff_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university, country, course_key)
);

ALTER TABLE public.university_weights ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_university_weights_updated_at ON public.university_weights;
CREATE TRIGGER set_university_weights_updated_at
BEFORE UPDATE ON public.university_weights
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Anyone authenticated can view university weights" ON public.university_weights;
CREATE POLICY "Anyone authenticated can view university weights"
ON public.university_weights
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can create university weights" ON public.university_weights;
CREATE POLICY "Admins can create university weights"
ON public.university_weights
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can edit university weights" ON public.university_weights;
CREATE POLICY "Admins can edit university weights"
ON public.university_weights
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete university weights" ON public.university_weights;
CREATE POLICY "Admins can delete university weights"
ON public.university_weights
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_university_weights_course_rank ON public.university_weights(course_key, rank);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);