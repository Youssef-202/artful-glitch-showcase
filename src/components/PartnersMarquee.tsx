import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export default function PartnersMarquee() {
  const { dir } = useLang();
  const [items, setItems] = useState<Partner[]>([]);

  useEffect(() => {
    supabase
      .from("partners")
      .select("id,name,logo_url,website_url")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data as any) ?? []));
  }, []);

  // Show 8 placeholder cards if no partners yet
  const display: (Partner | null)[] =
    items.length > 0 ? items : Array.from({ length: 8 }, () => null);
  // Duplicate enough times so marquee always feels seamless even with few items
  const minCount = 16;
  const repeats = Math.max(2, Math.ceil(minCount / Math.max(display.length, 1)));
  const loop = Array.from({ length: repeats }, () => display).flat();

  return (
    <section className="relative py-20 overflow-hidden" dir={dir}>
      <div className="px-6 max-w-7xl mx-auto text-center mb-10">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          {"\n"}
        </p>
        <h2 className="font-black leading-[1.4] py-2">
          <span className="text-gradient font-serif font-bold text-2xl sm:text-6xl font-mono font-extrabold text-center text-slate-50 bg-slate-800 px-4 py-2 inline-block leading-[1.4] whitespace-nowrap">شركاؤنا</span>
        </h2>
        <p className="mt-3 text-muted-foreground sm:text-base text-2xl font-mono my-px border-0">
          نفخر بالعمل مع نخبة من الشركات والعلامات التجارية
        </p>
      </div>

      <div
        className={`swiper swiper-initialized swiper-horizontal ${dir === "rtl" ? "swiper-rtl" : ""} partnersSwiper group relative`}
      >
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div
          className={`flex gap-6 w-max ${dir === "rtl" ? "animate-marquee-rtl" : "animate-marquee"} group-hover:[animation-play-state:paused]`}
        >
          {loop.map((p, i) => {
            const card = (
              <div className="shrink-0 h-14 sm:h-16 px-8 sm:px-10 rounded-full glass border border-border/50 flex items-center justify-center gap-3 hover:border-primary/60 hover:shadow-glow transition-all">
                {p?.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-8 max-w-[120px] object-contain opacity-90"
                  />
                ) : p ? (
                  <span className="font-bold text-base sm:text-lg text-foreground whitespace-nowrap">
                    {p.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/60 tracking-widest">
                    LOGO
                  </span>
                )}
              </div>
            );
            return p?.website_url ? (
              <a
                key={`${p?.id ?? "ph"}-${i}`}
                href={p.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card}
              </a>
            ) : (
              <div key={`${p?.id ?? "ph"}-${i}`}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
