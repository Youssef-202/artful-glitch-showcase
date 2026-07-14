import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/external";
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
      className="py-20 overflow-hidden"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-4">
          <h2 className="inline-block text-center text-gradient font-sans font-extrabold leading-tight font-mono bg-slate-800 sm:text-5xl text-2xl px-8 pt-2 pb-[11px] rounded-xl">
            &nbsp;شـــركـــــاؤنــــــا
          </h2>
        </div>
        <p className="text-center text-muted-foreground mb-12 sm:text-lg text-2xl font-sans font-bold">
          نفخر بشراكتنا مع نخبة من العلامات التجارية الرائدة
        </p>

        <div className="group" dir="rtl">
          <div className="flex w-max animate-marquee-rtl group-hover:[animation-play-state:paused]">
            {loop.map((p, i) => {
              const card = (
                <div className="bg-white text-slate-900 rounded-2xl h-32 w-full flex items-center justify-center p-4 shadow-lg hover:shadow-xl transition border border-slate-200">
                  {p?.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      loading="lazy"
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : p ? (
                    <span className="font-bold text-xl text-center">
                      {p.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground tracking-widest">
                      LOGO
                    </span>
                  )}
                </div>
              );
              return (
                <div
                  key={`${p?.id ?? "ph"}-${i}`}
                  className="shrink-0"
                  style={{ width: "260px", marginLeft: "24px" }}
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
