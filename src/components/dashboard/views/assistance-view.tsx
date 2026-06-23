'use client'

import { useState } from 'react'
import {
  BookOpen,
  PlayCircle,
  Mail,
  Phone,
  LifeBuoy,
} from 'lucide-react'
import {
  Card,
} from './shared'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useDataStore } from '@/store/data-store'

const helpTopics = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Guide de démarrage',
    description: "Apprenez les bases de l'ERP et configurez votre auto-école en quelques minutes.",
    tone: 'bg-primary/10 text-primary',
    content:
      "1. Connectez-vous avec votre email staff (comptes seedés en base, mot de passe initial Sarah2026!). 2. Créez un élève via « Élèves » ou « Scanner CNI » en choisissant une formation — la facture est générée automatiquement. 3. Planifiez des séances dans « Planning » (conflits moniteur/véhicule détectés). 4. Encaissez les paiements dans « Facturation ».",
  },
  {
    icon: <PlayCircle className="h-6 w-6" />,
    title: 'Modules principaux',
    description: 'Parcours rapide : élèves, planning, examens, facturation et comptabilité.',
    tone: 'bg-secondary text-secondary-foreground',
    content:
      "Élèves : cycle de vie Prospect → Admis. Planning : vue liste ou calendrier hebdomadaire. Examens : individuels + sessions/bordereaux PDF. Facturation : relances WhatsApp en un clic. Comptabilité : dépenses avec justificatif photo (500 Ko max).",
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Contacter le support',
    description: 'Notre équipe support vous répond sous 24h ouvrées, du lundi au vendredi.',
    tone: 'bg-success/10 text-success',
    content:
      'Email : support@sarahauto.ci — Téléphone : +225 07 00 00 00. Indiquez votre rôle, le module concerné et une capture d’écran si possible.',
  },
]

export function AssistancePanel() {
  const faq = useDataStore((s) => s.faq)
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  return (
    <div className="space-y-6">
      {/* Help topic cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {helpTopics.map((t) => (
          <Card key={t.title} className="flex flex-col gap-3">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${t.tone}`}>
              {t.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{t.content}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card className="mt-6 p-0">
        <div className="border-b border-border p-4">
          <h2 className="text-base font-semibold text-foreground">Foire aux questions</h2>
          <p className="text-sm text-muted-foreground">
            {faq.length} questions — cliquez sur une question pour afficher la réponse
          </p>
        </div>

        <div className="custom-scrollbar max-h-[480px] overflow-y-auto p-4">
          <Accordion
            type="single"
            collapsible
            value={openItem}
            onValueChange={setOpenItem}
            className="w-full"
          >
            {faq.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {item.sortOrder}
                    </span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-9 text-sm leading-relaxed text-muted-foreground">
                  {item.r}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Card>

      {/* Contact card */}
      <Card className="mt-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Besoin d'aide supplémentaire ?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Notre équipe support est disponible pour répondre à toutes vos questions
                techniques ou fonctionnelles sur l'ERP SARAH AUTO.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="mailto:support@sarahauto.ci"
              className="flex h-10 items-center gap-2.5 rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="h-4 w-4 text-primary" />
              support@sarahauto.ci
            </a>
            <a
              href="tel:+22507000000"
              className="flex h-10 items-center gap-2.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Phone className="h-4 w-4" />
              +225 07 00 00 00
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}
