-- FK catalogue : ON DELETE SET NULL pour permettre les suppressions UI
-- tout en conservant l'historique (séances, examens, bordereaux, dépenses).

-- Inspecteur sur élève (complète le fix #14)
ALTER TABLE public.eleves
  DROP CONSTRAINT IF EXISTS eleves_inspecteur_id_fkey;

ALTER TABLE public.eleves
  ADD CONSTRAINT eleves_inspecteur_id_fkey
  FOREIGN KEY (inspecteur_id) REFERENCES public.inspecteurs(id)
  ON DELETE SET NULL;

-- Moniteur
ALTER TABLE public.eleves
  DROP CONSTRAINT IF EXISTS eleves_moniteur_id_fkey;

ALTER TABLE public.eleves
  ADD CONSTRAINT eleves_moniteur_id_fkey
  FOREIGN KEY (moniteur_id) REFERENCES public.moniteurs(id)
  ON DELETE SET NULL;

ALTER TABLE public.seances
  DROP CONSTRAINT IF EXISTS seances_moniteur_id_fkey;

ALTER TABLE public.seances
  ADD CONSTRAINT seances_moniteur_id_fkey
  FOREIGN KEY (moniteur_id) REFERENCES public.moniteurs(id)
  ON DELETE SET NULL;

-- Véhicule
ALTER TABLE public.seances
  DROP CONSTRAINT IF EXISTS seances_vehicule_id_fkey;

ALTER TABLE public.seances
  ADD CONSTRAINT seances_vehicule_id_fkey
  FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id)
  ON DELETE SET NULL;

ALTER TABLE public.depenses
  DROP CONSTRAINT IF EXISTS depenses_vehicule_id_fkey;

ALTER TABLE public.depenses
  ADD CONSTRAINT depenses_vehicule_id_fkey
  FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id)
  ON DELETE SET NULL;

ALTER TABLE public.examen_sessions
  DROP CONSTRAINT IF EXISTS examen_sessions_vehicule_id_fkey;

ALTER TABLE public.examen_sessions
  ADD CONSTRAINT examen_sessions_vehicule_id_fkey
  FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id)
  ON DELETE SET NULL;

-- Formation sur examens (inscriptions déjà SET NULL)
ALTER TABLE public.examens
  DROP CONSTRAINT IF EXISTS examens_formation_id_fkey;

ALTER TABLE public.examens
  ADD CONSTRAINT examens_formation_id_fkey
  FOREIGN KEY (formation_id) REFERENCES public.formations(id)
  ON DELETE SET NULL;

-- Permis
ALTER TABLE public.eleves
  DROP CONSTRAINT IF EXISTS eleves_permis_id_fkey;

ALTER TABLE public.eleves
  ADD CONSTRAINT eleves_permis_id_fkey
  FOREIGN KEY (permis_id) REFERENCES public.permis(id)
  ON DELETE SET NULL;

-- Staff / utilisateurs
ALTER TABLE public.examen_sessions
  DROP CONSTRAINT IF EXISTS examen_sessions_created_by_fkey;

ALTER TABLE public.examen_sessions
  ADD CONSTRAINT examen_sessions_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

ALTER TABLE public.depenses
  DROP CONSTRAINT IF EXISTS depenses_utilisateur_id_fkey;

ALTER TABLE public.depenses
  ADD CONSTRAINT depenses_utilisateur_id_fkey
  FOREIGN KEY (utilisateur_id) REFERENCES auth.users(id)
  ON DELETE SET NULL;
