'use client'

import { MessageCircle, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type FactureImpayee = {
  numero: string
  eleve: string
  telephone: string
  montant: string
  echeance: string
  retard: string
}

const factures: FactureImpayee[] = [
  {
    numero: 'FAC-2026-0142',
    eleve: 'Ibrahim Cissé',
    telephone: '+225 07 12 34 56',
    montant: '120 000 F',
    echeance: '15 Nov 2026',
    retard: '16 jours',
  },
  {
    numero: 'FAC-2026-0138',
    eleve: 'Sékou Camara',
    telephone: '+225 05 98 76 54',
    montant: '80 000 F',
    echeance: '10 Nov 2026',
    retard: '21 jours',
  },
  {
    numero: 'FAC-2026-0135',
    eleve: 'Awa Diop',
    telephone: '+225 01 23 45 67',
    montant: '350 000 F',
    echeance: '05 Nov 2026',
    retard: '26 jours',
  },
  {
    numero: 'FAC-2026-0129',
    eleve: 'Mariam Touré',
    telephone: '+225 07 44 55 66',
    montant: '240 000 F',
    echeance: '28 Oct 2026',
    retard: '34 jours',
  },
  {
    numero: 'FAC-2026-0124',
    eleve: 'Cheikh Fall',
    telephone: '+225 05 77 88 99',
    montant: '450 000 F',
    echeance: '20 Oct 2026',
    retard: '42 jours',
  },
]

export function UnpaidInvoices() {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Relances impayés</h2>
            <p className="text-sm text-muted-foreground">
              Rappels WhatsApp en un clic pour les factures en attente
            </p>
          </div>
        </div>
        <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Send className="h-4 w-4" />
          Tout relancer
        </button>
      </div>

      {/* List */}
      <div className="custom-scrollbar max-h-[380px] divide-y divide-border overflow-y-auto">
        {factures.map((facture) => (
          <div
            key={facture.numero}
            className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {facture.eleve
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {facture.eleve}
                </p>
                <p className="text-xs text-muted-foreground">
                  {facture.numero} · {facture.telephone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{facture.montant}</p>
                <p
                  className={cn(
                    'text-xs font-medium',
                    parseInt(facture.retard) > 30
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  )}
                >
                  Retard : {facture.retard}
                </p>
              </div>
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white"
                title={`Relancer ${facture.eleve} par WhatsApp`}
                aria-label={`Relancer ${facture.eleve} par WhatsApp`}
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Total à recouvrer :{' '}
          <span className="font-bold text-foreground">1 240 000 F</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {factures.length} factures impayées
        </p>
      </div>
    </div>
  )
}
