export const DATA_STORE_KEY = 'sarah-auto-data-v1'
export const AUTH_STORE_KEY = 'sarah-auto-auth-v1'
export const DATA_STORE_VERSION = 1

/** Les données métier viennent de Supabase — pas de localStorage. */
export function shouldPersistDataStore() {
  return false
}
