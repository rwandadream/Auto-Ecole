-- SARAH AUTO — Comptes staff mock → Supabase Auth
-- Mot de passe commun : Sarah2026!

CREATE OR REPLACE FUNCTION public._seed_auth_user(
  p_id uuid,
  p_email text,
  p_name text,
  p_role text,
  p_actif boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
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
      p_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      p_email,
      crypt('Sarah2026!', gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name),
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
      p_id,
      p_id::text,
      jsonb_build_object(
        'sub', p_id::text,
        'email', p_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  UPDATE public.profiles
  SET name = p_name, role = p_role, actif = p_actif
  WHERE email = p_email;
END;
$$;

SELECT public._seed_auth_user(
  '00000000-0000-4000-8000-000000000002',
  'a.diallo@sarahauto.ci',
  'Aïcha Diallo',
  'administrateur_principal',
  true
);
SELECT public._seed_auth_user(
  '00000000-0000-4000-8000-000000000003',
  'l.kouame@sarahauto.ci',
  'Kouamé Lucien',
  'administrateur_secondaire',
  false
);
SELECT public._seed_auth_user(
  '00000000-0000-4000-8000-000000000004',
  'jm.koffi@sarahauto.ci',
  'Koffi Jean-Marc',
  'moniteur',
  true
);
SELECT public._seed_auth_user(
  '00000000-0000-4000-8000-000000000005',
  'f.brou@sarahauto.ci',
  'Brou Franck',
  'moniteur',
  true
);
SELECT public._seed_auth_user(
  '00000000-0000-4000-8000-000000000006',
  'e.tanoh@sarahauto.ci',
  'Tanoh Estelle',
  'comptable',
  true
);
SELECT public._seed_auth_user(
  '00000000-0000-4000-8000-000000000007',
  's.aya@sarahauto.ci',
  'Aya Sandrine',
  'conseiller',
  true
);

DROP FUNCTION public._seed_auth_user(uuid, text, text, text, boolean);

SELECT email, name, role, actif FROM public.profiles ORDER BY email;
