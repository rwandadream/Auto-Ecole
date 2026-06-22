'use client'

import { useMemo } from 'react'
import { MessageCircle, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/store/data-store'
import { formatXOF } from '@/components/dashboard/views/shared'
import { relanceWhatsApp, messageRelanceFacture } from '@/lib/utils-docs'
import { parseFlexibleDate } from '@/lib/stats'

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export function UnpaidInvoices() {
  const allFactures = useDataStore((s) => s.factures)
  const eleves = useDataStore((s) => s.eleves)

  const facturesImpayees = useMemo(
    () => allFactures.filter((f) => f.statut === 'Impayée' || f.statut === 'Non payée'),
    [allFactures]
  )

  const rows = useMemo(
    () =>
      facturesImpayees.map((f) => {
        const eleve = eleves.find((e) => e.code === f.eleveCode)
        const dEmit = parseFlexibleDate(f.dateEmission)
        const retard = dEmit ? daysBetween(dEmit, new Date()) : 0
        return {
          id: f.id,
          numero: f.numero,
          eleveNom: f.eleve,
          telephone: eleve?.telephone ?? '',
          montant: f.reste,
          echeance: f.dateEmission,
          retard,
          // For relance message
          prenom: eleve?.prenom ?? '',
          nom: eleve?.nom ?? '',
        }
      }),
    [facturesImpayees, eleves]
  )

  const totalRecouvrer = rows.reduce((sum, r) => sum + r.montant, 0)

  const handleRelance = (row: (typeof rows)[number]) => {
    if (!row.telephone) return
    const message = messageRelanceFacture({
      prenom: row.prenom,
      nom: row.nom,
      numeroFacture: row.numero,
      reste: row.montant,
      telephone: row.telephone,
    })
    relanceWhatsApp(row.telephone, message)
  }

  const handleToutRelancer = () => {
    rows.forEach((row, idx) => {
      if (!row.telephone) return
      setTimeout(() => handleRelance(row), idx * 400)
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Relances impayés</h2>
            <p className="text-sm text-muted-foreground">
              Rappels WhatsApp en un clic pour les factures en attente
            </p>
          </div>
        </div>
        <button
          onClick={handleToutRelancer}
          disabled={rows.length === 0}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          Tout relancer
        </button>
      </div>

      {/* List */}
      <div className="custom-scrollbar max-h-[380px] divide-y divide-border overflow-y-auto">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Aucune facture impayée
            </p>
            <p className="text-xs text-muted-foreground">
              Tous les élèves sont à jour de leurs paiements.
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {row.eleveNom
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {row.eleveNom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.numero} · {row.telephone || 'Téléphone non renseigné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatXOF(row.montant)}</p>
                  <p
                    className={cn(
                      'text-xs font-medium',
                      row.retard > 30 ? 'text-destructive' : 'text-warning'
                    )}
                  >
                    Retard : {row.retard} jours
                  </p>
                </div>
                <button
                  onClick={() => handleRelance(row)}
                  disabled={!row.telephone}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success transition-colors hover:bg-success hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  title={`Relancer ${row.eleveNom} par WhatsApp`}
                  aria-label={`Relancer ${row.eleveNom} par WhatsApp`}
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Total à recouvrer :{' '}
          <span className="font-bold text-foreground">{formatXOF(totalRecouvrer)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {rows.length} factures impayées
        </p>
      </div>
    </div>
  )
}
