'use client'

import { useRef, useState } from 'react'
import { Camera, ScanLine, UserPlus, CheckCircle2, Loader2, Info, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { ViewHeader, Card } from '@/components/dashboard/views/shared'
import { Field, FormInput, FormSelect } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'
import { inscrireEleveAvecFacture } from '@/lib/inscription'
import { uploadMediaFromDataUrl } from '@/lib/supabase/storage'
import { useCniScanner, type CniScanResult } from '@/hooks/use-cni-scanner'
import { PERMIS_CATEGORIES } from '@/lib/domain/types'

function applyScanResult(
  parsed: Partial<CniScanResult>,
  setters: {
    setNom: (v: string) => void
    setPrenom: (v: string) => void
    setDateNaissance: (v: string) => void
    setNumPiece: (v: string) => void
    setLieuNaissance: (v: string) => void
    setSexe: (v: 'M' | 'F') => void
    setNationalite: (v: string) => void
    setTypePiece: (v: 'CNI' | 'Passeport') => void
  },
) {
  if (parsed.nom) setters.setNom(parsed.nom)
  if (parsed.prenom) setters.setPrenom(parsed.prenom)
  if (parsed.dateNaissance) setters.setDateNaissance(parsed.dateNaissance)
  if (parsed.numPiece) setters.setNumPiece(parsed.numPiece)
  if (parsed.lieuNaissance) setters.setLieuNaissance(parsed.lieuNaissance)
  if (parsed.sexe === 'M' || parsed.sexe === 'F') setters.setSexe(parsed.sexe)
  if (parsed.nationalite) setters.setNationalite(parsed.nationalite)
  if (parsed.numPiece) setters.setTypePiece('CNI')
}

export function ScannerCniView() {
  const addEleve = useDataStore((s) => s.addEleve)
  const updateEleve = useDataStore((s) => s.updateEleve)
  const formations = useDataStore((s) => s.formations)
  const permis = useDataStore((s) => s.permis)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    videoRef,
    status,
    error,
    progress,
    previewUrl,
    hasUsefulCniData,
    startCamera,
    stopCamera,
    captureAndScan,
    scanFromFile,
  } = useCniScanner()

  const [scanned, setScanned] = useState(false)
  const [creating, setCreating] = useState(false)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [lieuNaissance, setLieuNaissance] = useState('')
  const [numPiece, setNumPiece] = useState('')
  const [typePiece, setTypePiece] = useState<'CNI' | 'Passeport'>('CNI')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [typePermis, setTypePermis] = useState('B')
  const [sexe, setSexe] = useState<'M' | 'F'>('M')
  const [nationalite, setNationalite] = useState('Ivoirienne')
  const [formationId, setFormationId] = useState('')

  const isProcessing = status === 'processing'
  const cameraActive = status === 'camera' || status === 'processing' || status === 'done'
  const formationsActives = formations.filter((f) => f.actif)

  const setters = {
    setNom,
    setPrenom,
    setDateNaissance,
    setNumPiece,
    setLieuNaissance,
    setSexe,
    setNationalite,
    setTypePiece,
  }

  const handleScanResult = (parsed: Partial<CniScanResult>) => {
    applyScanResult(parsed, setters)
    setScanned(true)
    if (!hasUsefulCniData(parsed)) {
      toast.warning('OCR partiel — complétez les champs manuellement')
    } else {
      toast.success('Données extraites — vérifiez avant validation')
    }
  }

  const handleScanner = async () => {
    const parsed = await captureAndScan()
    handleScanResult(parsed)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const parsed = await scanFromFile(file)
    handleScanResult(parsed)
  }

  const resetScan = () => {
    stopCamera()
    setScanned(false)
    setNom('')
    setPrenom('')
    setDateNaissance('')
    setLieuNaissance('')
    setNumPiece('')
    setTelephone('')
    setEmail('')
    setAdresse('')
    setNationalite('Ivoirienne')
    setTypePermis('B')
    setSexe('M')
    setTypePiece('CNI')
    setFormationId('')
  }

  const handleCreerEleve = async () => {
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner au moins le nom, le prénom et le téléphone')
      return
    }
    if (!formationId) {
      toast.error('Veuillez sélectionner une formation')
      return
    }

    setCreating(true)
    try {
      const newEleve = addEleve({
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        adresse: adresse.trim(),
        dateNaissance,
        lieuNaissance: lieuNaissance.trim(),
        sexe,
        nationalite: nationalite.trim() || 'Ivoirienne',
        typePiece,
        numPiece: numPiece.trim(),
        typePermis,
      })

      if (previewUrl) {
        try {
          const photoCni = await uploadMediaFromDataUrl('cni', `${newEleve.id}/scan.jpg`, previewUrl)
          updateEleve(newEleve.id, { photoCni })
        } catch {
          updateEleve(newEleve.id, { photoCni: previewUrl })
        }
      }

      await inscrireEleveAvecFacture(useDataStore.getState(), newEleve.id, formationId)
      toast.success('Élève créé et facture émise')
      if (newEleve.code) {
        useNavStore.getState().setselectedEleveCode(newEleve.code)
        setActiveView('eleve-detail')
      } else {
        resetScan()
        setActiveView('eleves')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de créer l\'élève')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <ViewHeader
        title="Scanner CNI"
        description="Extraction OCR (Tesseract.js) depuis la webcam — saisie manuelle possible"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Scanner la pièce d&apos;identité</h2>
              <p className="text-xs text-muted-foreground">Webcam ou import photo — cadrez la CNI au centre</p>
            </div>
            {scanned && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Données extraites
              </span>
            )}
          </div>

          <div
            className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted ${
              cameraActive ? 'border-primary/60' : 'border-border'
            }`}
          >
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover ${cameraActive && !previewUrl ? 'block' : 'hidden'}`}
              playsInline
              muted
            />

            {previewUrl && !isProcessing && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Aperçu CNI scannée" className="absolute inset-0 h-full w-full object-contain bg-black/80" />
            )}

            {cameraActive && !previewUrl && (
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-primary/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)_inset]">
                <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-primary" />
                <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-primary" />
                <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-primary" />
              </div>
            )}

            {isProcessing ? (
              <div className="relative z-10 flex flex-col items-center gap-3 rounded-xl bg-background/90 px-6 py-5 text-primary">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm font-medium">{progress ?? 'Extraction OCR en cours…'}</p>
              </div>
            ) : !cameraActive && !previewUrl ? (
              <div className="flex flex-col items-center gap-2 px-6 text-center text-muted-foreground">
                <Camera className="h-10 w-10" />
                <p className="text-sm font-medium">Caméra inactive</p>
                <p className="text-xs">Activez la webcam ou importez une photo de la CNI</p>
              </div>
            ) : null}
          </div>

          {error && <p className="mt-2 text-xs text-warning">{error}</p>}
          {progress && !isProcessing && (
            <p className="mt-2 text-xs text-muted-foreground">{progress}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
          />

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void startCamera()}
              disabled={isProcessing}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
              {cameraActive ? 'Relancer la caméra' : 'Activer la caméra'}
            </button>
            <button
              type="button"
              onClick={() => void handleScanner()}
              disabled={!cameraActive || isProcessing}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ScanLine className="h-4 w-4" />
              Scanner
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 sm:col-span-2"
            >
              <Upload className="h-4 w-4" />
              Importer une photo
            </button>
            {cameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                disabled={isProcessing}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50 sm:col-span-2"
              >
                <X className="h-4 w-4" />
                Arrêter la caméra
              </button>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-secondary-foreground/30 bg-secondary p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Tesseract.js analyse la CNI localement dans le navigateur. Placez la carte dans le cadre,
              avec un bon éclairage. Si l&apos;OCR échoue, complétez les champs à droite manuellement.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Fiche élève</h2>
              <p className="text-xs text-muted-foreground">Vérifiez, complétez et créez l&apos;inscription</p>
            </div>
            <button
              type="button"
              onClick={resetScan}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nom" required>
              <FormInput value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Barry" />
            </Field>
            <Field label="Prénom" required>
              <FormInput value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Mody" />
            </Field>
            <Field label="Date de naissance">
              <FormInput type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
            </Field>
            <Field label="Lieu de naissance">
              <FormInput value={lieuNaissance} onChange={(e) => setLieuNaissance(e.target.value)} placeholder="Abidjan" />
            </Field>
            <Field label="Sexe">
              <FormSelect value={sexe} onChange={(e) => setSexe(e.target.value as 'M' | 'F')}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </FormSelect>
            </Field>
            <Field label="Nationalité">
              <FormInput value={nationalite} onChange={(e) => setNationalite(e.target.value)} placeholder="Ivoirienne" />
            </Field>
            <Field label="Type de pièce">
              <FormSelect value={typePiece} onChange={(e) => setTypePiece(e.target.value as 'CNI' | 'Passeport')}>
                <option value="CNI">CNI</option>
                <option value="Passeport">Passeport</option>
              </FormSelect>
            </Field>
            <Field label="Numéro de pièce">
              <FormInput value={numPiece} onChange={(e) => setNumPiece(e.target.value)} className="font-mono text-sm" placeholder="7512145782V" />
            </Field>
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Téléphone" required>
              <FormInput value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 12 34 56" />
            </Field>
            <Field label="Email">
              <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" />
            </Field>
            <Field label="Adresse" className="sm:col-span-2">
              <FormInput value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Cocody, Abidjan" />
            </Field>
            <Field label="Formation" required>
              <FormSelect value={formationId} onChange={(e) => setFormationId(e.target.value)}>
                <option value="">Sélectionner une formation</option>
                {formationsActives.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom} — {f.prix.toLocaleString('fr-FR')} F
                  </option>
                ))}
              </FormSelect>
            </Field>
            <Field label="Type de permis">
              <FormSelect value={typePermis} onChange={(e) => setTypePermis(e.target.value)}>
                {(permis.length > 0 ? permis : PERMIS_CATEGORIES).map((p) => (
                  <option key={p.code} value={p.code}>{p.code} — {p.libelle}</option>
                ))}
              </FormSelect>
            </Field>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Le code dossier est généré automatiquement. Une facture est émise dès l&apos;inscription à la formation.
          </p>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => void handleCreerEleve()}
              disabled={creating}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {creating ? 'Création…' : 'Créer l\'élève'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
