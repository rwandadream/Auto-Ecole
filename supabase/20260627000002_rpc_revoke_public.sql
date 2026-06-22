-- =====================================================
-- MIGRATION 018 — REVOKE PUBLIC sur RPC admin (complément audit)
-- PostgreSQL accorde EXECUTE à PUBLIC par défaut ; REVOKE anon seul ne suffit pas.
-- =====================================================

-- RPC admin : révoquer PUBLIC + anon, ne garder que authenticated
REVOKE ALL ON FUNCTION public.create_staff_user(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_staff_user(text, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_eleve(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_eleve(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_staff_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_staff_user(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.enregistrer_paiement(uuid, numeric, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enregistrer_paiement(uuid, numeric, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.inscrire_eleve(uuid, uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.inscrire_eleve(uuid, uuid, numeric) TO authenticated;

REVOKE ALL ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_staff_user(uuid, text, text, boolean, text) TO authenticated;

-- Helpers : utilisés dans RLS, authenticated uniquement (pas d'appel RPC anon)
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.is_comptable_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_comptable_or_admin() TO authenticated;

-- Portail élève : anon + authenticated (intentionnel)
REVOKE ALL ON FUNCTION public.login_eleve_portail(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_eleve_portail(text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_eleve_portail_data(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_eleve_portail_data(text, text) TO anon, authenticated;
