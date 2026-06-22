-- Migration for Examen Sessions and Bordereaux
-- Date: 2026-06-15

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create examen_sessions table
CREATE TABLE IF NOT EXISTS public.examen_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_bordereau TEXT UNIQUE NOT NULL,
    titre TEXT NOT NULL,
    type_examen TEXT NOT NULL CHECK (type_examen IN ('Code', 'Conduite')),
    date_examen DATE NOT NULL,
    heure_examen TIME NOT NULL,
    centre TEXT NOT NULL,
    lieu TEXT NOT NULL,
    categorie TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'programmée', 'en cours', 'terminée', 'annulée')),
    inspecteur_id UUID REFERENCES public.inspecteurs(id),
    vehicule_id UUID REFERENCES public.vehicules(id),
    observations TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create examen_session_eleves table (with snapshots)
CREATE TABLE IF NOT EXISTS public.examen_session_eleves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.examen_sessions(id) ON DELETE CASCADE,
    eleve_id UUID NOT NULL REFERENCES public.eleves(id),
    
    -- Snapshot fields for historical integrity
    nom_complet TEXT NOT NULL,
    identifiant TEXT NOT NULL,
    telephone TEXT NOT NULL,
    categorie_permis TEXT NOT NULL,
    
    resultat TEXT DEFAULT 'en_attente' CHECK (resultat IN ('en_attente', 'admis', 'echec')),
    note NUMERIC,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(session_id, eleve_id)
);

-- 3. Enable RLS
ALTER TABLE public.examen_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examen_session_eleves ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Enable all for authenticated users" ON public.examen_sessions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON public.examen_session_eleves
    FOR ALL USING (auth.role() = 'authenticated');
