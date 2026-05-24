CREATE TABLE public.university_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_key text NOT NULL,
  rank integer NOT NULL,
  university text NOT NULL,
  country text,
  q1 numeric NOT NULL DEFAULT 0,
  q2 numeric NOT NULL DEFAULT 0,
  q3 numeric NOT NULL DEFAULT 0,
  q4 numeric NOT NULL DEFAULT 0,
  q5 numeric NOT NULL DEFAULT 0,
  q6 numeric NOT NULL DEFAULT 0,
  q7 numeric NOT NULL DEFAULT 0,
  q8 numeric NOT NULL DEFAULT 0,
  q9 numeric NOT NULL DEFAULT 0,
  q10 numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_university_benchmarks_course ON public.university_benchmarks(course_key, total DESC);

ALTER TABLE public.university_benchmarks ENABLE ROW LEVEL SECURITY;

-- No public read; server functions use service role to read this reference table.
-- (Intentionally no policies; service role bypasses RLS.)
