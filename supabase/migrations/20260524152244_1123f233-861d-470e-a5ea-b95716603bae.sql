REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

DROP POLICY IF EXISTS "Authenticated users can view university benchmarks" ON public.university_benchmarks;
CREATE POLICY "Authenticated users can view university benchmarks"
ON public.university_benchmarks
FOR SELECT
TO authenticated
USING (true);