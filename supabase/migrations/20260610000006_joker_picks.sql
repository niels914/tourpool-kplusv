-- Joker-etappe: elke deelnemer kiest 2 etappes waarop punten ×1.5 worden
-- Keuze vóór de deadline, geheim tijdens de Tour, opgeteld aan het einde

CREATE TABLE IF NOT EXISTS public.joker_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stage_number)
);

ALTER TABLE public.joker_picks ENABLE ROW LEVEL SECURITY;

-- Gebruikers zien alleen hun eigen joker-keuzes
CREATE POLICY "joker_picks_select_own" ON public.joker_picks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins zien alles
CREATE POLICY "joker_picks_select_admin" ON public.joker_picks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Gebruikers kunnen hun eigen jokers invoeren
CREATE POLICY "joker_picks_insert" ON public.joker_picks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Gebruikers kunnen hun eigen jokers updaten
CREATE POLICY "joker_picks_delete" ON public.joker_picks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
