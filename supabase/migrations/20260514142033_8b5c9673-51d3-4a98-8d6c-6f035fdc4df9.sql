
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  event_date timestamptz NOT NULL,
  art_url text,
  whatsapp_message text NOT NULL DEFAULT 'Olá, gostaria de saber mais sobre o evento',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER events_touch_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO storage.buckets (id, name, public) VALUES ('event-art', 'event-art', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read event art" ON storage.objects FOR SELECT USING (bucket_id = 'event-art');
CREATE POLICY "Admins upload event art" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-art' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update event art" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'event-art' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete event art" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-art' AND has_role(auth.uid(), 'admin'::app_role));
