-- =====================================================
-- MIGRATION 019 — Consolidation RLS + WITH CHECK admin
-- Skill Supabase : éviter policies SELECT dupliquées, WITH CHECK sur UPDATE
-- =====================================================

-- Macro pattern : 1 SELECT staff + INSERT/UPDATE/DELETE admin (is_admin)

-- PERMIS
DROP POLICY IF EXISTS "Authenticated users can view permis" ON public.permis;
DROP POLICY IF EXISTS "Admins can manage permis" ON public.permis;
CREATE POLICY "Staff can read permis" ON public.permis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert permis" ON public.permis FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update permis" ON public.permis FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete permis" ON public.permis FOR DELETE TO authenticated USING (public.is_admin());

-- FORMATIONS
DROP POLICY IF EXISTS "Authenticated users can view formations" ON public.formations;
DROP POLICY IF EXISTS "Admins can manage formations" ON public.formations;
CREATE POLICY "Staff can read formations" ON public.formations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert formations" ON public.formations FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update formations" ON public.formations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete formations" ON public.formations FOR DELETE TO authenticated USING (public.is_admin());

-- ELEVES
DROP POLICY IF EXISTS "Staff can view eleves" ON public.eleves;
DROP POLICY IF EXISTS "Admins can manage eleves" ON public.eleves;
CREATE POLICY "Staff can read eleves" ON public.eleves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert eleves" ON public.eleves FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update eleves" ON public.eleves FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete eleves" ON public.eleves FOR DELETE TO authenticated USING (public.is_admin());

-- MONITEURS
DROP POLICY IF EXISTS "Staff can view moniteurs" ON public.moniteurs;
DROP POLICY IF EXISTS "Admins can manage moniteurs" ON public.moniteurs;
CREATE POLICY "Staff can read moniteurs" ON public.moniteurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert moniteurs" ON public.moniteurs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update moniteurs" ON public.moniteurs FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete moniteurs" ON public.moniteurs FOR DELETE TO authenticated USING (public.is_admin());

-- INSPECTEURS
DROP POLICY IF EXISTS "Staff can view inspecteurs" ON public.inspecteurs;
DROP POLICY IF EXISTS "Admins can manage inspecteurs" ON public.inspecteurs;
CREATE POLICY "Staff can read inspecteurs" ON public.inspecteurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert inspecteurs" ON public.inspecteurs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update inspecteurs" ON public.inspecteurs FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete inspecteurs" ON public.inspecteurs FOR DELETE TO authenticated USING (public.is_admin());

-- VEHICULES
DROP POLICY IF EXISTS "Staff can view vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Admins can manage vehicules" ON public.vehicules;
CREATE POLICY "Staff can read vehicules" ON public.vehicules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert vehicules" ON public.vehicules FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update vehicules" ON public.vehicules FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete vehicules" ON public.vehicules FOR DELETE TO authenticated USING (public.is_admin());

-- INSCRIPTIONS
DROP POLICY IF EXISTS "Staff can view inscriptions" ON public.inscriptions;
DROP POLICY IF EXISTS "Admins can manage inscriptions" ON public.inscriptions;
CREATE POLICY "Staff can read inscriptions" ON public.inscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert inscriptions" ON public.inscriptions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update inscriptions" ON public.inscriptions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete inscriptions" ON public.inscriptions FOR DELETE TO authenticated USING (public.is_admin());

-- EXAMENS
DROP POLICY IF EXISTS "Staff can view examens" ON public.examens;
DROP POLICY IF EXISTS "Admins can manage examens" ON public.examens;
CREATE POLICY "Staff can read examens" ON public.examens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert examens" ON public.examens FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update examens" ON public.examens FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete examens" ON public.examens FOR DELETE TO authenticated USING (public.is_admin());

-- SEANCES
DROP POLICY IF EXISTS "Staff can view seances" ON public.seances;
DROP POLICY IF EXISTS "Admins can manage seances" ON public.seances;
CREATE POLICY "Staff can read seances" ON public.seances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert seances" ON public.seances FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update seances" ON public.seances FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete seances" ON public.seances FOR DELETE TO authenticated USING (public.is_admin());

-- EXAMEN SESSIONS
DROP POLICY IF EXISTS "Staff can view examen_sessions" ON public.examen_sessions;
DROP POLICY IF EXISTS "Admins can manage examen_sessions" ON public.examen_sessions;
CREATE POLICY "Staff can read examen_sessions" ON public.examen_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert examen_sessions" ON public.examen_sessions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update examen_sessions" ON public.examen_sessions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete examen_sessions" ON public.examen_sessions FOR DELETE TO authenticated USING (public.is_admin());

-- EXAMEN SESSION ELEVES
DROP POLICY IF EXISTS "Staff can view examen_session_eleves" ON public.examen_session_eleves;
DROP POLICY IF EXISTS "Admins can manage examen_session_eleves" ON public.examen_session_eleves;
CREATE POLICY "Staff can read examen_session_eleves" ON public.examen_session_eleves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert examen_session_eleves" ON public.examen_session_eleves FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update examen_session_eleves" ON public.examen_session_eleves FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete examen_session_eleves" ON public.examen_session_eleves FOR DELETE TO authenticated USING (public.is_admin());

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

-- FACTURES (lecture staff, écriture admin+comptable)
DROP POLICY IF EXISTS "Staff can view factures" ON public.factures;
DROP POLICY IF EXISTS "Admins and comptables can manage factures" ON public.factures;
CREATE POLICY "Staff can read factures" ON public.factures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and comptables can insert factures" ON public.factures FOR INSERT TO authenticated
  WITH CHECK (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can update factures" ON public.factures FOR UPDATE TO authenticated
  USING (public.is_comptable_or_admin()) WITH CHECK (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can delete factures" ON public.factures FOR DELETE TO authenticated
  USING (public.is_comptable_or_admin());

-- PAIEMENTS
DROP POLICY IF EXISTS "Staff can view paiements" ON public.paiements;
DROP POLICY IF EXISTS "Admins and comptables can manage paiements" ON public.paiements;
CREATE POLICY "Staff can read paiements" ON public.paiements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and comptables can insert paiements" ON public.paiements FOR INSERT TO authenticated
  WITH CHECK (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can update paiements" ON public.paiements FOR UPDATE TO authenticated
  USING (public.is_comptable_or_admin()) WITH CHECK (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can delete paiements" ON public.paiements FOR DELETE TO authenticated
  USING (public.is_comptable_or_admin());

-- DEPENSES (admin+comptable uniquement)
DROP POLICY IF EXISTS "Admins and comptables can manage depenses" ON public.depenses;
CREATE POLICY "Admins and comptables can read depenses" ON public.depenses FOR SELECT TO authenticated
  USING (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can insert depenses" ON public.depenses FOR INSERT TO authenticated
  WITH CHECK (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can update depenses" ON public.depenses FOR UPDATE TO authenticated
  USING (public.is_comptable_or_admin()) WITH CHECK (public.is_comptable_or_admin());
CREATE POLICY "Admins and comptables can delete depenses" ON public.depenses FOR DELETE TO authenticated
  USING (public.is_comptable_or_admin());

-- FAQ
DROP POLICY IF EXISTS "Authenticated users can read faq" ON public.faq_items;
DROP POLICY IF EXISTS "Admins can manage faq" ON public.faq_items;
CREATE POLICY "Staff can read faq" ON public.faq_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert faq" ON public.faq_items FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update faq" ON public.faq_items FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete faq" ON public.faq_items FOR DELETE TO authenticated USING (public.is_admin());
