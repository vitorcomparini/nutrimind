
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS invite_accepted_at TIMESTAMPTZ;

CREATE TABLE public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  icon TEXT NOT NULL DEFAULT '📋',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read indicators" ON public.indicators
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage indicators" ON public.indicators
  FOR ALL TO authenticated 
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER touch_indicators_updated_at BEFORE UPDATE ON public.indicators
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL,
  mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  evaluated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(month_year, mentee_id, indicator_id)
);
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own evaluations or admin" ON public.evaluations
  FOR SELECT TO authenticated 
  USING (mentee_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins manage evaluations" ON public.evaluations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER touch_evaluations_updated_at BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.indicators (name, description, points, is_active, icon, sort_order) VALUES
  ('Encontro Semanal', 'Participou de pelo menos 1 encontro síncrono na semana', 30, true, '📅', 1),
  ('Contato com Mentor', 'Teve contato (síncrono ou assíncrono) com mentor designado', 30, true, '👨‍🏫', 2),
  ('Atividade na Comunidade', 'Interagiu (postou ou comentou) na comunidade/grupo', 10, true, '💬', 3),
  ('Entrega de Tarefas', 'Entregou desafio ou diagnóstico solicitado', 10, true, '📝', 4),
  ('Consumo de Conteúdo', 'Consumiu vídeo/artigo/módulo da plataforma', 10, true, '📚', 5),
  ('Contato Individual', 'Fez contato individual com time de suporte', 10, true, '📞', 6);
