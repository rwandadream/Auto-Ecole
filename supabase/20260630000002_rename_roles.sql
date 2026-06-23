-- =====================================================
-- SARAH AUTO — Renommage des rôles équipe
-- Nouvelle hiérarchie :
--   super_administrateur  → Super Administrateur
--   directeur             → Directeur
--   responsable_adjoint   → Responsable adjoint
--   comptable             → Comptable   (inchangé)
--   moniteur              → Moniteur    (inchangé)
--   secretaire            → Secrétaire
-- =====================================================

-- 1. Assouplir la contrainte CHECK pour permettre la transition
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Migrer les données existantes vers les nouveaux noms
UPDATE public.profiles SET role = 'directeur'           WHERE role = 'administrateur_principal';
UPDATE public.profiles SET role = 'responsable_adjoint' WHERE role = 'administrateur_secondaire';
UPDATE public.profiles SET role = 'secretaire'          WHERE role = 'conseiller';

-- 3. Appliquer la nouvelle contrainte CHECK
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (
    role IN (
      'super_administrateur',
      'directeur',
      'responsable_adjoint',
      'comptable',
      'moniteur',
      'secretaire'
    )
  );

-- 4. Mettre à jour is_admin() avec les nouveaux noms
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_administrateur', 'directeur', 'responsable_adjoint')
    AND actif = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Mettre à jour is_super_admin() (inchangé mais réaffirmé)
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

-- 6. Mettre à jour update_staff_user avec les nouveaux rôles valides
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
    'directeur',
    'responsable_adjoint',
    'comptable',
    'moniteur',
    'secretaire'
  ) THEN
    RAISE EXCEPTION 'Rôle invalide : %', v_role;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = p_id) THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  UPDATE public.profiles p
  SET
    name  = v_name,
    role  = v_role,
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

-- 7. Vérification
SELECT role, count(*) FROM public.profiles GROUP BY role ORDER BY role;
