-- Create storage bucket for AI page images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ai-page-images', 'ai-page-images', true);

-- Create RLS policies for the bucket
CREATE POLICY "Anyone can view AI page images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-page-images');

CREATE POLICY "Anyone can upload AI page images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ai-page-images');

CREATE POLICY "Anyone can update AI page images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ai-page-images');

CREATE POLICY "Anyone can delete AI page images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ai-page-images');