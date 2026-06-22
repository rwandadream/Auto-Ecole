-- Suppression élève transactionnelle (factures, paiements, bordereaux, puis cascade existante)

CREATE OR REPLACE FUNCTION public.delete_eleve(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Identifiant requis';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.eleves e WHERE e.id = p_id) THEN
    RAISE EXCEPTION 'Élève introuvable';
  END IF;

  DELETE FROM public.paiements p
  WHERE p.eleve_id = p_id
     OR p.facture_id IN (SELECT f.id FROM public.factures f WHERE f.eleve_id = p_id);

  DELETE FROM public.factures f WHERE f.eleve_id = p_id;

  DELETE FROM public.examen_session_eleves ese WHERE ese.eleve_id = p_id;

  DELETE FROM public.eleves e WHERE e.id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_eleve(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_eleve(uuid) TO authenticated;
