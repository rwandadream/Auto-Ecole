import type { FaqItem } from '@/lib/domain/types'

export const faqContent: FaqItem[] = [
  {
    id: 'faq-seed-1',
    q: "Comment scanner la CNI d'un élève ?",
    r: "Rendez-vous dans l'onglet « Scanner CNI », autorisez l'accès à la webcam, placez la pièce d'identité dans le cadre et cliquez sur « Scanner ». Les champs Nom, Prénom et Date de naissance seront extraits automatiquement.",
    sortOrder: 1,
  },
  {
    id: 'faq-seed-2',
    q: 'Comment relancer une facture impayée par WhatsApp ?',
    r: "Depuis le tableau de bord ou la section Facturation, repérez les factures au statut « Impayée » puis cliquez sur l'icône WhatsApp verte. Un message pré-rempli s'ouvre dans WhatsApp Web.",
    sortOrder: 2,
  },
  {
    id: 'faq-seed-3',
    q: "Comment créer une session d'examen collective ?",
    r: "Dans « Examens & Sessions », cliquez sur « Nouvelle session », renseignez la date, le centre, le type d'examen et l'inspecteur, puis ajoutez les élèves éligibles. Le bordereau PDF est généré automatiquement.",
    sortOrder: 3,
  },
  {
    id: 'faq-seed-4',
    q: 'Comment affecter un véhicule à une séance ?',
    r: "Dans « Planning & Séances », lors de la création d'une séance, le système propose uniquement les véhicules disponibles sur le créneau choisi pour éviter les doublons.",
    sortOrder: 4,
  },
  {
    id: 'faq-seed-5',
    q: "Comment saisir les résultats d'examen en masse ?",
    r: "Ouvrez la session d'examen concernée dans « Bordereaux », puis utilisez le formulaire de saisie rapide pour enregistrer Admis/Échec pour tous les candidats en une fois.",
    sortOrder: 5,
  },
  {
    id: 'faq-seed-6',
    q: "Où trouver les reçus de paiement d'un élève ?",
    r: "Dans « Facturation », ouvrez la fiche de l'élève puis l'onglet « Paiements ». Chaque encaissement peut être téléchargé au format PDF.",
    sortOrder: 6,
  },
]

export type { FaqItem }
