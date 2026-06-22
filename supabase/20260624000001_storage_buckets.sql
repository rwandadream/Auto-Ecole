-- =====================================================
-- Supabase Storage — buckets médias SARAH AUTO
-- justificatifs, avatars, CNI (privés, URLs signées)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('justificatifs', 'justificatifs', false, 524288, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('avatars', 'avatars', false, 524288, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('cni', 'cni', false, 524288, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Staff actif peut lire les médias
CREATE POLICY "Staff can read media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('justificatifs', 'avatars', 'cni')
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND actif = true
  )
);

-- Staff actif peut téléverser
CREATE POLICY "Staff can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('justificatifs', 'avatars', 'cni')
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND actif = true
  )
);

-- Staff actif peut remplacer
CREATE POLICY "Staff can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('justificatifs', 'avatars', 'cni')
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND actif = true
  )
)
WITH CHECK (
  bucket_id IN ('justificatifs', 'avatars', 'cni')
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND actif = true
  )
);

-- Admins peuvent supprimer
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('justificatifs', 'avatars', 'cni')
  AND public.is_admin()
);
