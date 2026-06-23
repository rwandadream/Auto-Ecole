-- =====================================================
-- SARAH AUTO — Super Administrateur
-- Ajout du rôle super_administrateur avec contrôle exclusif
-- des opérations destructives et de la gestion équipe.
-- =====================================================

-- 1. Mettre à jour la contrainte CHECK du rôle dans profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (
    role IN (
      'super_administrateur',
      'administrateur_principal',
      'administrateur_secondaire',
      'comptable',
      'moniteur',
      'conseiller'
    )
  );

-- 2. Mettre à jour update_staff_user pour accepter super_administrateur
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
    'super_administrateur',
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

-- 3. Mettre à jour is_admin() pour inclure super_administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_administrateur', 'administrateur_principal', 'administrateur_secondaire')
    AND actif = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Nouvelle fonction is_super_admin() pour opérations exclusives
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_administrateur'
    AND actif = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 5. Politique RLS sur profiles : super admin peut voir ET modifier tous les profils
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
