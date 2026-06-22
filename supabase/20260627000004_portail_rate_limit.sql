-- =====================================================
-- MIGRATION 020 — Rate limiting portail élève
-- Skill Supabase : durcir RPC anon login_eleve_portail
-- =====================================================

CREATE TABLE IF NOT EXISTS public.portail_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_key text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portail_login_attempts_code_time
  ON public.portail_login_attempts (code_key, attempted_at DESC);

ALTER TABLE public.portail_login_attempts ENABLE ROW LEVEL SECURITY;

-- Table interne : aucune policy = inaccessible via API (écriture via DEFINER uniquement)

CREATE OR REPLACE FUNCTION public.login_eleve_portail(p_code text, p_telephone text)
RETURNS TABLE (
  id uuid,
  code text,
  nom text,
  prenom text,
  telephone text,
  email text,
  type_permis text,
  statut text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_key text := lower(trim(COALESCE(p_code, '')));
  v_fail_count int;
  v_eleve record;
BEGIN
  IF v_code_key = '' OR trim(COALESCE(p_telephone, '')) = '' THEN
    RAISE EXCEPTION 'Identifiants invalides';
  END IF;

  SELECT COUNT(*)::int INTO v_fail_count
  FROM public.portail_login_attempts a
  WHERE a.code_key = v_code_key
    AND a.success = false
    AND a.attempted_at > now() - interval '15 minutes';

  IF v_fail_count >= 5 THEN
    RAISE EXCEPTION 'Trop de tentatives. Réessayez dans 15 minutes.';
  END IF;

  SELECT
    e.id,
    COALESCE(e.code, e.dossier_code) AS code,
    e.nom,
    e.prenom,
    e.telephone,
    COALESCE(e.email, '') AS email,
    COALESCE(e.type_permis, '') AS type_permis,
    e.statut
  INTO v_eleve
  FROM public.eleves e
  WHERE lower(trim(COALESCE(e.code, e.dossier_code, ''))) = v_code_key
    AND regexp_replace(e.telephone, '\s', '', 'g')
      = regexp_replace(p_telephone, '\s', '', 'g')
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.portail_login_attempts (code_key, success)
    VALUES (v_code_key, false);
    RAISE EXCEPTION 'Identifiants invalides';
  END IF;

  INSERT INTO public.portail_login_attempts (code_key, success)
  VALUES (v_code_key, true);

  RETURN QUERY
  SELECT
    v_eleve.id,
    v_eleve.code,
    v_eleve.nom,
    v_eleve.prenom,
    v_eleve.telephone,
    v_eleve.email,
    v_eleve.type_permis,
    v_eleve.statut;
END;
$$;

REVOKE ALL ON FUNCTION public.login_eleve_portail(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_eleve_portail(text, text) TO anon, authenticated;

-- Purge automatique (> 7 jours)
CREATE OR REPLACE FUNCTION public.purge_portail_login_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.portail_login_attempts WHERE attempted_at < now() - interval '7 days';
$$;

REVOKE ALL ON FUNCTION public.purge_portail_login_attempts() FROM PUBLIC, anon, authenticated;
