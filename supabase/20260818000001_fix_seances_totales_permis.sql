-- =====================================================
-- Fix : le nombre de séances totales à l'inscription doit être calculé
-- à partir du type de permis réellement choisi pour l'élève (type_permis),
-- et non deviné depuis le NOM de la formation (heuristique ILIKE '%AB%'
-- qui produisait 40 séances sans rapport avec le permis sélectionné).
--
-- Règle alignée sur computeSeancesTotales() côté client
-- (src/store/slices/resource-slice.ts) :
--   - BCDE (permis combiné)      -> 60
--   - C, D ou E                  -> 30
--   - tout le reste (B, A, ...)  -> 20
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

  SELECT prix INTO v_tarif
  FROM public.formations WHERE id = p_formation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Formation introuvable'; END IF;

  v_tarif := COALESCE(p_tarif, v_tarif);
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
