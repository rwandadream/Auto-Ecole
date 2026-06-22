-- Audit fixes: schema alignment, indexes, RLS, RPCs transactionnelles
-- SARAH AUTO — à appliquer après les 3 fichiers SQL existants

-- =====================================================
-- ELEVES — colonnes manquantes pour parité UI
-- =====================================================
ALTER TABLE public.eleves
  ADD COLUMN IF NOT EXISTS moniteur_id uuid REFERENCES public.moniteurs(id);

ALTER TABLE public.eleves
  ADD COLUMN IF NOT EXISTS seances_faites integer DEFAULT 0;

ALTER TABLE public.eleves
  ADD COLUMN IF NOT EXISTS seances_totales integer DEFAULT 20;

-- =====================================================
-- ENUMS — harmonisation examens / séances
-- =====================================================
ALTER TABLE public.examens DROP CONSTRAINT IF EXISTS examens_resultat_check;
ALTER TABLE public.examens ADD CONSTRAINT examens_resultat_check
  CHECK (resultat IN ('en_attente', 'admis', 'ajourne', 'echec'));

ALTER TABLE public.seances DROP CONSTRAINT IF EXISTS seances_statut_check;
ALTER TABLE public.seances ADD CONSTRAINT seances_statut_check
  CHECK (statut IN ('planifie', 'effectue', 'absent_eleve', 'annule'));

-- =====================================================
-- INDEX performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_eleves_code ON public.eleves(code);
CREATE INDEX IF NOT EXISTS idx_eleves_dossier_code ON public.eleves(dossier_code);
CREATE INDEX IF NOT EXISTS idx_eleves_moniteur_id ON public.eleves(moniteur_id);
CREATE INDEX IF NOT EXISTS idx_eleves_statut ON public.eleves(statut);
CREATE INDEX IF NOT EXISTS idx_seances_date ON public.seances(date_seance);
CREATE INDEX IF NOT EXISTS idx_seances_eleve_id ON public.seances(eleve_id);
CREATE INDEX IF NOT EXISTS idx_seances_moniteur_id ON public.seances(moniteur_id);
CREATE INDEX IF NOT EXISTS idx_factures_eleve_id ON public.factures(eleve_id);
CREATE INDEX IF NOT EXISTS idx_paiements_facture_id ON public.paiements(facture_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_eleve_id ON public.inscriptions(eleve_id);
CREATE INDEX IF NOT EXISTS idx_examens_eleve_id ON public.examens(eleve_id);

-- =====================================================
-- VUE solde élève (calculé, pas stocké)
-- =====================================================
CREATE OR REPLACE VIEW public.eleves_solde AS
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
-- HELPER comptable
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_comptable_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('administrateur_principal', 'administrateur_secondaire', 'comptable')
  );
$$;

-- =====================================================
-- RLS — bordereaux (remplacer policies permissives)
-- =====================================================
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.examen_sessions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.examen_session_eleves;

CREATE POLICY "Staff can view examen_sessions"
  ON public.examen_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage examen_sessions"
  ON public.examen_sessions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Staff can view examen_session_eleves"
  ON public.examen_session_eleves FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage examen_session_eleves"
  ON public.examen_session_eleves FOR ALL
  USING (public.is_admin());

-- =====================================================
-- RLS — audit_log INSERT pour admins
-- =====================================================
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (public.is_admin());

-- =====================================================
-- TRIGGER — recalcul statut facture après paiement
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_facture_statut_after_paiement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_facture_id uuid;
  v_montant numeric;
  v_paye numeric;
  v_statut text;
BEGIN
  v_facture_id := COALESCE(NEW.facture_id, OLD.facture_id);
  IF v_facture_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  SELECT montant INTO v_montant FROM public.factures WHERE id = v_facture_id;
  SELECT COALESCE(SUM(montant), 0) INTO v_paye
  FROM public.paiements WHERE facture_id = v_facture_id;

  IF v_paye >= v_montant THEN
    v_statut := 'payee';
  ELSIF v_paye > 0 THEN
    v_statut := 'partielle';
  ELSE
    v_statut := 'non_payee';
  END IF;

  UPDATE public.factures SET statut = v_statut WHERE id = v_facture_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_facture_statut ON public.paiements;
CREATE TRIGGER trg_update_facture_statut
  AFTER INSERT OR UPDATE OR DELETE ON public.paiements
  FOR EACH ROW EXECUTE FUNCTION public.update_facture_statut_after_paiement();

-- =====================================================
-- TRIGGER — compteur séances effectuées sur élève
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_eleve_seances_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_eleve_id uuid;
BEGIN
  v_eleve_id := COALESCE(NEW.eleve_id, OLD.eleve_id);
  IF v_eleve_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  UPDATE public.eleves SET seances_faites = (
    SELECT COUNT(*) FROM public.seances
    WHERE eleve_id = v_eleve_id AND statut = 'effectue'
  ) WHERE id = v_eleve_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_eleve_seances ON public.seances;
CREATE TRIGGER trg_update_eleve_seances
  AFTER INSERT OR UPDATE OR DELETE ON public.seances
  FOR EACH ROW EXECUTE FUNCTION public.update_eleve_seances_count();

