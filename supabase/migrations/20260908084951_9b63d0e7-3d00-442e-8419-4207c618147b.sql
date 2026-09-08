CREATE TABLE public.access_grants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'razorpay',
  razorpay_payment_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.access_grants TO authenticated;
GRANT ALL ON public.access_grants TO service_role;

ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access grant"
  ON public.access_grants FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER access_grants_updated
  BEFORE UPDATE ON public.access_grants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();