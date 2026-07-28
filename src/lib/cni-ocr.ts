export type TypePieceIdentite = 'CNI' | 'Passeport' | 'Consulaire'

export type CniScanResult = {
  nom: string
  prenom: string
  dateNaissance: string
  numPiece: string
  lieuNaissance: string
  sexe: 'M' | 'F' | ''
  nationalite: string
  typePiece: TypePieceIdentite | ''
  rawText?: string
}

function cleanLine(line: string) {
  return line.replace(/\s+/g, ' ').trim()
}

function toIsoDate(day: string, month: string, year: string) {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function parseDate(text: string): string {
  const labeled = text.match(
    /(?:date\s*(?:de\s*)?naissance|n[ée]\s*le|birth)[:\s]*(\d{2})[/.-](\d{2})[/.-](\d{4})/i,
  )
  if (labeled) return toIsoDate(labeled[1], labeled[2], labeled[3])

  const plain = text.match(/\b(\d{2})[/.-](\d{2})[/.-](\d{4})\b/)
  if (plain) return toIsoDate(plain[1], plain[2], plain[3])

  // MRZ YYMMDD
  const mrz = text.match(/\b(\d{2})(\d{2})(\d{2})[MF<]/i)
  if (mrz) {
    const yy = Number(mrz[1])
    const year = yy >= 30 ? `19${mrz[1]}` : `20${mrz[1]}`
    return toIsoDate(mrz[3], mrz[2], year)
  }

  return ''
}

function parseSexe(text: string): 'M' | 'F' | '' {
  const match = text.match(/sexe[:\s]*(masc|f[ée]m|m|f)\b/i)
  if (match) {
    const value = match[1].toLowerCase()
    if (value.startsWith('f')) return 'F'
    if (value.startsWith('m')) return 'M'
  }
  if (/\bF\b/.test(text) && /sexe/i.test(text)) return 'F'
  if (/\bM\b/.test(text) && /sexe/i.test(text)) return 'M'
  const mrzSex = text.match(/<<[A-Z0-9]*([MF])\d{6}/)
  if (mrzSex) return mrzSex[1] as 'M' | 'F'
  return ''
}

function parseNationalite(text: string): string {
  const match = text.match(/nationalit[ée][:\s]*([A-Za-zÀ-ÿ\- ]{3,})/i)
  if (!match) {
    if (/\bCIV\b|IVOIR/i.test(text)) return 'Ivoirienne'
    return ''
  }
  const value = cleanLine(match[1]).replace(/\s+(sexe|date|lieu).*$/i, '')
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function parseLieuNaissance(text: string): string {
  const match = text.match(
    /(?:lieu\s*(?:de\s*)?naissance|[àa]\s)[:\s]*([A-Za-zÀ-ÿ'\- ]{2,})/i,
  )
  if (!match) return ''
  return cleanLine(match[1]).replace(/\s+(nationalit|sexe|date).*$/i, '')
}

function detectTypePiece(text: string): TypePieceIdentite | '' {
  if (/passeport|passport|P<[A-Z]{3}/i.test(text)) return 'Passeport'
  if (/consulaire|carte\s+consulaire/i.test(text)) return 'Consulaire'
  if (/carte\s+(nationale\s+)?d['']?identit|cni|identity/i.test(text)) return 'CNI'
  if (/P<[A-Z]{3}[A-Z<]+<<|<<[A-Z0-9<]{20,}/.test(text.replace(/\s+/g, ''))) return 'Passeport'
  return ''
}

function parseNumPieceCni(text: string): string {
  const cniLabel = text.match(
    /(?:n[°o]\s*(?:de\s*)?(?:pi[èe]ce|carte|cni)|cni)[:\s-]*([A-Z0-9-]{6,})/i,
  )
  if (cniLabel) return cleanLine(cniLabel[1]).replace(/^CNI-?/i, '')

  const ivorian = text.match(/\b(\d{10,12}[A-Z]?)\b/)
  if (ivorian) return ivorian[1]

  return ''
}

function parseNumPiecePasseport(text: string): string {
  const labeled = text.match(/(?:passeport|passport|n[°o]\s*(?:de\s*)?doc)[:\s]*([A-Z0-9]{6,12})/i)
  if (labeled) return cleanLine(labeled[1])

  // MRZ line 2 starts with passport number
  const compact = text.replace(/\s+/g, '')
  const mrz = compact.match(/P[A-Z<]{1}[A-Z]{3}[A-Z<]+<<[A-Z<]+/)
  if (mrz) {
    const line2 = compact.match(/([A-Z0-9]{8,9})[0-9][A-Z]{3}/)
    if (line2) return line2[1].replace(/</g, '')
  }

  const generic = text.match(/\b([A-Z]{1,2}\d{6,9})\b/)
  return generic ? generic[1] : ''
}

function parseNumPieceConsulaire(text: string): string {
  const labeled = text.match(
    /(?:n[°o]\s*(?:de\s*)?(?:carte|pi[èe]ce)|consulaire)[:\s-]*([A-Z0-9/-]{6,})/i,
  )
  if (labeled) return cleanLine(labeled[1])
  const generic = text.match(/\b([A-Z]{0,3}\d{6,}[A-Z0-9-]*)\b/)
  return generic ? generic[1] : ''
}

function parseNomPrenomFromMrz(text: string): Pick<CniScanResult, 'nom' | 'prenom'> {
  const compact = text.replace(/\s+/g, '\n')
  const line = compact.match(/P[A-Z<][A-Z]{3}([A-Z<]+)/)
  if (!line) return { nom: '', prenom: '' }
  const parts = line[1].split('<<').filter(Boolean)
  const nom = (parts[0] ?? '').replace(/</g, ' ').trim()
  const prenom = (parts[1] ?? '').replace(/</g, ' ').trim().split(/\s+/)[0] ?? ''
  return {
    nom: nom ? nom.charAt(0) + nom.slice(1).toLowerCase() : '',
    prenom: prenom ? prenom.charAt(0) + prenom.slice(1).toLowerCase() : '',
  }
}

function parseNomPrenom(text: string): Pick<CniScanResult, 'nom' | 'prenom'> {
  const nomLabel = text.match(/nom[:\s]+([A-ZÀ-ÿ'\- ]{2,})/i)
  const prenomLabel = text.match(/pr[ée]noms?[:\s]+([A-ZÀ-ÿ'\- ]{2,})/i)
  if (nomLabel || prenomLabel) {
    return {
      nom: nomLabel ? cleanLine(nomLabel[1]).split(/\s+(?:pr[ée]nom|date|sexe)/i)[0] : '',
      prenom: prenomLabel ? cleanLine(prenomLabel[1]).split(/\s+(?:nom|date|sexe)/i)[0] : '',
    }
  }

  const mrzNames = parseNomPrenomFromMrz(text)
  if (mrzNames.nom || mrzNames.prenom) return mrzNames

  const lines = text
    .split('\n')
    .map(cleanLine)
    .filter((line) => line.length >= 2)
    .filter((line) => !/^(republique|c[ôo]te|carte|identit|nationalit|sexe|date|n[°o]|passeport|passport)/i.test(line))
    .filter((line) => /^[A-Za-zÀ-ÿ'\-\s]{3,}$/.test(line))

  if (lines.length >= 2) {
    return { prenom: lines[0].split(/\s+/)[0] ?? '', nom: lines[1] }
  }

  if (lines.length === 1) {
    const parts = lines[0].split(/\s+/)
    if (parts.length >= 2) {
      return { prenom: parts[0], nom: parts.slice(1).join(' ') }
    }
  }

  return { nom: '', prenom: '' }
}

export function parseIdentityDocumentText(text: string): CniScanResult {
  const normalized = text.replace(/\r/g, '\n')
  const typePiece = detectTypePiece(normalized)
  const { nom, prenom } = parseNomPrenom(normalized)

  let numPiece = ''
  if (typePiece === 'Passeport') numPiece = parseNumPiecePasseport(normalized)
  else if (typePiece === 'Consulaire') numPiece = parseNumPieceConsulaire(normalized)
  else numPiece = parseNumPieceCni(normalized) || parseNumPieceConsulaire(normalized)

  return {
    nom,
    prenom,
    dateNaissance: parseDate(normalized),
    numPiece,
    lieuNaissance: parseLieuNaissance(normalized),
    sexe: parseSexe(normalized),
    nationalite: parseNationalite(normalized),
    typePiece: typePiece || (numPiece ? 'CNI' : ''),
    rawText: normalized,
  }
}

/** @deprecated use parseIdentityDocumentText */
export function parseCniText(text: string): CniScanResult {
  return parseIdentityDocumentText(text)
}

export function hasUsefulCniData(result: Partial<CniScanResult>) {
  return Boolean(result.nom || result.prenom || result.dateNaissance || result.numPiece)
}

/** Mapping OCR → champs formulaire dossier élève. */
export const OCR_TO_ELEVE_FIELDS = {
  nom: 'nom',
  prenom: 'prenom',
  dateNaissance: 'dateNaissance',
  numPiece: 'numPiece',
  typePiece: 'typePiece',
  lieuNaissance: 'lieuNaissance',
  sexe: 'sexe',
  nationalite: 'nationalite',
} as const

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Deskew approximatif via moments (lignes sombres) — no-op si angle trop faible. */
function estimateSkewDegrees(data: Uint8ClampedArray, width: number, height: number): number {
  let sumX = 0
  let sumY = 0
  let count = 0
  const step = Math.max(1, Math.floor(Math.min(width, height) / 200))
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      if (data[i] < 90) {
        sumX += x
        sumY += y
        count++
      }
    }
  }
  if (count < 50) return 0
  // Heuristique légère : pas de vraie régression → retour 0 (évite artefacts)
  void sumX
  void sumY
  return 0
}

export function preprocessCniCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const maxSide = 2000
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height))
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))

  const target = document.createElement('canvas')
  target.width = w
  target.height = h
  const ctx = target.getContext('2d')
  if (!ctx) return source

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(source, 0, 0, w, h)

  const imageData = ctx.getImageData(0, 0, w, h)
  const { data } = imageData

  // Auto-niveaux : contraste adaptatif
  let min = 255
  let max = 0
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    if (gray < min) min = gray
    if (gray > max) max = gray
  }
  const range = Math.max(1, max - min)
  const skew = estimateSkewDegrees(data, w, h)
  void skew

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const normalized = ((gray - min) / range) * 255
    const contrast = clamp((normalized - 128) * 1.45 + 128, 0, 255)
    // Seuillage soft (conserve les niveaux intermédiaires pour Tesseract)
    const value = contrast > 170 ? 255 : contrast < 85 ? 0 : contrast
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }

  ctx.putImageData(imageData, 0, 0)
  return target
}

export function captureVideoFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const vw = video.videoWidth || 640
  const vh = video.videoHeight || 480
  const cropW = Math.floor(vw * 0.92)
  const cropH = Math.floor(vh * 0.7)
  const sx = Math.floor((vw - cropW) / 2)
  const sy = Math.floor((vh - cropH) / 2)

  const canvas = document.createElement('canvas')
  canvas.width = cropW
  canvas.height = cropH
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH)
  return canvas
}

export async function canvasFromFile(file: File): Promise<HTMLCanvasElement> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Image illisible'))
      img.src = objectUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas indisponible')
    ctx.drawImage(image, 0, 0)
    return canvas
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
