import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  website_url: string | null;
};

export default function PartnersLogoCloud() {
  const { dir } = useLang();
  const [items, setItems] = useState<Partner[]>([]);

  useEffect(() => {
    supabase
      .from("partners")
      .select("id,name,logo_url,cover_url,website_url")
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
    <section className="relative py-20 overflow-hidden" dir={dir}>
      <div className="px-6 max-w-7xl mx-auto text-center mb-10">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          {"\n"}
        </p>
        <h2 className="text-3xl font-black leading-tight sm:text-5xl">
          <span className="text-gradient text-6xl font-mono font-extrabold text-center text-slate-50 bg-slate-800">​شـــــركـــــــاء الــــــنـــــجــــاح</span>
        </h2>
        <p className="mt-3 text-muted-foreground sm:text-base text-2xl font-mono my-px border-0">
          نفخر بشراكتنا مع نخبة من العلامات التجارية الرائدة
        </p>
      </div>

      <div className={`group relative ${dir === "rtl" ? "swiper-rtl" : ""}`}>
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div
          className={`flex gap-6 w-max ${dir === "rtl" ? "animate-marquee-rtl" : "animate-marquee"} group-hover:[animation-play-state:paused]`}
        >
          {loop.map((p, i) => {
            const card = (
              <div className="shrink-0 h-32 w-56 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] hover:border-emerald-400/70 transition flex items-center justify-center p-5">
                {p?.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : p ? (
                  <span className="font-bold text-lg text-slate-900 whitespace-nowrap text-center">
                    {p.name}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 tracking-widest">LOGO</span>
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
