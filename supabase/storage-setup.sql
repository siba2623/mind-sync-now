-- Create storage bucket for mood captures (voice and photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mood-captures', 'mood-captures', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for mood-captures bucket
CREATE POLICY "Users can upload their own mood captures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mood-captures' AND
  (storage.foldername(name))[1] = 'voice-recordings' OR
  (storage.foldername(name))[1] = 'photo-moods'
);

CREATE POLICY "Users can view their own mood captures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'mood-captures');

CREATE POLICY "Users can delete their own mood captures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mood-captures');

-- Allow public access to mood captures (for viewing uploaded content)
CREATE POLICY "Public can view mood captures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-captures');
