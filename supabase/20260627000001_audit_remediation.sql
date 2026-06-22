-- =====================================================
-- MIGRATION 017 — Correctifs audit SARAH AUTO
-- Réf. supabase/AUDIT-SARAH-AUTO.md
-- =====================================================

-- =====================================================
-- 1. Vue eleves_solde — security_invoker (C1)
-- =====================================================
DROP VIEW IF EXISTS public.eleves_solde;

CREATE VIEW public.eleves_solde
WITH (security_invoker = true)
AS
SELECT
  e.id AS eleve_id,
  COALESCE(SUM(f.montant), 0) AS total_facture,
  COALESCE(SUM(p.montant), 0) AS total_paye,
  GREATEST(COALESCE(SUM(f.montant), 0) - COALESCE(SUM(p.montant), 0), 0) AS solde
FROM public.eleves e
LEFT JOIN public.factures f ON f.eleve_id = e.id
LEFT JOIN public.paiements p ON p.facture_id = f.id
GROUP BY e.id;

-- =====================================================
-- 2. Helpers — search_path + perf auth.uid() (M4, perf)
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('administrateur_principal', 'administrateur_secondaire')
  );
$$;

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
      AND role IN ('administrateur_principal', 'administrateur_secondaire', 'comptable')
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

-- =====================================================
-- 3. Auth.users — tokens NULL → '' (H4, logs /token)
-- =====================================================
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change IS NULL;

-- =====================================================
-- 4. RPC — REVOKE anon sur fonctions admin (C2, M6)
--    Conserver anon : login_eleve_portail, get_eleve_portail_data
-- =====================================================
REVOKE EXECUTE ON FUNCTION public.create_staff_user(text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_eleve(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_staff_user(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enregistrer_paiement(uuid, numeric, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.inscrire_eleve(uuid, uuid, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_comptable_or_admin() FROM anon;

REVOKE ALL ON FUNCTION public.update_facture_statut_after_paiement() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_eleve_seances_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- =====================================================
-- 5. RLS audit_log — INSERT own only (H2)
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_log;

CREATE POLICY "Authenticated users can insert own audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 6. RLS — remplacer auth.role() par TO authenticated (M1, perf)
-- =====================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- permis & formations
DROP POLICY IF EXISTS "Authenticated users can view permis" ON public.permis;
CREATE POLICY "Authenticated users can view permis"
  ON public.permis FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view formations" ON public.formations;
CREATE POLICY "Authenticated users can view formations"
  ON public.formations FOR SELECT
  TO authenticated
  USING (true);

-- staff read policies
DROP POLICY IF EXISTS "Staff can view eleves" ON public.eleves;
CREATE POLICY "Staff can view eleves"
  ON public.eleves FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view moniteurs" ON public.moniteurs;
CREATE POLICY "Staff can view moniteurs"
  ON public.moniteurs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view inspecteurs" ON public.inspecteurs;
CREATE POLICY "Staff can view inspecteurs"
  ON public.inspecteurs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view vehicules" ON public.vehicules;
CREATE POLICY "Staff can view vehicules"
  ON public.vehicules FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view inscriptions" ON public.inscriptions;
CREATE POLICY "Staff can view inscriptions"
  ON public.inscriptions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view examens" ON public.examens;
CREATE POLICY "Staff can view examens"
  ON public.examens FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view seances" ON public.seances;
CREATE POLICY "Staff can view seances"
  ON public.seances FOR SELECT
  TO authenticated
  USING (true);

-- factures / paiements (lecture staff conservée pour solde élève)
DROP POLICY IF EXISTS "Staff can view factures" ON public.factures;
CREATE POLICY "Staff can view factures"
  ON public.factures FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view paiements" ON public.paiements;
CREATE POLICY "Staff can view paiements"
  ON public.paiements FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins and comptables can manage factures" ON public.factures;
CREATE POLICY "Admins and comptables can manage factures"
  ON public.factures FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'comptable'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'comptable'
    )
  );

DROP POLICY IF EXISTS "Admins and comptables can manage paiements" ON public.paiements;
CREATE POLICY "Admins and comptables can manage paiements"
  ON public.paiements FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'comptable'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'comptable'
    )
  );

DROP POLICY IF EXISTS "Admins and comptables can manage depenses" ON public.depenses;
CREATE POLICY "Admins and comptables can manage depenses"
  ON public.depenses FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'comptable'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'comptable'
    )
  );

-- bordereaux
DROP POLICY IF EXISTS "Staff can view examen_sessions" ON public.examen_sessions;
CREATE POLICY "Staff can view examen_sessions"
  ON public.examen_sessions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can view examen_session_eleves" ON public.examen_session_eleves;
CREATE POLICY "Staff can view examen_session_eleves"
  ON public.examen_session_eleves FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 7. Storage — perf auth.uid() (M3)
-- =====================================================
DROP POLICY IF EXISTS "Staff can read media" ON storage.objects;
CREATE POLICY "Staff can read media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('justificatifs', 'avatars', 'cni')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND actif = true
    )
  );

DROP POLICY IF EXISTS "Staff can upload media" ON storage.objects;
CREATE POLICY "Staff can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('justificatifs', 'avatars', 'cni')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND actif = true
    )
  );

DROP POLICY IF EXISTS "Staff can update media" ON storage.objects;
CREATE POLICY "Staff can update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('justificatifs', 'avatars', 'cni')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND actif = true
    )
  )
  WITH CHECK (
    bucket_id IN ('justificatifs', 'avatars', 'cni')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND actif = true
    )
  );

-- =====================================================
-- 8. Index FK manquants (perf, priorité 3)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_depenses_utilisateur_id
  ON public.depenses(utilisateur_id);

CREATE INDEX IF NOT EXISTS idx_eleves_inspecteur_id
  ON public.eleves(inspecteur_id);

CREATE INDEX IF NOT EXISTS idx_eleves_permis_id
  ON public.eleves(permis_id);

CREATE INDEX IF NOT EXISTS idx_examen_sessions_created_by
  ON public.examen_sessions(created_by);

CREATE INDEX IF NOT EXISTS idx_examen_sessions_inspecteur_id
  ON public.examen_sessions(inspecteur_id);

CREATE INDEX IF NOT EXISTS idx_examen_sessions_vehicule_id
  ON public.examen_sessions(vehicule_id);

CREATE INDEX IF NOT EXISTS idx_examens_formation_id
  ON public.examens(formation_id);

CREATE INDEX IF NOT EXISTS idx_factures_inscription_id
  ON public.factures(inscription_id);

CREATE INDEX IF NOT EXISTS idx_seances_vehicule_id
  ON public.seances(vehicule_id);
