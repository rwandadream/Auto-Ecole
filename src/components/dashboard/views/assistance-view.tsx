'use client'

import { useState } from 'react'
import {
  BookOpen,
  PlayCircle,
  Mail,
  Phone,
  LifeBuoy,
  ExternalLink,
} from 'lucide-react'
import {
  ViewHeader,
  Card,
} from './shared'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faq } from '@/lib/mock-data'

const helpTopics = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Guide de démarrage',
    description: "Apprenez les bases de l'ERP et configurez votre auto-école en quelques minutes.",
    tone: 'bg-primary/10 text-primary',
  },
  {
    icon: <PlayCircle className="h-6 w-6" />,
    title: 'Vidéos tutoriels',
    description: 'Des tutoriels vidéo pas à pas pour maîtriser chaque module de SARAH AUTO.',
    tone: 'bg-sky-500/10 text-sky-600',
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Contacter le support',
    description: 'Notre équipe support vous répond sous 24h ouvrées, du lundi au vendredi.',
    tone: 'bg-emerald-500/10 text-emerald-600',
  },
]

export function AssistanceView() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  return (
    <>
      <ViewHeader
        title="Assistance"
        description="Centre d'aide et foire aux questions"
      />

      {/* Help topic cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {helpTopics.map((t) => (
          <Card
            key={t.title}
            onClick={() => toast.info(`« ${t.title} » — documentation détaillée bientôt disponible`)}
            className="flex cursor-pointer flex-col gap-3 transition-colors hover:border-primary/40"
          >
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${t.tone}`}>
              {t.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            </div>
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
              En savoir plus
              <ExternalLink className="h-3.5 w-3.5" />
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
            {faq.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
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
    </>
  )
}
