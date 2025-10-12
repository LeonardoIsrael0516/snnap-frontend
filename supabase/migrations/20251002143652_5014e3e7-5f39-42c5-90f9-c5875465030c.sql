-- Add SEO and configuration fields to ai_pages table
ALTER TABLE public.ai_pages
ADD COLUMN IF NOT EXISTS favicon_url text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS og_title text,
ADD COLUMN IF NOT EXISTS og_description text,
ADD COLUMN IF NOT EXISTS og_image text,
ADD COLUMN IF NOT EXISTS custom_css text;