-- =====================================================
-- RPC — inscrire élève (transaction)
-- =====================================================
CREATE OR REPLACE FUNCTION public.inscrire_eleve(
  p_eleve_id uuid,
  p_formation_id uuid,
  p_tarif numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tarif numeric;
  v_formation_nom text;
  v_eleve record;
  v_inscription_id uuid;
  v_facture_id uuid;
  v_numero text;
  v_year int;
  v_max int;
  v_seances_totales int;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT * INTO v_eleve FROM public.eleves WHERE id = p_eleve_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Élève introuvable'; END IF;

  SELECT nom, prix INTO v_formation_nom, v_tarif
  FROM public.formations WHERE id = p_formation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Formation introuvable'; END IF;

  v_tarif := COALESCE(p_tarif, v_tarif);
  v_seances_totales := CASE
    WHEN v_formation_nom ILIKE '%AB%' THEN 40
    WHEN v_formation_nom ILIKE '%moto%' OR v_formation_nom ILIKE '% A %' THEN 15
    ELSE 20
  END;

  INSERT INTO public.inscriptions (eleve_id, formation_id, tarif)
  VALUES (p_eleve_id, p_formation_id, v_tarif)
  RETURNING id INTO v_inscription_id;

  v_year := EXTRACT(YEAR FROM CURRENT_DATE);
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS int)), 0) INTO v_max
  FROM public.factures WHERE numero LIKE 'FAC-' || v_year || '-%';
  v_numero := 'FAC-' || v_year || '-' || LPAD((v_max + 1)::text, 4, '0');

  INSERT INTO public.factures (numero, eleve_id, inscription_id, montant, statut)
  VALUES (v_numero, p_eleve_id, v_inscription_id, v_tarif, 'non_payee')
  RETURNING id INTO v_facture_id;

  UPDATE public.eleves SET
    statut = 'inscrit',
    seances_totales = v_seances_totales
  WHERE id = p_eleve_id;

  RETURN jsonb_build_object(
    'inscription_id', v_inscription_id,
    'facture_id', v_facture_id,
    'facture_numero', v_numero,
    'tarif', v_tarif
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.inscrire_eleve(uuid, uuid, numeric) TO authenticated;

-- =====================================================
-- RPC — enregistrer paiement (transaction)
-- =====================================================
CREATE OR REPLACE FUNCTION public.enregistrer_paiement(
  p_facture_id uuid,
  p_montant numeric,
  p_mode_paiement text,
  p_reference text DEFAULT '',
  p_notes text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_facture record;
  v_paiement_id uuid;
BEGIN
  IF NOT public.is_comptable_or_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT * INTO v_facture FROM public.factures WHERE id = p_facture_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Facture introuvable'; END IF;

  INSERT INTO public.paiements (facture_id, eleve_id, montant, mode_paiement, reference, notes)
  VALUES (p_facture_id, v_facture.eleve_id, p_montant, p_mode_paiement, p_reference, p_notes)
  RETURNING id INTO v_paiement_id;

  RETURN v_paiement_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.enregistrer_paiement(uuid, numeric, text, text, text) TO authenticated;

-- =====================================================
-- RPC — données portail élève
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_eleve_portail_data(
  p_code text,
  p_telephone text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_eleve record;
  v_seances jsonb;
  v_factures jsonb;
  v_paiements jsonb;
BEGIN
  SELECT * INTO v_eleve FROM public.eleves e
  WHERE lower(trim(COALESCE(e.code, e.dossier_code, ''))) = lower(trim(p_code))
    AND regexp_replace(e.telephone, '\s', '', 'g') = regexp_replace(p_telephone, '\s', '', 'g')
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Identifiants invalides';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(s.*)), '[]'::jsonb) INTO v_seances
  FROM (
    SELECT sc.id, sc.date_seance, sc.heure_debut, sc.heure_fin, sc.statut, sc.lieu, sc.duree_minutes,
           m.prenom || ' ' || m.nom AS moniteur_nom
    FROM public.seances sc
    LEFT JOIN public.moniteurs m ON m.id = sc.moniteur_id
    WHERE sc.eleve_id = v_eleve.id
    ORDER BY sc.date_seance DESC
  ) s;

  SELECT COALESCE(jsonb_agg(row_to_json(f.*)), '[]'::jsonb) INTO v_factures
  FROM (
    SELECT fa.id, fa.numero, fa.montant, fa.statut, fa.date_emission
    FROM public.factures fa WHERE fa.eleve_id = v_eleve.id
    ORDER BY fa.date_emission DESC
  ) f;

  SELECT COALESCE(jsonb_agg(row_to_json(p.*)), '[]'::jsonb) INTO v_paiements
  FROM (
    SELECT pa.id, pa.montant, pa.mode_paiement, pa.date_paiement, fa.numero AS facture_numero
    FROM public.paiements pa
    JOIN public.factures fa ON fa.id = pa.facture_id
    WHERE pa.eleve_id = v_eleve.id
    ORDER BY pa.date_paiement DESC
  ) p;

  RETURN jsonb_build_object(
    'eleve', row_to_json(v_eleve),
    'seances', v_seances,
    'factures', v_factures,
    'paiements', v_paiements
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_eleve_portail_data(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_eleve_portail_data(text, text) TO anon, authenticated;
