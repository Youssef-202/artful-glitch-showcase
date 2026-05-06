import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioItemsFallback, type PortfolioItem, type PortfolioCategory } from "./portfolio";

export function usePortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        if (data && data.length) {
          setItems(
            data.map((d: any) => ({
              id: d.id,
              category: d.category as PortfolioCategory,
              titleAr: d.title_ar,
              titleEn: d.title_en,
              clientAr: d.client_ar ?? "",
              clientEn: d.client_en ?? "",
              color: d.color,
              accent: d.accent,
              coverUrl: d.cover_url,
            }))
          );
        } else {
          setItems(portfolioItemsFallback);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}
