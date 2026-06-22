-- =====================================================
-- SARAH AUTO — Bootstrap premier compte administrateur
-- Exécutable en une fois via MCP Supabase (execute_sql)
-- =====================================================

DO $$
DECLARE
  admin_id uuid := '00000000-0000-4000-8000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@sarahauto.ci') THEN
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
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@sarahauto.ci',
      crypt('Sarah2026!', gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Administrateur Principal"}'::jsonb,
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
      admin_id,
      admin_id::text,
      jsonb_build_object(
        'sub', admin_id::text,
        'email', 'admin@sarahauto.ci',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- Forcer le rôle admin sur le profil créé par le trigger handle_new_user
UPDATE public.profiles
SET
  role  = 'administrateur_principal',
  name  = 'Administrateur Principal',
  actif = true
WHERE email = 'admin@sarahauto.ci';

-- Vérification
SELECT id, email, name, role, actif
FROM public.profiles
WHERE email = 'admin@sarahauto.ci';
