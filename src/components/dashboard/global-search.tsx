'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, User, Receipt, Car, UserCog } from 'lucide-react'
import { useDataStore } from '@/store/data-store'
import { useNavStore, type ViewKey } from '@/store/nav-store'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type SearchResult = {
  id: string
  type: 'eleve' | 'facture' | 'moniteur' | 'vehicule'
  label: string
  sub: string
  view: ViewKey
  eleveCode?: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const setActiveView = useNavStore((s) => s.setActiveView)
  const setSelectedEleveCode = useNavStore((s) => s.setSelectedEleveCode)

  const eleves = useDataStore((s) => s.eleves)
  const factures = useDataStore((s) => s.factures)
  const moniteurs = useDataStore((s) => s.moniteurs)
  const vehicules = useDataStore((s) => s.vehicules)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setMobileOpen(true)
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [] as SearchResult[]

    const out: SearchResult[] = []

    eleves.forEach((e) => {
      const label = `${e.prenom} ${e.nom}`
      if (
        label.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.telephone.includes(q)
      ) {
        out.push({
          id: e.id,
          type: 'eleve',
          label,
          sub: e.code,
          view: 'eleve-detail',
          eleveCode: e.code,
        })
      }
    })

    factures.forEach((f) => {
      if (
        f.numero.toLowerCase().includes(q) ||
        f.eleve.toLowerCase().includes(q) ||
        f.formation.toLowerCase().includes(q)
      ) {
        out.push({
          id: f.id,
          type: 'facture',
          label: f.numero,
          sub: `${f.eleve} — ${f.statut}`,
          view: 'facturation',
        })
      }
    })

    moniteurs.forEach((m) => {
      const label = `${m.prenom} ${m.nom}`
      if (label.toLowerCase().includes(q) || m.telephone.includes(q)) {
        out.push({ id: m.id, type: 'moniteur', label, sub: m.specialite, view: 'moniteurs' })
      }
    })

    vehicules.forEach((v) => {
      const label = `${v.marque} ${v.modele}`
      if (
        label.toLowerCase().includes(q) ||
        v.immatriculation.toLowerCase().includes(q)
      ) {
        out.push({ id: v.id, type: 'vehicule', label, sub: v.immatriculation, view: 'vehicules' })
      }
    })

    return out.slice(0, 12)
  }, [query, eleves, factures, moniteurs, vehicules])

  const iconFor = (type: SearchResult['type']) => {
    switch (type) {
      case 'eleve':
        return User
      case 'facture':
        return Receipt
      case 'moniteur':
        return UserCog
      case 'vehicule':
        return Car
    }
  }

  const handleSelect = (r: SearchResult) => {
    if (r.eleveCode) setSelectedEleveCode(r.eleveCode)
    setActiveView(r.view)
    setQuery('')
    setOpen(false)
    setMobileOpen(false)
  }

  const resultsList =
    query.trim() === '' ? (
      <p className="px-4 py-3 text-sm text-muted-foreground">Saisissez un terme de recherche</p>
    ) : results.length === 0 ? (
      <p className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat</p>
    ) : (
      results.map((r) => {
        const Icon = iconFor(r.type)
        return (
          <button
            key={`${r.type}-${r.id}`}
            type="button"
            onMouseDown={() => handleSelect(r)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/60"
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{r.label}</p>
              <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
            </div>
          </button>
        )
      })
    )

  const searchInput = (
    <>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Rechercher un élève, une facture..."
        className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
        ⌘K
      </kbd>
    </>
  )

  return (
    <>
      {/* Desktop / tablet inline search */}
      <div className="relative hidden min-w-0 max-w-md flex-1 md:block">
        {searchInput}
        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-border bg-card shadow-lg">
            {resultsList}
          </div>
        )}
      </div>

      {/* Mobile: icon opens popover with full-width search */}
      <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(calc(100vw-2rem),24rem)] p-3">
          <div className="relative">{searchInput}</div>
          <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-border">
            {resultsList}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
