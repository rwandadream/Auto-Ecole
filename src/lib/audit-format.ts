const ACTION_LABELS: Record<string, string> = {
  INSERT: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
}

const ENTITY_LABELS: Record<string, string> = {
  eleves: 'Élève',
  moniteurs: 'Moniteur',
  vehicules: 'Véhicule',
  formations: 'Formation',
  permis: 'Permis',
  inspecteurs: 'Inspecteur',
  seances: 'Séance',
  examens: 'Examen',
  examen_sessions: 'Session d\'examen',
  factures: 'Facture',
  paiements: 'Paiement',
  depenses: 'Dépense',
  profiles: 'Utilisateur',
  inscriptions: 'Inscription',
}

export function formatAuditDescription(
  action: string,
  entity: string,
  stored?: string | null,
): string {
  if (stored?.trim()) return stored.trim()
  const actionLabel = ACTION_LABELS[action] ?? action
  const entityLabel = ENTITY_LABELS[entity] ?? entity.replace(/_/g, ' ')
  return `${actionLabel} — ${entityLabel}`
}
