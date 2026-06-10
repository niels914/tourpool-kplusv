-- TTT scoring: ploegentijdrit puntenregeling
-- Top 5 ploegen krijgen punten per renner: 5 / 3 / 2 / 1 / 0.5

-- Tabel voor TTT-ploegresultaten
CREATE TABLE IF NOT EXISTS public.ttt_team_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  position integer NOT NULL CHECK (position BETWEEN 1 AND 22),
  UNIQUE(stage_id, position),
  UNIQUE(stage_id, team_name)
);

ALTER TABLE public.ttt_team_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ttt_results_select" ON public.ttt_team_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ttt_results_admin" ON public.ttt_team_results
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Puntenfunctie voor TTT
CREATE OR REPLACE FUNCTION ttt_team_points(pos integer)
RETURNS numeric AS $$
  SELECT CASE pos
    WHEN 1 THEN 5
    WHEN 2 THEN 3
    WHEN 3 THEN 2
    WHEN 4 THEN 1
    WHEN 5 THEN 0.5
    ELSE 0
  END;
$$ LANGUAGE sql IMMUTABLE;

-- Vervang de stage_raw_points view: nu inclusief TTT
CREATE OR REPLACE VIEW public.stage_raw_points AS
  -- Reguliere etappes (niet-TTT)
  SELECT sr.stage_id, sr.rider_id,
    sum(CASE sr.result_type
      WHEN 'stage_finish' THEN stage_finish_points(sr.position)
      ELSE jersey_points(sr.result_type, sr.position)
    END) AS raw_points
  FROM public.stage_results sr
  JOIN public.stages s ON s.id = sr.stage_id
  WHERE s.stage_type != 'ttt' AND s.status = 'locked'
  GROUP BY sr.stage_id, sr.rider_id

  UNION ALL

  -- TTT-etappes: punten per renner op basis van ploegresultaat
  SELECT ttr.stage_id, r.id AS rider_id,
    ttt_team_points(ttr.position) AS raw_points
  FROM public.ttt_team_results ttr
  JOIN public.stages s ON s.id = ttr.stage_id
  JOIN public.riders r ON r.team_name = ttr.team_name
  WHERE s.stage_type = 'ttt' AND s.status = 'locked'
    AND r.is_dns = false AND r.is_dnf = false;
