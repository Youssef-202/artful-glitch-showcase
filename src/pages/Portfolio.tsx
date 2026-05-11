import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";

export default function Portfolio() {
  const { t, lang } = useLang();
  const { items: portfolioItems } = usePortfolio();
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? portfolioItems : portfolioItems.filter((p) => p.category === filter)),
    [filter, portfolioItems]
  );

  const cats = [
    { id: "all", label: t.portfolio.categories.all },
    { id: "branding", label: t.portfolio.categories.branding },
    { id: "web", label: t.portfolio.categories.web },
    { id: "design", label: t.portfolio.categories.design },
    { id: "photo", label: t.portfolio.categories.photo },
  ];

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <p className="text-sm text-primary tracking-widest mb-3">{t.portfolio.kicker}</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-4">
          <span className="text-gradient">{t.portfolio.title}</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.portfolio.subtitle}</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              filter === c.id
                ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow"
                : "glass hover:bg-foreground/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid (same design as Home) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
          >
            <div className="group block glass rounded-2xl overflow-hidden h-full hover:shadow-glow hover:-translate-y-1 transition-all">
              <div
                className="relative aspect-square overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent})` }}
              >
                {item.coverUrl && (
                  <img
                    src={item.coverUrl}
                    alt={lang === "ar" ? item.titleAr : item.titleEn}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-background/60 backdrop-blur text-primary font-bold">
                  {t.portfolio.categories[item.category]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold line-clamp-1">{lang === "ar" ? item.titleAr : item.titleEn}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{lang === "ar" ? item.clientAr : item.clientEn}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-16">—</p>
        )}
      </div>
    </div>
  );
}
