import { describe, expect, it } from 'vitest'
import { parseIdentityDocumentText } from '@/lib/cni-ocr'

describe('parseIdentityDocumentText', () => {
  it('extrait une CNI ivoirienne typée', () => {
    const text = `
REPUBLIQUE DE COTE D'IVOIRE
CARTE NATIONALE D'IDENTITE
Nom: KONE
Prénoms: Aminata
Date de naissance: 12/03/1998
Lieu de naissance: Bouake
Sexe: F
Nationalité: Ivoirienne
N° de pièce: 7512145782V
`
    const r = parseIdentityDocumentText(text)
    expect(r.typePiece).toBe('CNI')
    expect(r.nom.toUpperCase()).toContain('KONE')
    expect(r.prenom.toLowerCase()).toContain('aminata')
    expect(r.dateNaissance).toBe('1998-03-12')
    expect(r.numPiece).toContain('7512145782')
    expect(r.sexe).toBe('F')
  })

  it('détecte un passeport via mot-clé', () => {
    const text = `
PASSPORT
Nom: TRAORE
Prénom: Moussa
Date de naissance: 01/05/1990
N° de document: AB1234567
`
    const r = parseIdentityDocumentText(text)
    expect(r.typePiece).toBe('Passeport')
    expect(r.numPiece).toMatch(/AB1234567/i)
  })

  it('détecte une carte consulaire', () => {
    const text = `
CARTE CONSULAIRE
Nom: DIARRASSOUBA
Prénoms: ABOUBACAR
N° de carte: CC-99887766
`
    const r = parseIdentityDocumentText(text)
    expect(r.typePiece).toBe('Consulaire')
    expect(r.numPiece).toMatch(/99887766/)
  })
})
