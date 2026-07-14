UPDATE site_pages 
SET content = jsonb_set(content, '{header_kicker}', '""')
WHERE page_key = 'about';