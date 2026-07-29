-- RPC : purge des données métier (conserve profiles, catalogue, référentiels, FAQ)
-- Réservé au Super Administrateur via is_super_admin()

CREATE OR REPLACE FUNCTION public.reset_platform_business_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paiements int;
  v_factures int;
  v_examen_session_eleves int;
  v_examen_sessions int;
  v_examens int;
  v_seances int;
  v_inscriptions int;
  v_eleves int;
  v_depenses int;
  v_moniteurs int;
  v_vehicules int;
  v_inspecteurs int;
  v_audit_log int;
  v_portail_attempts int := 0;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  DELETE FROM public.paiements;
  GET DIAGNOSTICS v_paiements = ROW_COUNT;

  DELETE FROM public.factures;
  GET DIAGNOSTICS v_factures = ROW_COUNT;

  DELETE FROM public.examen_session_eleves;
  GET DIAGNOSTICS v_examen_session_eleves = ROW_COUNT;

  DELETE FROM public.examen_sessions;
  GET DIAGNOSTICS v_examen_sessions = ROW_COUNT;

  DELETE FROM public.examens;
  GET DIAGNOSTICS v_examens = ROW_COUNT;

  DELETE FROM public.seances;
  GET DIAGNOSTICS v_seances = ROW_COUNT;

  DELETE FROM public.inscriptions;
  GET DIAGNOSTICS v_inscriptions = ROW_COUNT;

  DELETE FROM public.eleves;
  GET DIAGNOSTICS v_eleves = ROW_COUNT;

  DELETE FROM public.depenses;
  GET DIAGNOSTICS v_depenses = ROW_COUNT;

  DELETE FROM public.moniteurs;
  GET DIAGNOSTICS v_moniteurs = ROW_COUNT;

  DELETE FROM public.vehicules;
  GET DIAGNOSTICS v_vehicules = ROW_COUNT;

  DELETE FROM public.inspecteurs;
  GET DIAGNOSTICS v_inspecteurs = ROW_COUNT;

  DELETE FROM public.audit_log;
  GET DIAGNOSTICS v_audit_log = ROW_COUNT;

  IF to_regclass('public.portail_login_attempts') IS NOT NULL THEN
    DELETE FROM public.portail_login_attempts;
    GET DIAGNOSTICS v_portail_attempts = ROW_COUNT;
  END IF;

  INSERT INTO public.audit_log (action, entity, entity_id, user_id, description, new_data)
  VALUES (
    'RESET_PLATFORM',
    'platform',
    NULL,
    auth.uid(),
    'Purge complète des données métier de la plateforme',
    jsonb_build_object(
      'paiements', v_paiements,
      'factures', v_factures,
      'examen_session_eleves', v_examen_session_eleves,
      'examen_sessions', v_examen_sessions,
      'examens', v_examens,
      'seances', v_seances,
      'inscriptions', v_inscriptions,
      'eleves', v_eleves,
      'depenses', v_depenses,
      'moniteurs', v_moniteurs,
      'vehicules', v_vehicules,
      'inspecteurs', v_inspecteurs,
      'audit_log', v_audit_log,
      'portail_login_attempts', v_portail_attempts
    )
  );

  RETURN jsonb_build_object(
    'paiements', v_paiements,
    'factures', v_factures,
    'examen_session_eleves', v_examen_session_eleves,
    'examen_sessions', v_examen_sessions,
    'examens', v_examens,
    'seances', v_seances,
    'inscriptions', v_inscriptions,
    'eleves', v_eleves,
    'depenses', v_depenses,
    'moniteurs', v_moniteurs,
    'vehicules', v_vehicules,
    'inspecteurs', v_inspecteurs,
    'audit_log', v_audit_log,
    'portail_login_attempts', v_portail_attempts
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reset_platform_business_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_platform_business_data() TO authenticated;
