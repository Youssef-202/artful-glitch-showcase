import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export default function PartnersLogoCloud() {
  const { dir } = useLang();
  const [items, setItems] = useState<Partner[]>([]);

  useEffect(() => {
    supabase
      .from("partners")
      .select("id,name,logo_url,website_url")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data as any) ?? []));
  }, []);

  const display: (Partner | null)[] =
    items.length > 0 ? items : Array.from({ length: 8 }, () => null);
  const minCount = 16;
  const repeats = Math.max(2, Math.ceil(minCount / Math.max(display.length, 1)));
  const loop = Array.from({ length: repeats }, () => display).flat();

  return (
    <section
      className="bg-gradient-to-br from-teal-800 to-teal-900 py-20 overflow-hidden"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl text-white font-bold text-center mb-12 flex items-center justify-center gap-3">
          شركاؤنا
        </h2>

        <div className="group relative" dir="rtl">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-teal-900 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-teal-800 to-transparent" />

          <div className="flex w-max animate-marquee-rtl group-hover:[animation-play-state:paused]">
            {loop.map((p, i) => {
              const card = (
                <div className="bg-white rounded-2xl h-40 w-full flex items-center justify-center p-6 shadow-lg hover:shadow-xl transition">
                  {p?.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      loading="lazy"
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : p ? (
                    <span className="font-bold text-xl text-slate-900 text-center">
                      {p.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 tracking-widest">
                      LOGO
                    </span>
                  )}
                </div>
              );
              return (
                <div
                  key={`${p?.id ?? "ph"}-${i}`}
                  className="shrink-0"
                  style={{ width: "301.667px", marginLeft: "30px" }}
                >
                  {p?.website_url ? (
                    <a href={p.website_url} target="_blank" rel="noopener noreferrer">
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
