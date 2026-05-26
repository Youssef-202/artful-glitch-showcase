INSERT INTO public.site_pages (page_key, content) VALUES (
  'blog',
  jsonb_build_object(
    'kicker', 'مدونتنا',
    'title', 'أفكار و رؤى',
    'subtitle', 'مقالات مختارة في التسويق، التصميم والهوية البصرية',
    'cover_url', ''
  )
) ON CONFLICT (page_key) DO NOTHING;