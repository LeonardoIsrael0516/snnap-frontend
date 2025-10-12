-- Fix search_path for increment_page_views function
CREATE OR REPLACE FUNCTION increment_page_views(page_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ai_pages
  SET views = views + 1
  WHERE id = page_id;
END;
$$;