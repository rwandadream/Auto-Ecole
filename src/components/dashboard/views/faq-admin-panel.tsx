'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Card, ActionButton } from '@/components/dashboard/views/shared'
import { Modal, ModalCancelButton, ModalPrimaryButton, Field, FormInput } from '@/components/dashboard/modal'
import { useDataStore } from '@/store/data-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { FaqItem } from '@/lib/domain/types'

export function FaqAdminPanel() {
  const faq = useDataStore((s) => s.faq)
  const addFaqItem = useDataStore((s) => s.addFaqItem)
  const updateFaqItem = useDataStore((s) => s.updateFaqItem)
  const deleteFaqItem = useDataStore((s) => s.deleteFaqItem)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FaqItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const openCreate = () => {
    setEditing(null)
    setQuestion('')
    setAnswer('')
    setOpen(true)
  }

  const openEdit = (item: FaqItem) => {
    setEditing(item)
    setQuestion(item.q)
    setAnswer(item.r)
    setOpen(true)
  }

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('Question et réponse requises.')
      return
    }
    if (editing) {
      updateFaqItem(editing.id, { q: question.trim(), r: answer.trim() })
      toast.success('Question FAQ mise à jour.')
    } else {
      addFaqItem({ q: question.trim(), r: answer.trim() })
      toast.success('Question FAQ ajoutée.')
    }
    setOpen(false)
  }

  const handleDelete = () => {
    if (!deletingId) return
    deleteFaqItem(deletingId)
    setDeletingId(null)
    toast.success('Question FAQ supprimée.')
  }

  return (
    <>
      <Card className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Gestion de la FAQ</h2>
            <p className="text-sm text-muted-foreground">
              Modifiez les questions affichées dans Assistance (synchronisées en base).
            </p>
          </div>
          <ActionButton variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Ajouter une question
          </ActionButton>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {faq.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{item.q}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.r}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="flex h-8 items-center gap-1 rounded-md border border-input px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(item.id)}
                  className="flex h-8 items-center gap-1 rounded-md border border-destructive/30 px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Modifier la question' : 'Nouvelle question FAQ'}
        description="Contenu visible par tout le personnel dans Assistance."
        footer={
          <>
            <ModalCancelButton type="button" onClick={() => setOpen(false)}>
              Annuler
            </ModalCancelButton>
            <ModalPrimaryButton type="button" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Enregistrer
            </ModalPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Question" required>
            <FormInput value={question} onChange={(e) => setQuestion(e.target.value)} />
          </Field>
          <Field label="Réponse" required>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </Modal>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
