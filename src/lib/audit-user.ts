let currentAuditUser = 'Système'

export function setCurrentAuditUser(name: string) {
  currentAuditUser = name || 'Système'
}

export function getCurrentAuditUser() {
  return currentAuditUser
}
