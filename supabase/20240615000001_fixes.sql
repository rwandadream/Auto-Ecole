-- Fix missing columns for UI parity

-- PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS actif boolean DEFAULT true;

-- SEANCES
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS duree_minutes integer DEFAULT 60;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS lieu text;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS type text DEFAULT 'Formation';
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS titre text;

-- PAIEMENTS
ALTER TABLE public.paiements ADD COLUMN IF NOT EXISTS eleve_id uuid REFERENCES public.eleves(id);

-- EXAMENS
ALTER TABLE public.examens ADD COLUMN IF NOT EXISTS formation_id uuid REFERENCES public.formations(id);
ALTER TABLE public.examens ADD COLUMN IF NOT EXISTS type_permis text;

-- ELEVES
ALTER TABLE public.eleves ADD COLUMN IF NOT EXISTS dossier_code text;
ALTER TABLE public.eleves ADD COLUMN IF NOT EXISTS type_permis text;
ALTER TABLE public.eleves ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.eleves ADD COLUMN IF NOT EXISTS inspecteur text; -- For backward compatibility if needed

-- FACTURES
-- Ensure statut is consistent
-- (The check constraint already exists but might need adjustment if we change from 'impayee' to 'non_payee')
ALTER TABLE public.factures DROP CONSTRAINT IF EXISTS factures_statut_check;
ALTER TABLE public.factures ADD CONSTRAINT factures_statut_check CHECK (statut IN ('non_payee', 'partielle', 'payee', 'impayee'));

-- PORTAIL ÉLÈVE (code dossier + téléphone)
CREATE OR REPLACE FUNCTION public.login_eleve_portail(p_code TEXT, p_telephone TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  email TEXT,
  type_permis TEXT,
  statut TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id,
    COALESCE(e.code, e.dossier_code) AS code,
    e.nom,
    e.prenom,
    e.telephone,
    COALESCE(e.email, '') AS email,
    COALESCE(e.type_permis, '') AS type_permis,
    e.statut
  FROM public.eleves e
  WHERE lower(trim(COALESCE(e.code, e.dossier_code, ''))) = lower(trim(p_code))
    AND regexp_replace(e.telephone, '\s', '', 'g')
      = regexp_replace(p_telephone, '\s', '', 'g')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.login_eleve_portail(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_eleve_portail(TEXT, TEXT) TO anon, authenticated;
