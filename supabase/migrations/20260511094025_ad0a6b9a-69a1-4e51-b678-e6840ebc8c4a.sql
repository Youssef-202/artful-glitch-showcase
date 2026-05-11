ALTER TABLE public.portfolio_items
ADD COLUMN IF NOT EXISTS description_ar text,
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS content_ar text,
ADD COLUMN IF NOT EXISTS content_en text,
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS process_steps_ar text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS process_steps_en text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS project_url text,
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS year text;