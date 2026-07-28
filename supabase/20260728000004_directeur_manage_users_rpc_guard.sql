-- Durcir create/update/delete_staff_user :
-- - rôles assignables hors super_administrateur
-- - refuser modification / suppression d'un compte super_administrateur
-- (is_admin() couvre déjà super_administrateur + directeur + responsable_adjoint)

CREATE OR REPLACE FUNCTION public.create_staff_user(
  p_email text,
  p_password text,
  p_name text,
  p_role text
)
RETURNS TABLE(id uuid, email text, name text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
#variable_conflict use_column
DECLARE
  v_email text := lower(trim(p_email));
  v_name text := trim(p_name);
  v_role text := trim(p_role);
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF v_email = '' OR p_password IS NULL OR p_password = '' OR v_name = '' OR v_role = '' THEN
    RAISE EXCEPTION 'Champs requis: email, password, name, role';
  END IF;

  IF v_role NOT IN (
    'directeur',
    'responsable_adjoint',
    'comptable',
    'moniteur',
    'secretaire'
  ) THEN
    RAISE EXCEPTION 'Rôle invalide : %', v_role;
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users u WHERE u.email = v_email) THEN
    RAISE EXCEPTION 'Un utilisateur avec cet email existe déjà';
  END IF;

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', v_name),
    false,
    false,
    now(),
    now()
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  UPDATE public.profiles p
  SET
    name = v_name,
    role = v_role,
    actif = true
  WHERE p.id = v_user_id;

  RETURN QUERY
  SELECT v_user_id, v_email, v_name, v_role;
END;
$$;

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
  v_target_role text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_id IS NULL OR v_name = '' OR v_role = '' THEN
    RAISE EXCEPTION 'Champs requis: id, name, role, actif';
  END IF;

  IF v_role NOT IN (
    'directeur',
    'responsable_adjoint',
    'comptable',
    'moniteur',
    'secretaire'
  ) THEN
    RAISE EXCEPTION 'Rôle invalide : %', v_role;
  END IF;

  SELECT p.role INTO v_target_role
  FROM public.profiles p
  WHERE p.id = p_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  IF v_target_role = 'super_administrateur' THEN
    RAISE EXCEPTION 'Le compte super administrateur ne peut pas être modifié via cette interface';
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
DECLARE
  v_target_role text;
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

  SELECT p.role INTO v_target_role
  FROM public.profiles p
  WHERE p.id = p_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  IF v_target_role = 'super_administrateur' THEN
    RAISE EXCEPTION 'Le compte super administrateur ne peut pas être supprimé via cette interface';
  END IF;

  DELETE FROM auth.identities i WHERE i.user_id = p_id;
  DELETE FROM auth.users u WHERE u.id = p_id;
  DELETE FROM public.profiles p WHERE p.id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_staff_user(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_staff_user(text, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_staff_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_staff_user(uuid) TO authenticated;
