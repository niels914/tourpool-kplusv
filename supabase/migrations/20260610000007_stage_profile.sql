-- Profieltype per etappe: vlak, heuvel, berg, tijdrit
ALTER TABLE public.stages
  ADD COLUMN IF NOT EXISTS profile text NOT NULL DEFAULT 'vlak';

-- Profielen toekennen op basis van etappe 2026 schema
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 1;   -- Lille → Lille
UPDATE public.stages SET profile = 'heuvel'  WHERE stage_number = 2;   -- Lauwin-Planque → Boulogne-sur-Mer
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 3;   -- Valenciennes → Dunkerque
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 4;   -- Amiens → Rouen
UPDATE public.stages SET profile = 'tijdrit' WHERE stage_number = 5;   -- Caen ITT
UPDATE public.stages SET profile = 'heuvel'  WHERE stage_number = 6;   -- Bayeux → Vire
UPDATE public.stages SET profile = 'heuvel'  WHERE stage_number = 7;   -- Saint-Malo → Mur-de-Bretagne
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 8;   -- Vannes → Saint-Nazaire
UPDATE public.stages SET profile = 'tijdrit' WHERE stage_number = 9;   -- La Baule TTT
UPDATE public.stages SET profile = 'heuvel'  WHERE stage_number = 10;  -- Chateauneuf-sur-Loire → Estivareilles
UPDATE public.stages SET profile = 'berg'    WHERE stage_number = 11;  -- Le Creusot → La Plagne
UPDATE public.stages SET profile = 'berg'    WHERE stage_number = 12;  -- Annemasse → Colombier-Sautel
UPDATE public.stages SET profile = 'berg'    WHERE stage_number = 13;  -- Saint-Gervais → Courchevel
UPDATE public.stages SET profile = 'berg'    WHERE stage_number = 14;  -- Albertville → Morzine
UPDATE public.stages SET profile = 'heuvel'  WHERE stage_number = 15;  -- Thonon-les-Bains → Porrentruy
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 16;  -- Montbéliard → Mulhouse
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 17;  -- Épernay → Reims
UPDATE public.stages SET profile = 'berg'    WHERE stage_number = 18;  -- Pau → Hautacam
UPDATE public.stages SET profile = 'berg'    WHERE stage_number = 19;  -- Lannemezan → Peyragudes
UPDATE public.stages SET profile = 'vlak'    WHERE stage_number = 20;  -- Auch → Mont-de-Marsan
UPDATE public.stages SET profile = 'heuvel'  WHERE stage_number = 21;  -- Menton → Nice
