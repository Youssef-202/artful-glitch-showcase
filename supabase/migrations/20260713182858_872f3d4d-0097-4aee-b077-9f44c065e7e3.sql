
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS home_title_color TEXT,
  ADD COLUMN IF NOT EXISTS home_client_color TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_cover_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_title_color TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_client_color TEXT,
  ADD COLUMN IF NOT EXISTS detail_cover_url TEXT;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS services_page_image_url TEXT;
