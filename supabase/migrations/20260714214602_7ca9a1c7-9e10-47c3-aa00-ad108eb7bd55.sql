UPDATE site_pages 
SET content = jsonb_set(content, '{kicker}', '""')
WHERE page_key = 'blog';