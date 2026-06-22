-- =====================================================
-- Phase 3 — FAQ éditable + Realtime séances/factures
-- =====================================================

CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_items_sort_order ON public.faq_items(sort_order);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read faq"
  ON public.faq_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage faq"
  ON public.faq_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed initial (idempotent via question unique)
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

-- Realtime (ignore si déjà présent)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.seances;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.factures;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.paiements;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
