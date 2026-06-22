export type CniScanResult = {
  nom: string
  prenom: string
  dateNaissance: string
  numPiece: string
  lieuNaissance: string
  sexe: 'M' | 'F' | ''
  nationalite: string
}

function cleanLine(line: string) {
  return line.replace(/\s+/g, ' ').trim()
}

function toIsoDate(day: string, month: string, year: string) {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function parseDate(text: string): string {
  const labeled = text.match(
    /(?:date\s*(?:de\s*)?naissance|n[ée]\s*le)[:\s]*(\d{2})[/.-](\d{2})[/.-](\d{4})/i,
  )
  if (labeled) return toIsoDate(labeled[1], labeled[2], labeled[3])

  const plain = text.match(/\b(\d{2})[/.-](\d{2})[/.-](\d{4})\b/)
  if (plain) return toIsoDate(plain[1], plain[2], plain[3])

  return ''
}

function parseSexe(text: string): 'M' | 'F' | '' {
  const match = text.match(/sexe[:\s]*(masc|f[ée]m|m|f)\b/i)
  if (!match) return ''
  const value = match[1].toLowerCase()
  if (value.startsWith('f')) return 'F'
  if (value.startsWith('m')) return 'M'
  return ''
}

function parseNationalite(text: string): string {
  const match = text.match(/nationalit[ée][:\s]*([A-Za-zÀ-ÿ\- ]{3,})/i)
  if (!match) return ''
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

function parseNumPiece(text: string): string {
  const cniLabel = text.match(/(?:n[°o]\s*(?:de\s*)?(?:pi[èe]ce|carte|cni)|cni)[:\s-]*([A-Z0-9-]{6,})/i)
  if (cniLabel) return cleanLine(cniLabel[1]).replace(/^CNI-?/i, 'CNI-')

  const ivorian = text.match(/\b(\d{10,12}[A-Z]?)\b/)
  if (ivorian) return ivorian[1]

  return ''
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

  const lines = text
    .split('\n')
    .map(cleanLine)
    .filter((line) => line.length >= 2)
    .filter((line) => !/^(republique|c[ôo]te|carte|identit|nationalit|sexe|date|n[°o])/i.test(line))
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

export function parseCniText(text: string): CniScanResult {
  const normalized = text.replace(/\r/g, '\n')
  const { nom, prenom } = parseNomPrenom(normalized)

  return {
    nom,
    prenom,
    dateNaissance: parseDate(normalized),
    numPiece: parseNumPiece(normalized),
    lieuNaissance: parseLieuNaissance(normalized),
    sexe: parseSexe(normalized),
    nationalite: parseNationalite(normalized),
  }
}

export function hasUsefulCniData(result: Partial<CniScanResult>) {
  return Boolean(result.nom || result.prenom || result.dateNaissance || result.numPiece)
}

export function preprocessCniCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const target = document.createElement('canvas')
  const scale = Math.min(1, 1600 / Math.max(source.width, source.height))
  target.width = Math.max(1, Math.round(source.width * scale))
  target.height = Math.max(1, Math.round(source.height * scale))

  const ctx = target.getContext('2d')
  if (!ctx) return source

  ctx.drawImage(source, 0, 0, target.width, target.height)
  const imageData = ctx.getImageData(0, 0, target.width, target.height)
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const contrast = Math.min(255, Math.max(0, (gray - 128) * 1.35 + 128))
    const value = contrast > 155 ? 255 : contrast < 95 ? 0 : contrast
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
  const cropW = Math.floor(vw * 0.82)
  const cropH = Math.floor(vh * 0.52)
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
