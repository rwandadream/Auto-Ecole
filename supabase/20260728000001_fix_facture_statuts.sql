-- Fiabiliser les statuts de facture (payee / partielle / non_payee)
-- 1) Normaliser l'alias legacy impayee → non_payee
UPDATE public.factures
SET statut = 'non_payee'
WHERE statut = 'impayee';

-- 2) Recalcul one-shot depuis la somme des paiements
UPDATE public.factures f
SET statut = CASE
  WHEN COALESCE(p.paye, 0) <= 0 THEN 'non_payee'
  WHEN COALESCE(p.paye, 0) >= f.montant THEN 'payee'
  ELSE 'partielle'
END
FROM (
  SELECT facture_id, COALESCE(SUM(montant), 0) AS paye
  FROM public.paiements
  WHERE facture_id IS NOT NULL
  GROUP BY facture_id
) p
WHERE f.id = p.facture_id;

-- Factures sans aucun paiement → non_payee
UPDATE public.factures f
SET statut = 'non_payee'
WHERE NOT EXISTS (
  SELECT 1 FROM public.paiements p WHERE p.facture_id = f.id
);

-- 3) Resserrer le CHECK (retirer impayee)
ALTER TABLE public.factures DROP CONSTRAINT IF EXISTS factures_statut_check;
ALTER TABLE public.factures
  ADD CONSTRAINT factures_statut_check
  CHECK (statut = ANY (ARRAY['non_payee'::text, 'partielle'::text, 'payee'::text]));

ALTER TABLE public.factures ALTER COLUMN statut SET DEFAULT 'non_payee';

-- 4) Renforcer le trigger de recalcul automatique
CREATE OR REPLACE FUNCTION public.update_facture_statut_after_paiement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_facture_id uuid;
  v_montant numeric;
  v_paye numeric;
  v_statut text;
BEGIN
  v_facture_id := COALESCE(NEW.facture_id, OLD.facture_id);
  IF v_facture_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT montant INTO v_montant FROM public.factures WHERE id = v_facture_id;
  IF v_montant IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COALESCE(SUM(montant), 0) INTO v_paye
  FROM public.paiements
  WHERE facture_id = v_facture_id;

  IF v_paye <= 0 THEN
    v_statut := 'non_payee';
  ELSIF v_paye >= v_montant THEN
    v_statut := 'payee';
  ELSE
    v_statut := 'partielle';
  END IF;

  UPDATE public.factures SET statut = v_statut WHERE id = v_facture_id;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_update_facture_statut ON public.paiements;
CREATE TRIGGER trg_update_facture_statut
AFTER INSERT OR UPDATE OR DELETE ON public.paiements
FOR EACH ROW
EXECUTE FUNCTION public.update_facture_statut_after_paiement();
