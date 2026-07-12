
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS home_title TEXT,
  ADD COLUMN IF NOT EXISTS home_tagline TEXT,
  ADD COLUMN IF NOT EXISTS home_number TEXT,
  ADD COLUMN IF NOT EXISTS home_image_url TEXT;

ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS home_title_ar TEXT,
  ADD COLUMN IF NOT EXISTS home_title_en TEXT,
  ADD COLUMN IF NOT EXISTS home_client_ar TEXT,
  ADD COLUMN IF NOT EXISTS home_client_en TEXT,
  ADD COLUMN IF NOT EXISTS home_cover_url TEXT;
