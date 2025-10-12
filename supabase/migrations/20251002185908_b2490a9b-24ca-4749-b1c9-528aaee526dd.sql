-- Create biolinks table
CREATE TABLE public.biolinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{"background": {"type": "color", "value": "#ffffff"}}'::jsonb,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.biolinks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view biolinks"
  ON public.biolinks
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create biolinks"
  ON public.biolinks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update biolinks"
  ON public.biolinks
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete biolinks"
  ON public.biolinks
  FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_biolinks_updated_at
  BEFORE UPDATE ON public.biolinks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment views
CREATE OR REPLACE FUNCTION public.increment_biolink_views(biolink_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE biolinks
  SET views = views + 1
  WHERE id = biolink_id;
END;
$$;