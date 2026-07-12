-- Align is_comptable_or_admin + create_staff_user with renamed roles
-- (super_administrateur / directeur / responsable_adjoint / …)

CREATE OR REPLACE FUNCTION public.is_comptable_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN (
        'super_administrateur',
        'directeur',
        'responsable_adjoint',
        'comptable'
      )
      AND actif = true
  );
$$;

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
    'super_administrateur',
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

REVOKE ALL ON FUNCTION public.is_comptable_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_comptable_or_admin() TO authenticated;
