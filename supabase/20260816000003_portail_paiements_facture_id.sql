-- =====================================================
-- MIGRATION 023 — Corrige get_eleve_portail_data : facture_id manquant
-- Bug : le JSON paiements renvoyé ne contenait pas facture_id (seulement
-- facture_numero), alors que le client (syncDataForEleve,
-- src/lib/supabase/sync-data.ts) construit la table payé-par-facture en
-- lisant p.facture_id. Résultat : ce champ était toujours undefined côté
-- client, payeByFacture restait toujours vide, et donc le solde affiché
-- au portail élève était toujours le montant total dû (jamais le vrai
-- reste), même après un paiement intégral.
-- On ajoute aussi reference, absente jusqu'ici, utile pour l'historique
-- des reçus de paiement côté portail.
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
    SELECT pa.id, pa.facture_id, pa.montant, pa.mode_paiement, pa.reference, pa.date_paiement,
           fa.numero AS facture_numero
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
