-- ============================================================
-- Tables de référence dynamiques SARAH AUTO
-- modes_paiement, categories_depense, app_config + seed faq_items
-- ============================================================

-- 1. Modes de paiement
CREATE TABLE IF NOT EXISTS public.modes_paiement (
  code  TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

ALTER TABLE public.modes_paiement ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique modes_paiement" ON public.modes_paiement;
DROP POLICY IF EXISTS "Admin modes_paiement" ON public.modes_paiement;
CREATE POLICY "Lecture publique modes_paiement" ON public.modes_paiement FOR SELECT USING (true);
CREATE POLICY "Admin modes_paiement" ON public.modes_paiement FOR ALL USING (public.is_admin());

INSERT INTO public.modes_paiement (code, label) VALUES
  ('especes',      'Espèces'),
  ('orange_money', 'Orange Money'),
  ('wave',         'Wave'),
  ('virement',     'Virement')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

-- 2. Catégories de dépense
CREATE TABLE IF NOT EXISTS public.categories_depense (
  code  TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

ALTER TABLE public.categories_depense ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique categories_depense" ON public.categories_depense;
DROP POLICY IF EXISTS "Admin categories_depense" ON public.categories_depense;
CREATE POLICY "Lecture publique categories_depense" ON public.categories_depense FOR SELECT USING (true);
CREATE POLICY "Admin categories_depense" ON public.categories_depense FOR ALL USING (public.is_admin());

INSERT INTO public.categories_depense (code, label) VALUES
  ('carburant',   'Carburant'),
  ('entretien',   'Entretien'),
  ('reparations', 'Réparations'),
  ('assurance',   'Assurance'),
  ('salaires',    'Salaires'),
  ('fournitures', 'Fournitures'),
  ('autres',      'Autres')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

-- 3. Configuration applicative
CREATE TABLE IF NOT EXISTS public.app_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique app_config" ON public.app_config;
DROP POLICY IF EXISTS "Admin app_config" ON public.app_config;
CREATE POLICY "Lecture publique app_config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admin app_config" ON public.app_config FOR ALL USING (public.is_admin());

INSERT INTO public.app_config (key, value, description) VALUES
  ('lieu_rdv_defaut', 'SARAH AUTO — Cocody', 'Lieu de rendez-vous par défaut pour les séances'),
  ('nom_autoecole',   'SARAH AUTO',          'Nom de l''auto-école'),
  ('ville',           'Abidjan',             'Ville principale')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Seed FAQ (si table vide — id auto-généré uuid)
INSERT INTO public.faq_items (question, answer, sort_order)
SELECT v.question, v.answer, v.sort_order
FROM (VALUES
  (
    'Comment scanner la CNI d''un élève ?',
    'Rendez-vous dans l''onglet « Scanner CNI », autorisez l''accès à la webcam, placez la pièce d''identité dans le cadre et cliquez sur « Scanner ». Les champs Nom, Prénom et Date de naissance seront extraits automatiquement.',
    1
  ),
  (
    'Comment relancer une facture impayée par WhatsApp ?',
    'Depuis le tableau de bord ou la section Facturation, repérez les factures au statut « Impayée » puis cliquez sur l''icône WhatsApp verte. Un message pré-rempli s''ouvre dans WhatsApp Web.',
    2
  ),
  (
    'Comment créer une session d''examen collective ?',
    'Dans « Examens & Sessions », cliquez sur « Nouvelle session », renseignez la date, le centre, le type d''examen et l''inspecteur, puis ajoutez les élèves éligibles. Le bordereau PDF est généré automatiquement.',
    3
  ),
  (
    'Comment affecter un véhicule à une séance ?',
    'Dans « Planning & Séances », lors de la création d''une séance, le système propose uniquement les véhicules disponibles sur le créneau choisi pour éviter les doublons.',
    4
  ),
  (
    'Comment saisir les résultats d''examen en masse ?',
    'Ouvrez la session d''examen concernée dans « Bordereaux », puis utilisez le formulaire de saisie rapide pour enregistrer Admis/Échec pour tous les candidats en une fois.',
    5
  ),
  (
    'Où trouver les reçus de paiement d''un élève ?',
    'Dans « Facturation », ouvrez la fiche de l''élève puis l''onglet « Paiements ». Chaque encaissement peut être téléchargé au format PDF.',
    6
  )
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faq_items LIMIT 1);
