-- =====================================================
-- Tarif manuel à l'inscription
-- Le montant facturé n'est plus lu depuis formations.prix.
-- p_tarif (entier > 0) est obligatoire et propre à chaque élève.
-- =====================================================

DROP FUNCTION IF EXISTS public.inscrire_eleve(uuid, uuid, numeric);

CREATE FUNCTION public.inscrire_eleve(
  p_eleve_id uuid,
  p_formation_id uuid,
  p_tarif numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tarif numeric;
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

  IF p_tarif IS NULL OR p_tarif <= 0 OR p_tarif <> trunc(p_tarif) THEN
    RAISE EXCEPTION 'Le tarif du permis est obligatoire et doit être un entier positif';
  END IF;
  v_tarif := trunc(p_tarif);

  SELECT * INTO v_eleve FROM public.eleves WHERE id = p_eleve_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Élève introuvable'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.formations WHERE id = p_formation_id) THEN
    RAISE EXCEPTION 'Formation introuvable';
  END IF;

  v_seances_totales := CASE
    WHEN v_eleve.type_permis = 'BCDE' THEN 60
    WHEN v_eleve.type_permis IN ('C', 'D', 'E') THEN 30
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

REVOKE ALL ON FUNCTION public.inscrire_eleve(uuid, uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.inscrire_eleve(uuid, uuid, numeric) TO authenticated;

-- Ajustement du tarif d'un élève déjà inscrit (n'affecte pas les autres dossiers)
CREATE OR REPLACE FUNCTION public.ajuster_tarif_inscription(
  p_eleve_id uuid,
  p_tarif numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tarif numeric;
  v_inscription record;
  v_facture_id uuid;
  v_paye numeric;
  v_statut text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_tarif IS NULL OR p_tarif <= 0 OR p_tarif <> trunc(p_tarif) THEN
    RAISE EXCEPTION 'Le tarif du permis est obligatoire et doit être un entier positif';
  END IF;
  v_tarif := trunc(p_tarif);

  SELECT * INTO v_inscription
  FROM public.inscriptions
  WHERE eleve_id = p_eleve_id
  ORDER BY date_inscription DESC NULLS LAST, created_at DESC NULLS LAST
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aucune inscription à ajuster pour cet élève';
  END IF;

  SELECT id INTO v_facture_id
  FROM public.factures
  WHERE inscription_id = v_inscription.id
  ORDER BY date_emission DESC NULLS LAST, created_at DESC NULLS LAST
  LIMIT 1;

  IF v_facture_id IS NOT NULL THEN
    SELECT COALESCE(SUM(montant), 0) INTO v_paye
    FROM public.paiements
    WHERE facture_id = v_facture_id;

    IF v_tarif < v_paye THEN
      RAISE EXCEPTION 'Le tarif ne peut pas être inférieur au montant déjà encaissé (% FCFA)', v_paye;
    END IF;

    IF v_paye <= 0 THEN
      v_statut := 'non_payee';
    ELSIF v_paye >= v_tarif THEN
      v_statut := 'payee';
    ELSE
      v_statut := 'partielle';
    END IF;

    UPDATE public.factures
    SET montant = v_tarif, statut = v_statut
    WHERE id = v_facture_id;
  END IF;

  UPDATE public.inscriptions
  SET tarif = v_tarif
  WHERE id = v_inscription.id;

  RETURN jsonb_build_object(
    'inscription_id', v_inscription.id,
    'facture_id', v_facture_id,
    'tarif', v_tarif,
    'statut', v_statut
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ajuster_tarif_inscription(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ajuster_tarif_inscription(uuid, numeric) TO authenticated;
