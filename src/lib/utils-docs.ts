// ============================================================
//  SARAH AUTO — Utilitaires WhatsApp & PDF
//  Frontend-only, pas de backend
// ============================================================

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatAmountFr, formatXOFFcfa, nowFrLocale } from '@/lib/format'

/** Palette ERP SARAH AUTO (alignée sur globals.css) */
const PDF_COLORS = {
  primary: [37, 99, 235] as [number, number, number],
  primaryLight: [239, 246, 255] as [number, number, number],
  foreground: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  destructive: [239, 68, 68] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

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
    `Votre facture *${numeroFacture}* présente un solde restant de *${formatXOFFcfa(reste)}*.\n\n` +
    `Nous vous prions de bien vouloir régulariser votre situation via :\n` +
    `• Wave\n• Orange Money\n• Espèces (à l'agence)\n\n` +
    `Merci de votre confiance.\n` +
    `— SARAH AUTO`
  )
}

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

let cachedLogoPng: string | null = null

/** Charge le logo SVG et le convertit en PNG pour jsPDF (cache en mémoire). */
export async function loadLogoForPdf(): Promise<string | null> {
  if (cachedLogoPng) return cachedLogoPng
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/logo.svg')
    if (!res.ok) return null
    const svgText = await res.text()
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('LOGO_LOAD_FAILED'))
      img.src = objectUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = 72
    canvas.height = 72
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, 72, 72)
    URL.revokeObjectURL(objectUrl)
    cachedLogoPng = canvas.toDataURL('image/png')
    return cachedLogoPng
  } catch {
    return null
  }
}

async function header(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...PDF_COLORS.primary)
  doc.rect(0, 0, 210, 30, 'F')
  const logo = await loadLogoForPdf()
  if (logo) {
    doc.addImage(logo, 'PNG', 14, 6, 18, 18)
  }
  doc.setTextColor(...PDF_COLORS.white)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('SARAH AUTO', logo ? 36 : 14, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('ERP Auto-Ecole', logo ? 36 : 14, 24)
  doc.setTextColor(...PDF_COLORS.foreground)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(subtitle, 14, 42)
  doc.setDrawColor(...PDF_COLORS.border)
  doc.line(14, 46, 196, 46)
}

function footer(doc: jsPDF) {
  doc.setFontSize(8)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'SARAH AUTO — Auto-Ecole | Tel: +225 07 00 00 00 | Email: contact@sarahauto.ci',
    105,
    285,
    { align: 'center' }
  )
  doc.text(`Genere le ${nowFrLocale()}`, 105, 290, { align: 'center' })
}

export async function generateFacturePdf(f: FactureData) {
  const doc = new jsPDF()
  await header(doc, `Facture ${f.numero}`)

  // Infos
  doc.setTextColor(...PDF_COLORS.foreground)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date d'emission: ${f.dateEmission}`, 14, 56)
  doc.text(`Eleve: ${f.eleve} (${f.eleveCode})`, 14, 62)
  doc.text(`Formation: ${f.formation}`, 14, 68)

  autoTable(doc, {
    startY: 78,
    head: [['Designation', 'Montant (FCFA)'],
           [f.formation, formatAmountFr(f.montant)]],
    theme: 'striped',
    headStyles: { fillColor: PDF_COLORS.primary, textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  })

  // Totaux
  // @ts-expect-error lastAutoTable is injected by the plugin
  let y = (doc.lastAutoTable?.finalY ?? 100) + 14
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total facture: ${formatXOFFcfa(f.montant)}`, 120, y)
  doc.text(`Deja paye: ${formatXOFFcfa(f.paye)}`, 120, y + 7)
  doc.setTextColor(...PDF_COLORS.destructive)
  doc.text(`Reste a payer: ${formatXOFFcfa(f.reste)}`, 120, y + 14)

  doc.setTextColor(...PDF_COLORS.foreground)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Statut: ${f.reste === 0 ? 'Payee' : f.paye > 0 ? 'Partielle' : 'Non payee'}`, 14, y + 7)

  footer(doc)
  doc.save(`facture-${f.numero}.pdf`)
}

export async function generateRecuPdf(p: PaiementData) {
  const doc = new jsPDF()
  await header(doc, `Recu de paiement`)

  doc.setTextColor(...PDF_COLORS.foreground)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Recu No: REC-${p.reference}`, 14, 56)
  doc.text(`Date: ${p.datePaiement}`, 14, 62)
  doc.text(`Eleve: ${p.eleve}`, 14, 68)
  doc.text(`Facture: ${p.facture}`, 14, 74)

  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.rect(14, 84, 182, 24, 'F')
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_COLORS.primary)
  doc.text(`Montant encaisse: ${formatXOFFcfa(p.montant)}`, 105, 100, { align: 'center' })

  doc.setTextColor(...PDF_COLORS.foreground)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mode de paiement: ${p.modePaiement}`, 14, 122)
  doc.text(`Reference: ${p.reference}`, 14, 128)

  doc.setFontSize(9)
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text('Ce recu confirme la reception du paiement ci-dessus.', 14, 145)

  footer(doc)
  doc.save(`recu-${p.reference}.pdf`)
}

export async function generateBordereauPdf(s: SessionData) {
  const doc = new jsPDF()
  await header(doc, `Bordereau d'examen — ${s.numeroBordereau}`)

  doc.setTextColor(...PDF_COLORS.foreground)
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
    headStyles: { fillColor: PDF_COLORS.primary, textColor: 255, fontSize: 9 },
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
