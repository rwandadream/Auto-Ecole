'use client'

import { LogOut, ArrowLeft } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { ViewHeader, ActionButton } from './shared'

export function DeconnexionView() {
  const setActiveView = useNavStore((s) => s.setActiveView)

  return (
    <>
      <ViewHeader
        title="Déconnexion"
        description="Vous êtes sur le point de quitter votre session SARAH AUTO"
      />
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <LogOut className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Confirmer la déconnexion
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vous devrez vous reconnecter avec votre email et mot de passe pour accéder
            à nouveau à l'ERP.
          </p>
          <div className="mt-6 flex gap-3">
            <ActionButton variant="outline" onClick={() => setActiveView('dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </ActionButton>
            <ActionButton>
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </ActionButton>
          </div>
        </div>
      </div>
    </>
  )
}
