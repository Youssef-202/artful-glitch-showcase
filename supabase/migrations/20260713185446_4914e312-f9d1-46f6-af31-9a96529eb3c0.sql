
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS home_cover_url_light TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_cover_url_light TEXT,
  ADD COLUMN IF NOT EXISTS detail_cover_url_light TEXT,
  ADD COLUMN IF NOT EXISTS home_title_color_light TEXT,
  ADD COLUMN IF NOT EXISTS home_client_color_light TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_title_color_light TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_client_color_light TEXT;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS home_image_url_light TEXT,
  ADD COLUMN IF NOT EXISTS services_page_image_url_light TEXT,
  ADD COLUMN IF NOT EXISTS image_url_light TEXT,
  ADD COLUMN IF NOT EXISTS home_title_color_light TEXT,
  ADD COLUMN IF NOT EXISTS home_tagline_color_light TEXT,
  ADD COLUMN IF NOT EXISTS title_color_light TEXT,
  ADD COLUMN IF NOT EXISTS tagline_color_light TEXT;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cover_url_light TEXT,
  ADD COLUMN IF NOT EXISTS title_color_light TEXT;
