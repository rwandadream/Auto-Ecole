-- Suppression client à double validation :
-- Directeur / Responsable adjoint peuvent DEMANDER la suppression d'un élève,
-- seul le Super Admin peut CONFIRMER la suppression réelle en base.

ALTER TABLE public.eleves
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 1) Demander la suppression (Super Admin, Directeur, Responsable adjoint)
CREATE OR REPLACE FUNCTION public.request_delete_eleve(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.eleves WHERE id = p_id) THEN
    RAISE EXCEPTION 'Élève introuvable';
  END IF;

  UPDATE public.eleves
  SET deletion_requested_at = now(), deletion_requested_by = auth.uid()
  WHERE id = p_id;
END;
$$;

-- 2) Annuler / rejeter une demande (le demandeur peut annuler, le Super Admin peut rejeter)
CREATE OR REPLACE FUNCTION public.cancel_delete_eleve_request(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  UPDATE public.eleves
  SET deletion_requested_at = NULL, deletion_requested_by = NULL
  WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_delete_eleve(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_delete_eleve_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_delete_eleve(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_delete_eleve_request(uuid) TO authenticated;

-- 3) La suppression réelle en base devient réservée au Super Admin exclusivement
CREATE OR REPLACE FUNCTION public.delete_eleve(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
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

-- 4) Défense en profondeur : la policy RLS de suppression directe passe aussi au Super Admin uniquement
DROP POLICY IF EXISTS "Admins can delete eleves" ON public.eleves;
CREATE POLICY "Super admin can delete eleves" ON public.eleves
  FOR DELETE TO authenticated USING (public.is_super_admin());
