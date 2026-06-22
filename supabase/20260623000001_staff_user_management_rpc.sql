-- Gestion staff : mise à jour et suppression (Auth + profiles)

CREATE OR REPLACE FUNCTION public.update_staff_user(
  p_id uuid,
  p_name text,
  p_role text,
  p_actif boolean,
  p_password text DEFAULT NULL
)
RETURNS TABLE(id uuid, email text, name text, role text, actif boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
#variable_conflict use_column
DECLARE
  v_name text := trim(p_name);
  v_role text := trim(p_role);
  v_password text := nullif(trim(p_password), '');
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_id IS NULL OR v_name = '' OR v_role = '' THEN
    RAISE EXCEPTION 'Champs requis: id, name, role, actif';
  END IF;

  IF v_role NOT IN (
    'administrateur_principal',
    'administrateur_secondaire',
    'comptable',
    'moniteur',
    'conseiller'
  ) THEN
    RAISE EXCEPTION 'Rôle invalide';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = p_id) THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  UPDATE public.profiles p
  SET
    name = v_name,
    role = v_role,
    actif = COALESCE(p_actif, true)
  WHERE p.id = p_id;

  IF v_password IS NOT NULL THEN
    UPDATE auth.users u
    SET
      encrypted_password = crypt(v_password, gen_salt('bf')),
      updated_at = now()
    WHERE u.id = p_id;
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.name, p.role, p.actif
  FROM public.profiles p
  WHERE p.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_staff_user(p_id uuid)
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

  IF p_id = auth.uid() THEN
    RAISE EXCEPTION 'Vous ne pouvez pas supprimer votre propre compte';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = p_id) THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  DELETE FROM auth.identities i WHERE i.user_id = p_id;
  DELETE FROM auth.users u WHERE u.id = p_id;
  DELETE FROM public.profiles p WHERE p.id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_staff_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_staff_user(uuid) TO authenticated;
