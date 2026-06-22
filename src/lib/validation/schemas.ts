import { z } from 'zod'

export const eleveSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  telephone: z.string().min(8, 'Téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  typePermis: z.enum(['A', 'B', 'AB', 'C']),
})

export const formationSchema = z.object({
  nom: z.string().min(1),
  prix: z.number().min(0),
  actif: z.boolean(),
})

export const factureSchema = z.object({
  montant: z.number().positive('Montant positif requis'),
  eleveCode: z.string().min(1),
})

export const paiementSchema = z.object({
  montant: z.number().positive(),
  factureId: z.string().min(1),
  modePaiement: z.enum(['Espèces', 'Orange Money', 'Wave', 'Virement']),
})

export const seanceSchema = z.object({
  date: z.string().min(1),
  heureDebut: z.string().min(1),
  heureFin: z.string().min(1),
  eleveCode: z.string().min(1),
})

export const examenSessionSchema = z.object({
  centre: z.string().min(1),
  typeExamen: z.enum(['Code', 'Conduite']),
  date: z.string().min(1),
  heure: z.string().min(1),
})

export const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
})

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Données invalides' }
  }
  return { ok: true, data: result.data }
}
