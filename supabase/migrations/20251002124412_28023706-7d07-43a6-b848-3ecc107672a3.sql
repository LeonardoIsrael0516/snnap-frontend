-- Create table for storing AI-generated pages
CREATE TABLE public.ai_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since there's no auth yet)
CREATE POLICY "Anyone can view pages" 
ON public.ai_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create pages" 
ON public.ai_pages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update pages" 
ON public.ai_pages 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete pages" 
ON public.ai_pages 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_pages_updated_at
BEFORE UPDATE ON public.ai_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();