'use client'

import { useState, useRef } from 'react'
import { Camera, ScanLine, UserPlus, CheckCircle2, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewHeader, Card } from '@/components/dashboard/views/shared'
import { useDataStore } from '@/store/data-store'
import { useNavStore } from '@/store/nav-store'

export function ScannerCniView() {
  const addEleve = useDataStore((s) => s.addEleve)
  const setActiveView = useNavStore((s) => s.setActiveView)

  const [cameraActive, setCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  // Champs extraits (lecture seule après scan)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [numPiece, setNumPiece] = useState('')
  const [typePiece, setTypePiece] = useState<'CNI' | 'Passeport'>('CNI')

  // Champs éditables
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [typePermis, setTypePermis] = useState<'A' | 'B' | 'AB'>('B')
  const [nationalite, setNationalite] = useState('')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleActiverCamera = () => {
    setCameraActive(true)
  }

  const handleScanner = () => {
    if (!cameraActive || isScanning) return
    setIsScanning(true)
    timerRef.current = setTimeout(() => {
      // Données extraites simulées
      setNom('Brou')
      setPrenom('Koffi')
      setDateNaissance('1996-03-15')
      setNumPiece('CNI-556677-A')
      setTypePiece('CNI')
      setScanned(true)
      setIsScanning(false)
    }, 1500)
  }

  const resetScan = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setScanned(false)
    setIsScanning(false)
    setNom('')
    setPrenom('')
    setDateNaissance('')
    setNumPiece('')
    setTelephone('')
    setEmail('')
    setNationalite('')
    setTypePermis('B')
    setTypePiece('CNI')
  }

  const handleCreerEleve = () => {
    // Validation des champs obligatoires
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner au moins le nom, le prénom et le téléphone')
      return
    }
    addEleve({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      dateNaissance,
      nationalite: nationalite.trim() || 'Ivoirienne',
      typePiece,
      numPiece,
      typePermis,
    })
    toast.success('Élève créé avec succès')
    resetScan()
    setActiveView('eleves')
  }

  return (
    <div>
      <ViewHeader
        title="Scanner CNI"
        description="Extraction automatique des données élève par OCR depuis la webcam"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT — Scanner */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Scanner la pièce d'identité</h2>
              <p className="text-xs text-muted-foreground">Positionnez la CNI face caméra</p>
            </div>
            {scanned && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Données extraites
              </span>
            )}
          </div>

          {/* Webcam preview area */}
          <div
            className={`relative flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed bg-muted transition-colors ${
              cameraActive ? 'border-primary/60' : 'border-border'
            }`}
          >
            {isScanning ? (
              <div className="flex flex-col items-center gap-3 text-primary">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm font-medium">Extraction OCR en cours…</p>
              </div>
            ) : cameraActive ? (
              <div className="flex flex-col items-center gap-2 text-primary">
                <Camera className="h-10 w-10" />
                <p className="text-sm font-medium">Caméra active — prête à scanner</p>
                <div className="absolute inset-4 rounded-lg border-2 border-primary/40" aria-hidden />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-10 w-10" />
                <p className="text-sm font-medium">Caméra inactive</p>
              </div>
            )}

            {/* Scan line animation when scanning */}
            {isScanning && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute left-0 right-0 h-0.5 bg-primary/70 shadow-[0_0_12px_2px] shadow-primary/50 animate-[scan_1.5s_ease-in-out_infinite]" style={{ top: '50%' }} />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleActiverCamera}
              disabled={cameraActive}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
              {cameraActive ? 'Caméra activée' : 'Activer la caméra'}
            </button>
            <button
              onClick={handleScanner}
              disabled={!cameraActive || isScanning}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scan…
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4" />
                  Scanner
                </>
              )}
            </button>
          </div>

          {/* Note box */}
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              L'IA extrait automatiquement le <span className="font-semibold text-foreground">Nom</span>,{' '}
              <span className="font-semibold text-foreground">Prénom</span> et{' '}
              <span className="font-semibold text-foreground">Date de naissance</span> depuis la CNI scannée.
            </p>
          </div>
        </Card>

        {/* RIGHT — Extracted data + form */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Données extraites — Pré-remplissage</h2>
              <p className="text-xs text-muted-foreground">
                {scanned ? 'Vérifiez puis complétez les champs ci-dessous' : 'En attente du scan…'}
              </p>
            </div>
            {scanned && (
              <button
                onClick={resetScan}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Extracted (read-only) fields */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nom
              </label>
              <Input
                value={nom}
                readOnly
                placeholder="En attente du scan..."
                className="bg-muted/50 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prénom
              </label>
              <Input
                value={prenom}
                readOnly
                placeholder="En attente du scan..."
                className="bg-muted/50 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date de naissance
              </label>
              <Input
                type="text"
                value={dateNaissance}
                readOnly
                placeholder="En attente du scan..."
                className="bg-muted/50 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Numéro de pièce
              </label>
              <Input
                value={numPiece}
                readOnly
                placeholder="En attente du scan..."
                className="bg-muted/50 font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Type de pièce
              </label>
              <Select value={typePiece} onValueChange={(v: 'CNI' | 'Passeport') => setTypePiece(v)} disabled={!scanned}>
                <SelectTrigger className="w-full" disabled={!scanned}>
                  <SelectValue placeholder="En attente du scan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNI">CNI</SelectItem>
                  <SelectItem value="Passeport">Passeport</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Compléter la fiche
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Téléphone
              </label>
              <Input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+225 ..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Type de permis
              </label>
              <Select value={typePermis} onValueChange={(v: 'A' | 'B' | 'AB') => setTypePermis(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A — Moto</SelectItem>
                  <SelectItem value="B">B — Voiture</SelectItem>
                  <SelectItem value="AB">AB — Moto + Voiture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nationalité
              </label>
              <Input
                value={nationalite}
                onChange={(e) => setNationalite(e.target.value)}
                placeholder="Ivoirienne"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={handleCreerEleve}
              disabled={!scanned}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Créer l'élève
            </button>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}
