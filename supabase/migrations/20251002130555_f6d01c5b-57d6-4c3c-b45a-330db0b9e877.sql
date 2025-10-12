-- Create function to increment page views
CREATE OR REPLACE FUNCTION increment_page_views(page_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_pages
  SET views = views + 1
  WHERE id = page_id;
END;
$$;