-- =====================================================
-- MIGRATION 024 — RPC de mise à jour du profil élève depuis le portail
-- Bug : "Modifier mes informations" (student-profil-view.tsx) appelait
-- updateEleve() → UPDATE direct sur eleves, protégé par une policy RLS
-- "TO authenticated" + is_admin(). Les élèves du portail ne sont jamais
-- authenticated (authentification par RPC code+téléphone, pas Supabase
-- Auth) : l'écriture échouait donc systématiquement, en silence.
-- On introduit un RPC SECURITY DEFINER dédié, sur le même modèle que
-- get_eleve_portail_data / login_eleve_portail : revalidation code+
-- téléphone côté serveur, et périmètre de colonnes modifiables strictement
-- limité aux champs de contact édités par le formulaire portail
-- (téléphone, email, nationalité, photo de profil) — jamais statut,
-- solde, résultat d'examen, code dossier.
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_eleve_portail(
  p_code text,
  p_telephone text,
  p_telephone_new text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_nationalite text DEFAULT NULL,
  p_photo_profil text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_eleve_id uuid;
BEGIN
  SELECT e.id INTO v_eleve_id FROM public.eleves e
  WHERE lower(trim(COALESCE(e.code, e.dossier_code, ''))) = lower(trim(p_code))
    AND regexp_replace(e.telephone, '\s', '', 'g') = regexp_replace(p_telephone, '\s', '', 'g')
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Identifiants invalides';
  END IF;

  UPDATE public.eleves SET
    telephone = COALESCE(NULLIF(trim(p_telephone_new), ''), telephone),
    email = COALESCE(p_email, email),
    nationalite = COALESCE(p_nationalite, nationalite),
    photo_profil = COALESCE(p_photo_profil, photo_profil)
  WHERE id = v_eleve_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_eleve_portail(text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_eleve_portail(text, text, text, text, text, text) TO anon, authenticated;
