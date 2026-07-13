import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/external";
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
              descriptionAr: d.description_ar,
              descriptionEn: d.description_en,
              contentAr: d.content_ar,
              contentEn: d.content_en,
              galleryUrls: d.gallery_urls ?? [],
              processStepsAr: d.process_steps_ar ?? [],
              processStepsEn: d.process_steps_en ?? [],
              projectUrl: d.project_url,
              duration: d.duration,
              year: d.year,
              homeTitleAr: d.home_title_ar,
              homeTitleEn: d.home_title_en,
              homeClientAr: d.home_client_ar,
              homeClientEn: d.home_client_en,
              homeCoverUrl: d.home_cover_url,
              homeTitleColor: d.home_title_color,
              homeClientColor: d.home_client_color,
              portfolioCoverUrl: d.portfolio_cover_url,
              portfolioTitleColor: d.portfolio_title_color,
              portfolioClientColor: d.portfolio_client_color,
              detailCoverUrl: d.detail_cover_url,
              homeCoverUrlLight: d.home_cover_url_light,
              portfolioCoverUrlLight: d.portfolio_cover_url_light,
              detailCoverUrlLight: d.detail_cover_url_light,
              homeTitleColorLight: d.home_title_color_light,
              homeClientColorLight: d.home_client_color_light,
              portfolioTitleColorLight: d.portfolio_title_color_light,
              portfolioClientColorLight: d.portfolio_client_color_light,

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
