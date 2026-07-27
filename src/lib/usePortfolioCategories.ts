import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/external";

export const PORTFOLIO_CATEGORIES_KEY = "portfolio_categories";

export function usePortfolioCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_pages")
      .select("content")
      .eq("page_key", PORTFOLIO_CATEGORIES_KEY)
      .maybeSingle();
    const list = (data?.content?.categories ?? []) as string[];
    setCategories(Array.isArray(list) ? list.filter(Boolean) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveCategories = useCallback(async (next: string[]) => {
    const clean = Array.from(new Set(next.map((c) => c.trim()).filter(Boolean)));
    const { error } = await supabase
      .from("site_pages")
      .upsert({ page_key: PORTFOLIO_CATEGORIES_KEY, content: { categories: clean } }, { onConflict: "page_key" });
    if (!error) setCategories(clean);
    return error;
  }, []);

  return { categories, loading, reload: load, saveCategories };
}
