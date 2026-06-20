'use client'

import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ViewHeader,
  StatusBadge,
  ActionButton,
  Card,
  formatXOF,
  initials,
} from './shared'
import { profiles, permis, formations, type Role } from '@/lib/mock-data'

const roleTone: Record<Role, 'primary' | 'sky' | 'amber' | 'slate'> = {
  'Administrateur principal': 'primary',
  'Administrateur secondaire': 'primary',
  Comptable: 'sky',
  Moniteur: 'amber',
  Conseiller: 'slate',
}

function Field({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex h-10 items-center gap-2.5 rounded-lg border border-input bg-muted/40 px-3 text-sm text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}

export function ParametresView() {
  return (
    <>
      <ViewHeader
        title="Paramètres"
        description="Configuration de l'ERP et gestion de l'équipe"
      />

      <Tabs defaultValue="profil" className="mt-2">
        <TabsList>
          <TabsTrigger value="profil">Mon profil</TabsTrigger>
          <TabsTrigger value="equipe">Équipe</TabsTrigger>
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
        </TabsList>

        {/* -------- Tab 1 : Mon profil -------- */}
        <TabsContent value="profil">
          <Card>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 sm:w-48">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  AD
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Aïcha Diallo</p>
                  <p className="text-xs text-muted-foreground">a.diallo@sarahauto.ci</p>
                </div>
                <StatusBadge label="Admin Principal" tone="primary" />
              </div>

              {/* Form */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nom complet" value="Aïcha Diallo" />
                  <Field label="Email" value="a.diallo@sarahauto.ci" icon={<Mail className="h-4 w-4" />} />
                  <Field label="Rôle" value="Admin Principal" />
                  <Field label="Téléphone" value="+225 07 00 00 00" icon={<Phone className="h-4 w-4" />} />
                  <Field label="Auto-école" value="SARAH AUTO" icon={<Building2 className="h-4 w-4" />} />
                  <Field
                    label="Adresse"
                    value="Cocody, Abidjan, Côte d'Ivoire"
                    icon={<MapPin className="h-4 w-4" />}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <ActionButton variant="primary">
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </ActionButton>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* -------- Tab 2 : Équipe -------- */}
        <TabsContent value="equipe">
          <Card className="p-0">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Utilisateurs de l'équipe</h2>
                <p className="text-sm text-muted-foreground">
                  {profiles.length} membres — {profiles.filter((p) => p.actif).length} actifs
                </p>
              </div>
              <ActionButton variant="primary">
                <UserPlus className="h-4 w-4" />
                Ajouter un utilisateur
              </ActionButton>
            </div>

            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilisateur</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rôle</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(p.name)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={p.role} tone={roleTone[p.role]} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={p.actif ? 'Actif' : 'Inactif'}
                          tone={p.actif ? 'emerald' : 'slate'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Modifier">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Plus">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* -------- Tab 3 : Catalogue -------- */}
        <TabsContent value="catalogue">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Types de permis */}
            <Card className="xl:col-span-1">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Types de permis</h2>
                <p className="text-sm text-muted-foreground">{permis.length} types disponibles</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {permis.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-3"
                  >
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-md bg-primary/10 px-2 text-base font-bold text-primary">
                      {p.code}
                    </span>
                    <span className="text-sm font-medium text-foreground">{p.libelle}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Formations */}
            <Card className="p-0 xl:col-span-2">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Formations</h2>
                  <p className="text-sm text-muted-foreground">Catalogue des packs proposés</p>
                </div>
                <ActionButton variant="primary">
                  <Plus className="h-4 w-4" />
                  Nouvelle formation
                </ActionButton>
              </div>

              <div className="custom-scrollbar overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prix</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {formations.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{f.nom}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{f.description}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                          {formatXOF(f.prix)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={f.actif ? 'Actif' : 'Inactif'}
                            tone={f.actif ? 'emerald' : 'slate'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Modifier">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
