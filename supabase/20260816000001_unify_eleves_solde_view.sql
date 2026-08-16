-- =====================================================
-- MIGRATION 021 — Unification du calcul de solde élève
-- Aligne la vue eleves_solde sur le clamp PAR FACTURE, déjà utilisé par
-- eleve_solde_restant() (supabase/20260728000002_examen_paiement_guards.sql)
-- et par finance-utils.ts:soldeEleve() côté client. Avant cette migration,
-- eleves_solde faisait un clamp GLOBAL (GREATEST(SUM(montant)-SUM(paye),0))
-- qui pouvait diverger du solde vu côté client/portail élève dès qu'un
-- élève avait une facture surpayée compensant une facture sous-payée.
-- =====================================================

DROP VIEW IF EXISTS public.eleves_solde;

CREATE VIEW public.eleves_solde
WITH (security_invoker = true)
AS
SELECT
  e.id AS eleve_id,
  COALESCE(SUM(f.montant), 0) AS total_facture,
  COALESCE(SUM(p.paye_facture), 0) AS total_paye,
  COALESCE(SUM(GREATEST(f.montant - COALESCE(p.paye_facture, 0), 0)), 0) AS solde
FROM public.eleves e
LEFT JOIN public.factures f ON f.eleve_id = e.id
LEFT JOIN (
  SELECT facture_id, SUM(montant) AS paye_facture
  FROM public.paiements
  GROUP BY facture_id
) p ON p.facture_id = f.id
GROUP BY e.id;

-- eleve_solde_restant() délègue désormais à la vue unifiée : une seule
-- source de vérité SQL pour le solde par facture.
CREATE OR REPLACE FUNCTION public.eleve_solde_restant(p_eleve_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(solde, 0) FROM public.eleves_solde WHERE eleve_id = p_eleve_id;
$$;
