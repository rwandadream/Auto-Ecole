-- Accès portail élève : ajoute la colonne et bloque les comptes désactivés

ALTER TABLE public.eleves
  ADD COLUMN IF NOT EXISTS acces_portail BOOLEAN NOT NULL DEFAULT TRUE;

-- Mise à jour du RPC : un compte désactivé est invisible (aucun résultat = échec de login)
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
    AND (e.acces_portail IS NULL OR e.acces_portail = TRUE)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.login_eleve_portail(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_eleve_portail(TEXT, TEXT) TO anon, authenticated;
