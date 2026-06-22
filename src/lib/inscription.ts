import type { useDataStore } from '@/store/data-store'

type Store = ReturnType<typeof useDataStore.getState>

export async function inscrireEleveAvecFacture(
  store: Store,
  eleveId: string,
  formationId: string,
  tarif?: number,
) {
  return store.inscrireEleve(eleveId, formationId, tarif)
}
