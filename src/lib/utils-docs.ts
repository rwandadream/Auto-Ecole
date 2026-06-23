// ============================================================
//  SARAH AUTO — Utilitaires WhatsApp & PDF
//  Frontend-only, pas de backend
// ============================================================

import { jsPDF } from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
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
// Numéro WhatsApp de l'auto-école (toutes les relances partent de ce numéro)
export const WHATSAPP_AUTOECOLE = '2250709089884'

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

export function relanceWhatsApp(_telephone: string, message: string) {
  // Ouvre toujours la conversation vers le numéro WhatsApp de l'auto-école
  const url = `https://wa.me/${WHATSAPP_AUTOECOLE}?text=${encodeURIComponent(message)}`
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
  lieu?: string
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
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const pageW  = 210
  const pageH  = 297
  const mL     = 14
  const mR     = 14
  const cW     = pageW - mL - mR   // 182 mm usable width

  const NAVY:   [number, number, number] = [15,  52,  96]
  const NAVY_LT:[number, number, number] = [229, 237, 249]
  const BLACK:  [number, number, number] = [20,  20,  20]
  const MUTED:  [number, number, number] = [100, 116, 139]
  const WHITE:  [number, number, number] = [255, 255, 255]
  const GREEN:  [number, number, number] = [21,  101, 52]
  const AMBER:  [number, number, number] = [146, 64,  14]
  const SLATE:  [number, number, number] = [71,  85,  105]

  let y = 8

  // ── Logo ─────────────────────────────────────────────────────────────────
  const logo = await loadLogoForPdf()
  if (logo) {
    doc.addImage(logo, 'PNG', mL, y, 22, 22)
  }
  const txtX = mL + (logo ? 28 : 0)

  // ── Company info (left of header) ─────────────────────────────────────────
  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text('SARAH AUTO-ÉCOLE', txtX, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text('Formation & recyclage des conducteurs professionnels', txtX, y + 14)
  doc.text('☎ +225 07 09 08 98 84   •   Abidjan, Côte d\'Ivoire', txtX, y + 19)

  // ── N° Bordereau badge (top-right) ────────────────────────────────────────
  const bdgW = 52
  const bdgX = pageW - mR - bdgW
  doc.setFillColor(...NAVY)
  doc.roundedRect(bdgX, y + 1, bdgW, 14, 2, 2, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('N° BORDEREAU', bdgX + bdgW / 2, y + 6.5, { align: 'center' })
  doc.setFontSize(11)
  doc.text(s.numeroBordereau, bdgX + bdgW / 2, y + 13, { align: 'center' })

  y += 28

  // ── Separator line ────────────────────────────────────────────────────────
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.7)
  doc.line(mL, y, pageW - mR, y)
  y += 5

  // ── Title band ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(mL, y, cW, 12, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text("BORDEREAU D'EXAMEN DE CONDUITE AUTOMOBILE", pageW / 2, y + 8, { align: 'center' })
  y += 16

  // ── Info grid — 4 columns × 2 rows ───────────────────────────────────────
  const colW = cW / 4        // 45.5 mm each
  const rowH = 13

  const infoBox = (lbl: string, val: string, bx: number, by: number, w: number) => {
    // Box background + border
    doc.setFillColor(...NAVY_LT)
    doc.setDrawColor(...NAVY)
    doc.setLineWidth(0.25)
    doc.rect(bx, by, w - 1.5, rowH, 'FD')
    // Label (small caps style)
    doc.setTextColor(...NAVY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.text(lbl, bx + 2.5, by + 4.5)
    // Value
    doc.setTextColor(...BLACK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const safe = val ? val.toUpperCase() : '—'
    // Truncate if wider than box
    let display = safe
    while (doc.getTextWidth(display) > w - 7 && display.length > 1) {
      display = display.slice(0, -1)
    }
    if (display !== safe) display += '…'
    doc.text(display, bx + 2.5, by + rowH - 3)
  }

  // Row 1
  infoBox('DATE',         s.date,               mL,              y, colW)
  infoBox('HEURE',        s.heure,              mL + colW,       y, colW)
  infoBox("TYPE D'EXAMEN", s.typeExamen,         mL + colW * 2,   y, colW)
  infoBox('CENTRE',       s.centre,             mL + colW * 3,   y, colW)
  y += rowH + 2

  // Row 2
  infoBox('LIEU',         s.lieu || s.centre,   mL,              y, colW)
  infoBox('INSPECTEUR',   s.inspecteur,         mL + colW,       y, colW * 2)  // double width
  infoBox('VÉHICULE',     s.vehicule,           mL + colW * 3,   y, colW)
  y += rowH + 6

  // ── Candidates table ──────────────────────────────────────────────────────
  const hasResults = s.candidats.some(
    (c) => c.resultat && c.resultat !== 'En attente',
  )

  const head = hasResults
    ? [['N°', 'NOM ET PRÉNOMS', 'N° DOSSIER', 'CAT.', 'RÉSULTAT']]
    : [['N°', 'NOM ET PRÉNOMS', 'N° DOSSIER', 'TÉLÉPHONE', 'CAT.']]

  const body = s.candidats.map((c, i) =>
    hasResults
      ? [String(i + 1), c.nomComplet.toUpperCase(), c.identifiant, c.categoriePermis, c.resultat]
      : [String(i + 1), c.nomComplet.toUpperCase(), c.identifiant, c.telephone,       c.categoriePermis],
  )

  // Colour-code result cells
  const didFillCell = (data: CellHookData) => {
    if (!hasResults || data.section !== 'body' || data.column.index !== 4) return
    const r = String(data.cell.raw)
    if (r === 'Admis')    { data.cell.styles.textColor = GREEN; data.cell.styles.fontStyle = 'bold' }
    if (r === 'Ajourné')  { data.cell.styles.textColor = AMBER; data.cell.styles.fontStyle = 'bold' }
    if (r === 'Absent')   { data.cell.styles.textColor = SLATE; data.cell.styles.fontStyle = 'bold' }
  }

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'grid',
    didParseCell: didFillCell,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 2 },
      textColor: BLACK,
      lineColor: [180, 195, 220],
      lineWidth: 0.22,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      lineColor: NAVY,
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [246, 249, 255] },
    columnStyles: hasResults
      ? {
          0: { halign: 'center', cellWidth: 11 },
          1: { halign: 'left',   cellWidth: 75 },
          2: { halign: 'center', cellWidth: 40 },
          3: { halign: 'center', cellWidth: 18 },
          4: { halign: 'center', cellWidth: 38 },
        }
      : {
          0: { halign: 'center', cellWidth: 11 },
          1: { halign: 'left',   cellWidth: 72 },
          2: { halign: 'center', cellWidth: 38 },
          3: { halign: 'center', cellWidth: 37 },
          4: { halign: 'center', cellWidth: 24 },
        },
    margin: { left: mL, right: mR },
  })

  // @ts-expect-error lastAutoTable is set by the plugin
  let endY: number = (doc.lastAutoTable?.finalY ?? 190) + 6

  // ── Results summary (only when results are filled in) ─────────────────────
  if (hasResults) {
    const admitted = s.candidats.filter((c) => c.resultat === 'Admis').length
    const deferred = s.candidats.filter((c) => c.resultat === 'Ajourné').length
    const absent   = s.candidats.filter((c) => c.resultat === 'Absent').length
    const total    = s.candidats.length

    const tileW = cW / 4 - 2
    const tileH = 15
    const tiles: { label: string; value: number; bg: [number, number, number] }[] = [
      { label: 'ADMIS',    value: admitted, bg: GREEN },
      { label: 'AJOURNÉS', value: deferred, bg: AMBER },
      { label: 'ABSENTS',  value: absent,   bg: SLATE },
      { label: 'TOTAL',    value: total,    bg: NAVY  },
    ]
    tiles.forEach(({ label, value, bg }, idx) => {
      const tx = mL + idx * (tileW + 2.5)
      doc.setFillColor(...bg)
      doc.roundedRect(tx, endY, tileW, tileH, 1.5, 1.5, 'F')
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.text(label, tx + tileW / 2, endY + 5.5, { align: 'center' })
      doc.setFontSize(15)
      doc.text(String(value), tx + tileW / 2, endY + 12.5, { align: 'center' })
    })
    endY += tileH + 8
  }

  // ── Signature zone — overflow to new page if needed ───────────────────────
  const sigH = 36
  if (endY + sigH + 22 > pageH - 18) {
    doc.addPage()
    endY = 18
  } else {
    endY += 6
  }

  const halfW = cW / 2 - 4

  // Left: Inspecteur
  doc.setFillColor(...NAVY_LT)
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.3)
  doc.rect(mL, endY, halfW, sigH, 'FD')
  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text("L'INSPECTEUR DU PERMIS", mL + halfW / 2, endY + 7, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Signature et cachet', mL + halfW / 2, endY + sigH - 4, { align: 'center' })

  // Right: Chef d'établissement
  const rx = mL + halfW + 8
  doc.setFillColor(...NAVY_LT)
  doc.rect(rx, endY, halfW, sigH, 'FD')
  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text("LE CHEF D'ÉTABLISSEMENT", rx + halfW / 2, endY + 7, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Signature et cachet', rx + halfW / 2, endY + sigH - 4, { align: 'center' })

  // ── Page footer (absolute bottom of last page) ─────────────────────────────
  const curPage = doc.getNumberOfPages()
  doc.setPage(curPage)
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.35)
  doc.line(mL, pageH - 17, pageW - mR, pageH - 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(
    "SARAH AUTO-ÉCOLE  •  Tél : +225 07 09 08 98 84  •  Abidjan, Côte d'Ivoire",
    pageW / 2, pageH - 11.5, { align: 'center' },
  )
  doc.text(
    `Document officiel — généré le ${nowFrLocale()}`,
    pageW / 2, pageH - 6.5, { align: 'center' },
  )

  doc.save(`bordereau-${s.numeroBordereau}.pdf`)
}

// ============================================================
//  Rapport mensuel PDF comptabilité
// ============================================================

export type RapportMensuelData = {
  mois: string
  annee: number
  recettes: {
    totalFacture: number
    totalEncaisse: number
    parMode: Record<string, number>
  }
  depenses: {
    total: number
    parCategorie: Record<string, number>
    lignes: Array<{ date: string; categorie: string; description: string; montant: number; mode: string }>
  }
  eleves: {
    inscrits: number
    enFormation: number
    admis: number
    total: number
  }
  formations: Array<{ nom: string; count: number; chiffre: number }>
}

export async function generateRapportMensuelPdf(d: RapportMensuelData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210
  const mL = 14
  const mR = 14
  const resultatNet = d.recettes.totalEncaisse - d.depenses.total
  const isPositif = resultatNet >= 0

  // ===== EN-TÊTE =====
  doc.setFillColor(...PDF_COLORS.primary)
  doc.rect(0, 0, pageW, 28, 'F')
  const logo = await loadLogoForPdf()
  if (logo) doc.addImage(logo, 'PNG', mL, 5, 18, 18)
  doc.setTextColor(...PDF_COLORS.white)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SARAH AUTO-ECOLE', logo ? 36 : mL, 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport mensuel de comptabilité', logo ? 36 : mL, 23)

  // Titre période
  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.rect(0, 28, pageW, 14, 'F')
  doc.setTextColor(...PDF_COLORS.primary)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`${d.mois.toUpperCase()} ${d.annee}`, pageW / 2, 37, { align: 'center' })

  let y = 52

  // ===== KPI RÉSUMÉ =====
  const kpiW = (pageW - mL - mR - 8) / 3
  const kpis = [
    { label: 'Recettes encaissées', val: formatAmountFr(d.recettes.totalEncaisse), color: PDF_COLORS.primary },
    { label: 'Total dépenses', val: formatAmountFr(d.depenses.total), color: PDF_COLORS.destructive as [number,number,number] },
    { label: 'Résultat net', val: formatAmountFr(Math.abs(resultatNet)), color: isPositif ? [34, 197, 94] as [number,number,number] : PDF_COLORS.destructive as [number,number,number] },
  ]
  kpis.forEach((kpi, i) => {
    const x = mL + i * (kpiW + 4)
    doc.setFillColor(...PDF_COLORS.primaryLight)
    doc.roundedRect(x, y, kpiW, 24, 3, 3, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...PDF_COLORS.muted)
    doc.text(kpi.label.toUpperCase(), x + kpiW / 2, y + 7, { align: 'center' })
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...kpi.color)
    doc.text(`${i === 2 && !isPositif ? '-' : ''}${kpi.val}`, x + kpiW / 2, y + 19, { align: 'center' })
  })
  y += 32

  const sectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(...PDF_COLORS.primary)
    doc.rect(mL, yPos, pageW - mL - mR, 7, 'F')
    doc.setTextColor(...PDF_COLORS.white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), mL + 3, yPos + 5)
    doc.setTextColor(...PDF_COLORS.foreground)
    return yPos + 11
  }

  // ===== RECETTES =====
  y = sectionHeader('Recettes', y)
  const recetteRows: string[][] = [
    ['Total facturé (créances)', formatAmountFr(d.recettes.totalFacture)],
    ['Total encaissé', formatAmountFr(d.recettes.totalEncaisse)],
    ['Reste à recouvrer', formatAmountFr(Math.max(0, d.recettes.totalFacture - d.recettes.totalEncaisse))],
    ...Object.entries(d.recettes.parMode).map(([mode, montant]) => [
      `  └ ${mode}`, formatAmountFr(montant)
    ]),
  ]
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Montant (FCFA)']],
    body: recetteRows,
    theme: 'striped',
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: mL, right: mR },
  })
  // @ts-expect-error lastAutoTable is injected by the plugin
  y = (doc.lastAutoTable?.finalY ?? y) + 8

  // ===== DÉPENSES =====
  if (y > 200) { doc.addPage(); y = 20 }
  y = sectionHeader('Dépenses par catégorie', y)
  const depenseRows = Object.entries(d.depenses.parCategorie)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, montant]) => [
      cat,
      formatAmountFr(montant),
      d.depenses.total > 0 ? `${Math.round((montant / d.depenses.total) * 100)}%` : '0%',
    ])
  depenseRows.push(['TOTAL', formatAmountFr(d.depenses.total), '100%'])
  autoTable(doc, {
    startY: y,
    head: [['Catégorie', 'Montant (FCFA)', '% du total']],
    body: depenseRows,
    theme: 'striped',
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'center' } },
    margin: { left: mL, right: mR },
  })
  // @ts-expect-error lastAutoTable is injected by the plugin
  y = (doc.lastAutoTable?.finalY ?? y) + 8

  // ===== ÉLÈVES =====
  if (y > 220) { doc.addPage(); y = 20 }
  y = sectionHeader('Activité élèves', y)
  autoTable(doc, {
    startY: y,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Total élèves inscrits', String(d.eleves.total)],
      ['En formation', String(d.eleves.enFormation)],
      ['Admis (permis obtenu)', String(d.eleves.admis)],
      ['Nouvelles inscriptions ce mois', String(d.eleves.inscrits)],
    ],
    theme: 'striped',
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: { 1: { halign: 'center' } },
    margin: { left: mL, right: mR },
  })
  // @ts-expect-error lastAutoTable is injected by the plugin
  y = (doc.lastAutoTable?.finalY ?? y) + 8

  // ===== FORMATIONS TOP =====
  if (d.formations.length > 0) {
    if (y > 220) { doc.addPage(); y = 20 }
    y = sectionHeader('Top formations vendues', y)
    autoTable(doc, {
      startY: y,
      head: [['Formation', 'Élèves', 'Chiffre d\'affaires (FCFA)']],
      body: d.formations.slice(0, 10).map((f) => [f.nom, String(f.count), formatAmountFr(f.chiffre)]),
      theme: 'striped',
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
      margin: { left: mL, right: mR },
    })
    // @ts-expect-error lastAutoTable is injected by the plugin
    y = (doc.lastAutoTable?.finalY ?? y) + 8
  }

  // ===== RÉSULTAT NET FINAL =====
  if (y > 240) { doc.addPage(); y = 20 }
  doc.setFillColor(...(isPositif ? [220, 252, 231] as [number,number,number] : [254, 226, 226] as [number,number,number]))
  doc.roundedRect(mL, y, pageW - mL - mR, 18, 3, 3, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...(isPositif ? [22, 163, 74] as [number,number,number] : PDF_COLORS.destructive))
  doc.text(
    `Résultat net ${d.mois} ${d.annee} : ${isPositif ? '+' : '-'}${formatAmountFr(Math.abs(resultatNet))} FCFA`,
    pageW / 2,
    y + 11,
    { align: 'center' },
  )

  footer(doc)
  const slug = `${d.mois}-${d.annee}`.toLowerCase().replace(/\s/g, '-')
  doc.save(`rapport-mensuel-${slug}.pdf`)
}

