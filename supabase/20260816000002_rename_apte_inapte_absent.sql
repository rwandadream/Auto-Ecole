-- =====================================================
-- MIGRATION 022 — Renommage produit Admis/Échec/Ajourné → Apte/Inapte/Absent
-- Décisions produit validées :
--   - resultat = 'ajourne' (legacy, non atteignable depuis l'UI) → 'en_attente'
--   - eleves.statut : admis → apte, ajourne → inapte (cohérence totale
--     avec le résultat d'examen, qui pilote déjà ce champ)
-- Les données existantes sont migrées AVANT de resserrer les contraintes
-- CHECK, pour éviter toute violation de contrainte.
-- =====================================================

-- 1. eleves.statut
UPDATE public.eleves SET statut = 'apte'   WHERE statut = 'admis';
UPDATE public.eleves SET statut = 'inapte' WHERE statut = 'ajourne';

ALTER TABLE public.eleves DROP CONSTRAINT IF EXISTS eleves_statut_check;
ALTER TABLE public.eleves ADD CONSTRAINT eleves_statut_check
  CHECK (statut IN ('prospect','inscrit','en_formation','examen','apte','inapte','termine','abandon'));

-- 2. examens.resultat
UPDATE public.examens SET resultat = 'en_attente' WHERE resultat = 'ajourne';
UPDATE public.examens SET resultat = 'apte'       WHERE resultat = 'admis';
UPDATE public.examens SET resultat = 'inapte'     WHERE resultat = 'echec';

ALTER TABLE public.examens DROP CONSTRAINT IF EXISTS examens_resultat_check;
ALTER TABLE public.examens ADD CONSTRAINT examens_resultat_check
  CHECK (resultat IN ('en_attente','apte','inapte','absent'));

-- 3. examen_session_eleves.resultat
UPDATE public.examen_session_eleves SET resultat = 'en_attente' WHERE resultat = 'ajourne';
UPDATE public.examen_session_eleves SET resultat = 'apte'       WHERE resultat = 'admis';
UPDATE public.examen_session_eleves SET resultat = 'inapte'     WHERE resultat = 'echec';

ALTER TABLE public.examen_session_eleves DROP CONSTRAINT IF EXISTS examen_session_eleves_resultat_check;
ALTER TABLE public.examen_session_eleves ADD CONSTRAINT examen_session_eleves_resultat_check
  CHECK (resultat IN ('en_attente','apte','inapte','absent'));
