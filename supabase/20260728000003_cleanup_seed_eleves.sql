-- =============================================================================
-- Nettoyage données de test (seed EL-2401 … EL-2410)
-- =============================================================================
-- Critères : code élève EL-2401 à EL-24010 OU email *@email.com (seed)
-- CONSERVÉ : EL-2413+ (données réelles), comptes staff gmail / @sarahauto.ci
--
-- Mode dry-run : exécuter uniquement la section SELECT ci-dessous.
-- Mode apply   : décommenter / exécuter la section DELETE.
-- =============================================================================

-- ---------- DRY-RUN (lecture seule) ----------
SELECT e.id, e.code, e.nom, e.prenom, e.email, e.telephone
FROM public.eleves e
WHERE e.code ~ '^EL-240[1-9]$'
   OR e.code = 'EL-2410'
   OR (e.email IS NOT NULL AND e.email ILIKE '%@email.com');

SELECT f.id, f.numero, e.code AS eleve_code, f.montant, f.statut
FROM public.factures f
JOIN public.eleves e ON e.id = f.eleve_id
WHERE e.code ~ '^EL-240[1-9]$'
   OR e.code = 'EL-2410'
   OR (e.email IS NOT NULL AND e.email ILIKE '%@email.com');

SELECT p.id, p.montant, e.code AS eleve_code
FROM public.paiements p
JOIN public.eleves e ON e.id = p.eleve_id
WHERE e.code ~ '^EL-240[1-9]$'
   OR e.code = 'EL-2410'
   OR (e.email IS NOT NULL AND e.email ILIKE '%@email.com');

SELECT COUNT(*) AS staff_sarahauto
FROM public.profiles
WHERE email ILIKE '%@sarahauto.ci';
-- (non supprimés automatiquement — confirmation manuelle requise)

-- ---------- APPLY (suppression ordonnée) ----------
-- Exécuter après validation du dry-run.

DO $$
DECLARE
  seed_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(e.id) INTO seed_ids
  FROM public.eleves e
  WHERE e.code ~ '^EL-240[1-9]$'
     OR e.code = 'EL-2410'
     OR (e.email IS NOT NULL AND e.email ILIKE '%@email.com');

  IF seed_ids IS NULL OR array_length(seed_ids, 1) IS NULL THEN
    RAISE NOTICE 'Aucun élève seed à supprimer';
    RETURN;
  END IF;

  RAISE NOTICE 'Suppression de % élève(s) seed', array_length(seed_ids, 1);

  DELETE FROM public.examen_session_eleves
  WHERE eleve_id = ANY (seed_ids);

  DELETE FROM public.examens
  WHERE eleve_id = ANY (seed_ids);

  DELETE FROM public.seances
  WHERE eleve_id = ANY (seed_ids);

  DELETE FROM public.paiements
  WHERE eleve_id = ANY (seed_ids)
     OR facture_id IN (SELECT id FROM public.factures WHERE eleve_id = ANY (seed_ids));

  DELETE FROM public.factures
  WHERE eleve_id = ANY (seed_ids);

  DELETE FROM public.inscriptions
  WHERE eleve_id = ANY (seed_ids);

  DELETE FROM public.eleves
  WHERE id = ANY (seed_ids);

  -- Sessions d'examen sans candidats
  DELETE FROM public.examen_sessions s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.examen_session_eleves ese WHERE ese.session_id = s.id
  );
END $$;
