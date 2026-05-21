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
  // Duplicate for seamless loop
  const loop = [...display, ...display];

  return (
    <section className="relative py-20 overflow-hidden" dir={dir}>
      <div className="px-6 max-w-7xl mx-auto text-center mb-10">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          PARTNERS
        </p>
        <h2 className="text-3xl sm:text-5xl font-black">
          <span className="text-gradient">شركاؤنا</span>
        </h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base">
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
              <div className="swiper-slide w-48 sm:w-56 h-32 sm:h-36 shrink-0 glass rounded-2xl border border-border/40 flex items-center justify-center p-6 hover:shadow-glow hover:-translate-y-1 transition-all">
                {p?.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition"
                  />
                ) : p ? (
                  <span className="font-bold text-lg text-foreground/80">{p.name}</span>
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
