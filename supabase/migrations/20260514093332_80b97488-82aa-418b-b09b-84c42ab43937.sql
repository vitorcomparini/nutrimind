
-- Add avatar and baseline revenue to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS baseline_revenue NUMERIC(12,2);

-- Mentee monthly metrics (revenue + patients). Ticket médio = revenue/patients_count
CREATE TABLE IF NOT EXISTS public.mentee_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID NOT NULL,
  month_year TEXT NOT NULL,  -- 'YYYY-MM'
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  patients_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (mentee_id, month_year)
);

ALTER TABLE public.mentee_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentee read own metrics or admin"
  ON public.mentee_metrics FOR SELECT TO authenticated
  USING (mentee_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentee insert own metrics or admin"
  ON public.mentee_metrics FOR INSERT TO authenticated
  WITH CHECK (mentee_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentee update own metrics or admin"
  ON public.mentee_metrics FOR UPDATE TO authenticated
  USING (mentee_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mentee delete own metrics or admin"
  ON public.mentee_metrics FOR DELETE TO authenticated
  USING (mentee_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_mentee_metrics_touch
  BEFORE UPDATE ON public.mentee_metrics
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Avatars storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)));
