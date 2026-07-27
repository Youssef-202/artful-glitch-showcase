import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/external";

export const PORTFOLIO_FIELDS_KEY = "portfolio_fields";

export function usePortfolioFields() {
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_pages")
      .select("content")
      .eq("page_key", PORTFOLIO_FIELDS_KEY)
      .maybeSingle();
    const list = (data?.content?.fields ?? []) as string[];
    setFields(Array.isArray(list) ? list.filter(Boolean) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveFields = useCallback(async (next: string[]) => {
    const clean = Array.from(new Set(next.map((f) => f.trim()).filter(Boolean)));
    const { error } = await supabase
      .from("site_pages")
      .upsert({ page_key: PORTFOLIO_FIELDS_KEY, content: { fields: clean } }, { onConflict: "page_key" });
    if (!error) setFields(clean);
    return error;
  }, []);

  return { fields, loading, reload: load, saveFields };
}
