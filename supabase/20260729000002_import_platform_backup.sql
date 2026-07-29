-- RPC : restauration plateforme depuis backup JSON (remplacement)
-- Réservé au Super Administrateur via is_super_admin()
-- Ne touche jamais profiles / auth.users

CREATE OR REPLACE FUNCTION public.import_platform_backup(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tables jsonb;
  v_counts jsonb := '{}'::jsonb;
  v_n int;
  v_examen_sessions jsonb;
  v_depenses jsonb;
  v_audit jsonb;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'Payload de sauvegarde invalide';
  END IF;

  IF coalesce(p_payload->>'format', '') <> 'sarah-auto-backup' THEN
    RAISE EXCEPTION 'Format de sauvegarde non reconnu';
  END IF;

  IF coalesce((p_payload->>'version')::int, 0) <> 1 THEN
    RAISE EXCEPTION 'Version de sauvegarde non supportée';
  END IF;

  v_tables := coalesce(p_payload->'tables', '{}'::jsonb);

  -- ── Purge (enfants → parents) ──────────────────────────────────────────────
  DELETE FROM public.paiements;
  DELETE FROM public.factures;
  DELETE FROM public.examen_session_eleves;
  DELETE FROM public.examen_sessions;
  DELETE FROM public.examens;
  DELETE FROM public.seances;
  DELETE FROM public.inscriptions;
  DELETE FROM public.eleves;
  DELETE FROM public.depenses;
  DELETE FROM public.moniteurs;
  DELETE FROM public.vehicules;
  DELETE FROM public.inspecteurs;
  DELETE FROM public.audit_log;
  DELETE FROM public.faq_items;
  DELETE FROM public.formations;
  DELETE FROM public.permis;
  DELETE FROM public.modes_paiement;
  DELETE FROM public.categories_depense;
  DELETE FROM public.app_config;

  IF to_regclass('public.portail_login_attempts') IS NOT NULL THEN
    DELETE FROM public.portail_login_attempts;
  END IF;

  -- ── Sanitiser les FK vers profiles (comptes staff non inclus dans le backup) ─
  SELECT coalesce(jsonb_agg(
    CASE
      WHEN elem ? 'created_by'
        AND elem->>'created_by' IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = (elem->>'created_by')::uuid
        )
      THEN elem || '{"created_by": null}'::jsonb
      ELSE elem
    END
  ), '[]'::jsonb)
  INTO v_examen_sessions
  FROM jsonb_array_elements(coalesce(v_tables->'examen_sessions', '[]'::jsonb)) AS elem;

  SELECT coalesce(jsonb_agg(
    CASE
      WHEN elem ? 'utilisateur_id'
        AND elem->>'utilisateur_id' IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = (elem->>'utilisateur_id')::uuid
        )
      THEN elem || '{"utilisateur_id": null}'::jsonb
      ELSE elem
    END
  ), '[]'::jsonb)
  INTO v_depenses
  FROM jsonb_array_elements(coalesce(v_tables->'depenses', '[]'::jsonb)) AS elem;

  SELECT coalesce(jsonb_agg(
    CASE
      WHEN elem ? 'user_id'
        AND elem->>'user_id' IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = (elem->>'user_id')::uuid
        )
      THEN elem || '{"user_id": null}'::jsonb
      ELSE elem
    END
  ), '[]'::jsonb)
  INTO v_audit
  FROM jsonb_array_elements(coalesce(v_tables->'audit_log', '[]'::jsonb)) AS elem;

  -- ── Insert (parents → enfants) ─────────────────────────────────────────────
  INSERT INTO public.modes_paiement
  SELECT * FROM jsonb_populate_recordset(NULL::public.modes_paiement, coalesce(v_tables->'modes_paiement', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('modes_paiement', v_n);

  INSERT INTO public.categories_depense
  SELECT * FROM jsonb_populate_recordset(NULL::public.categories_depense, coalesce(v_tables->'categories_depense', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('categories_depense', v_n);

  INSERT INTO public.app_config
  SELECT * FROM jsonb_populate_recordset(NULL::public.app_config, coalesce(v_tables->'app_config', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('app_config', v_n);

  INSERT INTO public.permis
  SELECT * FROM jsonb_populate_recordset(NULL::public.permis, coalesce(v_tables->'permis', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('permis', v_n);

  INSERT INTO public.formations
  SELECT * FROM jsonb_populate_recordset(NULL::public.formations, coalesce(v_tables->'formations', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('formations', v_n);

  INSERT INTO public.moniteurs
  SELECT * FROM jsonb_populate_recordset(NULL::public.moniteurs, coalesce(v_tables->'moniteurs', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('moniteurs', v_n);

  INSERT INTO public.vehicules
  SELECT * FROM jsonb_populate_recordset(NULL::public.vehicules, coalesce(v_tables->'vehicules', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('vehicules', v_n);

  INSERT INTO public.inspecteurs
  SELECT * FROM jsonb_populate_recordset(NULL::public.inspecteurs, coalesce(v_tables->'inspecteurs', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('inspecteurs', v_n);

  INSERT INTO public.eleves
  SELECT * FROM jsonb_populate_recordset(NULL::public.eleves, coalesce(v_tables->'eleves', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('eleves', v_n);

  INSERT INTO public.inscriptions
  SELECT * FROM jsonb_populate_recordset(NULL::public.inscriptions, coalesce(v_tables->'inscriptions', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('inscriptions', v_n);

  INSERT INTO public.seances
  SELECT * FROM jsonb_populate_recordset(NULL::public.seances, coalesce(v_tables->'seances', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('seances', v_n);

  INSERT INTO public.examens
  SELECT * FROM jsonb_populate_recordset(NULL::public.examens, coalesce(v_tables->'examens', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('examens', v_n);

  INSERT INTO public.examen_sessions
  SELECT * FROM jsonb_populate_recordset(NULL::public.examen_sessions, v_examen_sessions);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('examen_sessions', v_n);

  INSERT INTO public.examen_session_eleves
  SELECT * FROM jsonb_populate_recordset(NULL::public.examen_session_eleves, coalesce(v_tables->'examen_session_eleves', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('examen_session_eleves', v_n);

  INSERT INTO public.factures
  SELECT * FROM jsonb_populate_recordset(NULL::public.factures, coalesce(v_tables->'factures', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('factures', v_n);

  INSERT INTO public.paiements
  SELECT * FROM jsonb_populate_recordset(NULL::public.paiements, coalesce(v_tables->'paiements', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('paiements', v_n);

  INSERT INTO public.depenses
  SELECT * FROM jsonb_populate_recordset(NULL::public.depenses, v_depenses);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('depenses', v_n);

  INSERT INTO public.faq_items
  SELECT * FROM jsonb_populate_recordset(NULL::public.faq_items, coalesce(v_tables->'faq_items', '[]'::jsonb));
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('faq_items', v_n);

  INSERT INTO public.audit_log
  SELECT * FROM jsonb_populate_recordset(NULL::public.audit_log, v_audit);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('audit_log', v_n);

  INSERT INTO public.audit_log (action, entity, entity_id, user_id, description, new_data)
  VALUES (
    'IMPORT_BACKUP',
    'platform',
    NULL,
    auth.uid(),
    'Restauration complète depuis une sauvegarde JSON',
    v_counts
  );

  RETURN v_counts;
END;
$$;

REVOKE ALL ON FUNCTION public.import_platform_backup(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_platform_backup(jsonb) TO authenticated;