// ============================================================
//  Fiche élève PDF
// ============================================================

export type FicheEleveData = {
  code: string
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  dateNaissance: string
  lieuNaissance: string
  sexe: string
  nationalite: string
  typePiece: string
  numPiece: string
  typePermis: string
  statut: string
  dateInscription: string
  seancesFaites: number
  seancesTotales: number
  moniteur: string
  estParraine: boolean
  parrainNom: string
  seances: Array<{ date: string; heureDebut: string; heureFin: string; moniteur: string; statut: string; notes: string }>
  examens: Array<{ dateExamen: string; typeExamen: string; typePermis: string; inspecteur: string; resultat: string }>
  factures: Array<{ numero: string; formation: string; montant: number; paye: number; reste: number; statut: string; dateEmission: string }>
}

export async function generateFicheElevePdf(d: FicheEleveData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210
  const mL = 14
  const mR = 14

  // ===== EN-TÊTE =====
  doc.setFillColor(...PDF_COLORS.primary)
  doc.rect(0, 0, pageW, 28, 'F')
  const logo = await loadLogoForPdf()
  if (logo) doc.addImage(logo, 'PNG', mL, 5, 18, 18)
  doc.setTextColor(...PDF_COLORS.white)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SARAH AUTO-ECOLE', logo ? 36 : mL, 16)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Auto-Ecole — Formation & Conduite', logo ? 36 : mL, 23)

  // Titre dossier
  doc.setFillColor(...PDF_COLORS.primaryLight)
  doc.rect(0, 28, pageW, 14, 'F')
  doc.setTextColor(...PDF_COLORS.primary)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`DOSSIER ÉLÈVE — ${d.code}`, pageW / 2, 37, { align: 'center' })

  let y = 52

  // ===== IDENTITÉ =====
  const sectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(...PDF_COLORS.primary)
    doc.rect(mL, yPos, pageW - mL - mR, 7, 'F')
    doc.setTextColor(...PDF_COLORS.white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), mL + 3, yPos + 5)
    doc.setTextColor(...PDF_COLORS.foreground)
    return yPos + 11
  }

  const field = (label: string, value: string, x: number, yPos: number, w = 88) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...PDF_COLORS.muted)
    doc.text(label, x, yPos)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_COLORS.foreground)
    doc.text(value || '—', x, yPos + 5, { maxWidth: w })
  }

  y = sectionHeader('Informations personnelles', y)
  field('Nom & Prénom', `${d.prenom} ${d.nom}`, mL, y, 80)
  field('Code dossier', d.code, 108, y, 80)
  y += 13
  field('Date de naissance', d.dateNaissance || '—', mL, y)
  field('Lieu de naissance', d.lieuNaissance || '—', 108, y)
  y += 13
  field('Sexe', d.sexe === 'M' ? 'Masculin' : 'Féminin', mL, y)
  field('Nationalité', d.nationalite || '—', 108, y)
  y += 13
  field('Type de pièce', d.typePiece || '—', mL, y)
  field('Numéro de pièce', d.numPiece || '—', 108, y)
  y += 13
  field('Téléphone', d.telephone, mL, y)
  field('Email', d.email || '—', 108, y)
  y += 13
  field('Adresse', d.adresse || '—', mL, y, 182)
  y += 14

  // ===== FORMATION =====
  y = sectionHeader('Formation & suivi', y)
  field('Type de permis', d.typePermis, mL, y)
  field('Statut', d.statut, 108, y)
  y += 13
  field('Date d\'inscription', d.dateInscription, mL, y)
  field('Moniteur assigné', d.moniteur || 'Non assigné', 108, y)
  y += 13

  // Barre de progression séances
  const pct = d.seancesTotales > 0 ? d.seancesFaites / d.seancesTotales : 0
  const barW = pageW - mL - mR
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...PDF_COLORS.muted)
  doc.text(`Séances : ${d.seancesFaites} / ${d.seancesTotales} (${Math.round(pct * 100)}%)`, mL, y)
  y += 4
  doc.setFillColor(...PDF_COLORS.border)
  doc.roundedRect(mL, y, barW, 5, 2, 2, 'F')
  if (pct > 0) {
    doc.setFillColor(...PDF_COLORS.primary)
    doc.roundedRect(mL, y, barW * pct, 5, 2, 2, 'F')
  }
  y += 12

  if (d.estParraine) {
    field('Parrain / Marraine', d.parrainNom || '—', mL, y, 182)
    y += 13
  }

  // ===== SÉANCES =====
  if (d.seances.length > 0) {
    y = sectionHeader(`Historique des séances (${d.seances.length})`, y)
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Horaire', 'Moniteur', 'Statut']],
      body: d.seances.slice(0, 20).map((s) => [
        s.date || '—',
        s.heureDebut && s.heureFin ? `${s.heureDebut}–${s.heureFin}` : s.heureDebut || '—',
        s.moniteur || '—',
        s.statut,
      ]),
      theme: 'striped',
      styles: { fontSize: 8, textColor: PDF_COLORS.foreground },
      headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: mL, right: mR },
    })
    // @ts-expect-error lastAutoTable is injected by the plugin
    y = (doc.lastAutoTable?.finalY ?? y) + 8
  }

  // ===== EXAMENS =====
  if (d.examens.length > 0) {
    if (y > 230) { doc.addPage(); y = 20 }
    y = sectionHeader(`Examens (${d.examens.length})`, y)
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Type', 'Permis', 'Inspecteur', 'Résultat']],
      body: d.examens.map((e) => [
        e.dateExamen || '—',
        e.typeExamen,
        e.typePermis,
        e.inspecteur || '—',
        e.resultat,
      ]),
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
      margin: { left: mL, right: mR },
    })
    // @ts-expect-error lastAutoTable is injected by the plugin
    y = (doc.lastAutoTable?.finalY ?? y) + 8
  }

  // ===== FINANCIER =====
  if (d.factures.length > 0) {
    if (y > 220) { doc.addPage(); y = 20 }
    y = sectionHeader('Situation financière', y)
    const totalMontant = d.factures.reduce((s, f) => s + f.montant, 0)
    const totalPaye = d.factures.reduce((s, f) => s + f.paye, 0)
    const totalReste = d.factures.reduce((s, f) => s + f.reste, 0)
    autoTable(doc, {
      startY: y,
      head: [['Facture', 'Formation', 'Montant', 'Payé', 'Reste', 'Statut']],
      body: [
        ...d.factures.map((f) => [
          f.numero,
          f.formation || '—',
          formatAmountFr(f.montant),
          formatAmountFr(f.paye),
          formatAmountFr(f.reste),
          f.statut,
        ]),
        ['', 'TOTAL', formatAmountFr(totalMontant), formatAmountFr(totalPaye), formatAmountFr(totalReste), ''],
      ],
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: PDF_COLORS.primary, textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      foot: [],
      margin: { left: mL, right: mR },
    })
    // @ts-expect-error lastAutoTable is injected by the plugin
    y = (doc.lastAutoTable?.finalY ?? y) + 8
  }

  footer(doc)
  doc.save(`fiche-${d.code}.pdf`)
}
