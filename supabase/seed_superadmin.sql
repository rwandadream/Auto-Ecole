-- =====================================================
-- SARAH AUTO — Initialisation du Super Administrateur
-- À exécuter UNE SEULE FOIS via Supabase MCP ou SQL Editor.
--
-- AVANT d'exécuter :
--   Remplacez l'email et le mot de passe ci-dessous
--   (ou passez-les comme paramètres dans votre outil SQL).
--
-- Email par défaut  : superadmin@sarahauto.ci
-- Mot de passe défaut : SuperAdmin2026!
--
-- Le super admin est le seul rôle qui peut :
--   • Créer / modifier / supprimer des membres de l'équipe
--   • Supprimer des élèves, moniteurs, véhicules, factures
--   • Gérer le catalogue (formations, permis)
-- =====================================================

DO $$
DECLARE
  v_email    text    := 'superadmin@sarahauto.ci';   -- ← Modifier ici
  v_password text    := 'SuperAdmin2026!';            -- ← Modifier ici
  v_name     text    := 'Super Administrateur';
  v_id       uuid    := gen_random_uuid();
BEGIN
  -- Ne rien faire si un super admin existe déjà
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'super_administrateur'
  ) THEN
    RAISE NOTICE 'Un super administrateur existe déjà. Aucune action.';
    RETURN;
  END IF;

  -- Ne rien faire si l'email est déjà pris
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = v_email
  ) THEN
    RAISE NOTICE 'Email déjà utilisé. Aucune action.';
    RETURN;
  END IF;

  -- Créer le compte Supabase Auth
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
    v_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', v_name),
    false, false,
    now(), now()
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
    v_id,
    v_id::text,
    jsonb_build_object(
      'sub', v_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(), now(), now()
  );

  -- Forcer le rôle super_administrateur sur le profil
  UPDATE public.profiles
  SET
    role  = 'super_administrateur',
    name  = v_name,
    actif = true
  WHERE email = v_email;

  RAISE NOTICE 'Super administrateur créé : %', v_email;
END $$;

-- Vérification
SELECT id, email, name, role, actif
FROM public.profiles
WHERE role = 'super_administrateur';
