-- Colonne description pour le journal d'audit lisible après sync

ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS description text;
