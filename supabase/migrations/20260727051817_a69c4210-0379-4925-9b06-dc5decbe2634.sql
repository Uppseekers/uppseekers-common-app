
CREATE OR REPLACE FUNCTION public.protect_applicant_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    NEW.status := OLD.status;
    NEW.submitted_at := OLD.submitted_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_applicant_status_trg ON public.applicant_profiles;
CREATE TRIGGER protect_applicant_status_trg
  BEFORE UPDATE ON public.applicant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_applicant_status();
