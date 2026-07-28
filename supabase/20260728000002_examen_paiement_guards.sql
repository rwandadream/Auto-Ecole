-- Garde-fous paiement avant inscription examens (Code / Conduite)

CREATE OR REPLACE FUNCTION public.eleve_montant_paye(p_eleve_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(p.montant), 0)
  FROM public.paiements p
  JOIN public.factures f ON f.id = p.facture_id
  WHERE f.eleve_id = p_eleve_id;
$$;

CREATE OR REPLACE FUNCTION public.eleve_solde_restant(p_eleve_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT SUM(GREATEST(0, f.montant - COALESCE(paye.total, 0)))
      FROM public.factures f
      LEFT JOIN (
        SELECT facture_id, SUM(montant) AS total
        FROM public.paiements
        GROUP BY facture_id
      ) paye ON paye.facture_id = f.id
      WHERE f.eleve_id = p_eleve_id
    ),
    0
  );
$$;

CREATE OR REPLACE FUNCTION public.eleve_a_facture(p_eleve_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.factures WHERE eleve_id = p_eleve_id);
$$;

CREATE OR REPLACE FUNCTION public.assert_examen_paiement(p_eleve_id uuid, p_type_examen text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_type text := initcap(lower(trim(p_type_examen)));
  v_paye numeric;
  v_solde numeric;
BEGIN
  IF p_eleve_id IS NULL THEN
    RAISE EXCEPTION 'Élève manquant pour l''inscription à l''examen';
  END IF;

  IF NOT public.eleve_a_facture(p_eleve_id) THEN
    RAISE EXCEPTION 'Aucune facture — impossible d''inscrire à l''examen';
  END IF;

  v_paye := public.eleve_montant_paye(p_eleve_id);
  v_solde := public.eleve_solde_restant(p_eleve_id);

  IF v_type = 'Code' THEN
    IF v_paye <= 0 THEN
      RAISE EXCEPTION 'Aucun paiement enregistré — impossible d''inscrire à l''examen du code';
    END IF;
    RETURN;
  END IF;

  IF v_type = 'Conduite' THEN
    IF v_solde > 0 THEN
      RAISE EXCEPTION 'Solde non réglé — impossible d''inscrire à l''examen de conduite';
    END IF;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Type d''examen inconnu: %', p_type_examen;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_assert_examen_paiement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.assert_examen_paiement(NEW.eleve_id, NEW.type_examen);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_examens_paiement_check ON public.examens;
CREATE TRIGGER trg_examens_paiement_check
BEFORE INSERT ON public.examens
FOR EACH ROW
EXECUTE FUNCTION public.trg_assert_examen_paiement();

CREATE OR REPLACE FUNCTION public.trg_assert_session_eleve_paiement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_type text;
BEGIN
  SELECT type_examen INTO v_type
  FROM public.examen_sessions
  WHERE id = NEW.session_id;

  IF v_type IS NULL THEN
    RAISE EXCEPTION 'Session d''examen introuvable';
  END IF;

  PERFORM public.assert_examen_paiement(NEW.eleve_id, v_type);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_session_eleves_paiement_check ON public.examen_session_eleves;
CREATE TRIGGER trg_session_eleves_paiement_check
BEFORE INSERT ON public.examen_session_eleves
FOR EACH ROW
EXECUTE FUNCTION public.trg_assert_session_eleve_paiement();
