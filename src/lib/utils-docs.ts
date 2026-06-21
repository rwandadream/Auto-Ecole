// ============================================================
//  SARAH AUTO — Utilitaires WhatsApp & PDF
//  Frontend-only, pas de backend
// ============================================================

// --- WhatsApp relance ---
export function sanitizePhone(phone: string): string {
  // Retire tout sauf les chiffres, garde le préfixe pays
  return phone.replace(/[^\d]/g, '')
}

export function relanceWhatsApp(telephone: string, message: string) {
  const clean = sanitizePhone(telephone)
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function messageRelanceFacture(params: {
  prenom: string
  nom: string
  numeroFacture: string
  reste: number
  telephone: string
}): string {
  const { prenom, nom, numeroFacture, reste } = params
  return (
    `Bonjour ${prenom} ${nom},\n\n` +
    `Votre facture *${numeroFacture}* présente un solde restant de *${reste.toLocaleString('fr-FR')} F CFA*.\n\n` +
    `Nous vous prions de bien vouloir régulariser votre situation via :\n` +
    `• Wave\n• Orange Money\n• Espèces (à l'agence)\n\n` +
    `Merci de votre confiance.\n` +
    `— SARAH AUTO`
  )
}

// --- PDF generation ---
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

type FactureData = {
  numero: string
  eleve: string
  eleveCode: string
  formation: string
  montant: number
  paye: number
  reste: number
  dateEmission: string
}

type PaiementData = {
  facture: string
  eleve: string
  montant: number
  modePaiement: string
  reference: string
  datePaiement: string
}

type SessionData = {
  numeroBordereau: string
  date: string
  heure: string
  centre: string
  typeExamen: string
  inspecteur: string
  vehicule: string
  candidats: Array<{
    nomComplet: string
    identifiant: string
    telephone: string
    categoriePermis: string
    resultat: string
  }>
}

function header(doc: jsPDF, subtitle: string) {
  // Bande orange
  doc.setFillColor(255, 107, 71)
  doc.rect(0, 0, 210, 30, 'F')
  // Logo texte
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SARAH AUTO', 14, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('ERP Auto-Ecole', 14, 24)
  // Sous-titre
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(subtitle, 14, 42)
  // Ligne
  doc.setDrawColor(230, 230, 230)
  doc.line(14, 46, 196, 46)
}

function footer(doc: jsPDF) {
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'SARAH AUTO — Auto-Ecole | Tel: +225 07 00 00 00 | Email: contact@sarahauto.ci',
    105,
    285,
    { align: 'center' }
  )
  doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 105, 290, { align: 'center' })
}

export function generateFacturePdf(f: FactureData) {
  const doc = new jsPDF()
  header(doc, `Facture ${f.numero}`)

  // Infos
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date d'emission: ${f.dateEmission}`, 14, 56)
  doc.text(`Eleve: ${f.eleve} (${f.eleveCode})`, 14, 62)
  doc.text(`Formation: ${f.formation}`, 14, 68)

  // Tableau
  autoTable(doc, {
    startY: 78,
    head: [['Designation', 'Montant (FCFA)'],
           [f.formation, f.montant.toLocaleString('fr-FR')]],
    theme: 'striped',
    headStyles: { fillColor: [255, 107, 71], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  })

  // Totaux
  // @ts-expect-error lastAutoTable is injected by the plugin
  let y = (doc.lastAutoTable?.finalY ?? 100) + 14
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total facture: ${f.montant.toLocaleString('fr-FR')} FCFA`, 120, y)
  doc.text(`Deja paye: ${f.paye.toLocaleString('fr-FR')} FCFA`, 120, y + 7)
  doc.setTextColor(200, 50, 50)
  doc.text(`Reste a payer: ${f.reste.toLocaleString('fr-FR')} FCFA`, 120, y + 14)

  // Statut
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Statut: ${f.reste === 0 ? 'Payee' : f.paye > 0 ? 'Partielle' : 'Non payee'}`, 14, y + 7)

  footer(doc)
  doc.save(`facture-${f.numero}.pdf`)
}

export function generateRecuPdf(p: PaiementData) {
  const doc = new jsPDF()
  header(doc, `Recu de paiement`)

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Recu No: REC-${p.reference}`, 14, 56)
  doc.text(`Date: ${p.datePaiement}`, 14, 62)
  doc.text(`Eleve: ${p.eleve}`, 14, 68)
  doc.text(`Facture: ${p.facture}`, 14, 74)

  // Montant encadré
  doc.setFillColor(255, 247, 244)
  doc.rect(14, 84, 182, 24, 'F')
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 107, 71)
  doc.text(`Montant encaisse: ${p.montant.toLocaleString('fr-FR')} FCFA`, 105, 100, { align: 'center' })

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mode de paiement: ${p.modePaiement}`, 14, 122)
  doc.text(`Reference: ${p.reference}`, 14, 128)

  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('Ce recu confirme la reception du paiement ci-dessus.', 14, 145)

  footer(doc)
  doc.save(`recu-${p.reference}.pdf`)
}

export function generateBordereauPdf(s: SessionData) {
  const doc = new jsPDF()
  header(doc, `Bordereau d'examen — ${s.numeroBordereau}`)

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${s.date} a ${s.heure}`, 14, 56)
  doc.text(`Centre: ${s.centre}`, 14, 62)
  doc.text(`Type d'examen: ${s.typeExamen}`, 14, 68)
  doc.text(`Inspecteur: ${s.inspecteur}`, 14, 74)
  if (s.vehicule !== '—') {
    doc.text(`Vehicule: ${s.vehicule}`, 14, 80)
  }

  // Table des candidats
  autoTable(doc, {
    startY: 88,
    head: [['No', 'Nom complet', 'Identifiant', 'Telephone', 'Categorie', 'Resultat']],
    body: s.candidats.map((c, i) => [
      String(i + 1),
      c.nomComplet,
      c.identifiant,
      c.telephone,
      c.categoriePermis,
      c.resultat,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [255, 107, 71], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  })

  // @ts-expect-error lastAutoTable is injected by the plugin
  const yEnd = (doc.lastAutoTable?.finalY ?? 120) + 10
  doc.setFontSize(9)
  doc.text(`Total candidats: ${s.candidats.length}`, 14, yEnd)

  footer(doc)
  doc.save(`bordereau-${s.numeroBordereau}.pdf`)
}
