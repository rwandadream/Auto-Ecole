-- =====================================================
-- MIGRATION 006 — Sécurité RLS + Performance
-- SARAH AUTO — à appliquer après migration 005
-- =====================================================

-- =====================================================
-- 1. RLS AUDIT LOG : autoriser tous les utilisateurs
--    authentifiés à insérer leurs propres logs
--    (avant : seuls les admins pouvaient insérer,
--     donc les logs de moniteurs/conseillers étaient
--     silencieusement perdus)
-- =====================================================
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_log;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 2. RLS FACTURES / PAIEMENTS : lire pour tout le
--    personnel (la vue eleves_solde en a besoin).
--    Les conseillers/moniteurs voyaient un solde à 0
--    car leur RLS bloquait la lecture des paiements.
--    Les écritures restent réservées aux admins+comptables.
-- =====================================================
DROP POLICY IF EXISTS "Staff can view factures" ON public.factures;
CREATE POLICY "Staff can view factures"
  ON public.factures FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view paiements" ON public.paiements;
CREATE POLICY "Staff can view paiements"
  ON public.paiements FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. INDEX manquants sur clés étrangères
--    (clés FK sans index = sequential scan à chaque JOIN)
-- =====================================================

-- examens
CREATE INDEX IF NOT EXISTS idx_examens_inspecteur_id
  ON public.examens(inspecteur_id);

CREATE INDEX IF NOT EXISTS idx_examens_date
  ON public.examens(date_examen);

-- paiements
CREATE INDEX IF NOT EXISTS idx_paiements_eleve_id
  ON public.paiements(eleve_id);

-- depenses
CREATE INDEX IF NOT EXISTS idx_depenses_vehicule_id
  ON public.depenses(vehicule_id);

CREATE INDEX IF NOT EXISTS idx_depenses_date
  ON public.depenses(date_depense);

-- audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON public.audit_log(entity, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON public.audit_log(created_at DESC);

-- examen_sessions
CREATE INDEX IF NOT EXISTS idx_examen_sessions_date
  ON public.examen_sessions(date_examen);

CREATE INDEX IF NOT EXISTS idx_examen_sessions_statut
  ON public.examen_sessions(statut);

-- examen_session_eleves
CREATE INDEX IF NOT EXISTS idx_examen_session_eleves_eleve_id
  ON public.examen_session_eleves(eleve_id);

-- inscriptions
CREATE INDEX IF NOT EXISTS idx_inscriptions_formation_id
  ON public.inscriptions(formation_id);

-- factures
CREATE INDEX IF NOT EXISTS idx_factures_statut
  ON public.factures(statut);

CREATE INDEX IF NOT EXISTS idx_factures_numero
  ON public.factures(numero);

-- =====================================================
-- 4. CONTRAINTE UNIQUE manquante sur eleve_code
--    (code et dossier_code peuvent diverger — on évite
--     les doublons sur code)
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_eleves_code_unique
  ON public.eleves(code) WHERE code IS NOT NULL;

-- =====================================================
-- 5. examen_session_eleves : ajouter 'ajourne' au CHECK
--    (cohérence avec la table examens qui accepte ajourne)
-- =====================================================
ALTER TABLE public.examen_session_eleves
  DROP CONSTRAINT IF EXISTS examen_session_eleves_resultat_check;

ALTER TABLE public.examen_session_eleves
  ADD CONSTRAINT examen_session_eleves_resultat_check
  CHECK (resultat IN ('en_attente', 'admis', 'ajourne', 'echec'));
