-- Permettre la suppression d'un inspecteur : les examens et sessions
-- conservés avec inspecteur_id = NULL (historique préservé).

ALTER TABLE public.examens
  DROP CONSTRAINT IF EXISTS examens_inspecteur_id_fkey;

ALTER TABLE public.examens
  ADD CONSTRAINT examens_inspecteur_id_fkey
  FOREIGN KEY (inspecteur_id) REFERENCES public.inspecteurs(id)
  ON DELETE SET NULL;

ALTER TABLE public.examen_sessions
  DROP CONSTRAINT IF EXISTS examen_sessions_inspecteur_id_fkey;

ALTER TABLE public.examen_sessions
  ADD CONSTRAINT examen_sessions_inspecteur_id_fkey
  FOREIGN KEY (inspecteur_id) REFERENCES public.inspecteurs(id)
  ON DELETE SET NULL;
