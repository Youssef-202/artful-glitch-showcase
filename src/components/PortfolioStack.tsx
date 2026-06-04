import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack";

export default function PortfolioStack() {
  const { t, lang, dir } = useLang();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  if (!items.length) return null;

  const intro =
    lang === "ar"
      ? "نُترجم رؤيتك إلى تجارب بصرية متقنة. تصفّح مختارات من مشاريعنا التي صنعناها بشغف وتفاصيل لا تُنسى."
      : "We translate your vision into refined visual experiences. Browse a selection of projects crafted with passion and unforgettable detail.";

  const heading =
    lang === "ar" ? "معرض أعمال إتقان" : "Etqan Portfolio";

  return (
    <section className="relative px-6 sm:px-12 py-24">
      <ContainerScroll className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {/* Sticky text column */}
        <div className="lg:sticky lg:top-24 lg:h-fit self-start text-start">
          <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold uppercase">
            {t.common.ourWork}
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
            <span className="text-gradient font-sans font-extrabold text-slate-50">{heading}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
            {intro}
          </p>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition text-sm"
          >
            {t.common.viewAll} <Arrow className="w-4 h-4" />
          </Link>
        </div>

        {/* Stacked cards column */}
        <div className="flex flex-col gap-6">
          {items.map((item, index) => (
            <CardSticky
              key={item.id}
              index={index}
              incrementY={16}
              incrementZ={1}
            >
              <Link
                to={`/portfolio/${item.id}`}
                className="group block rounded-3xl overflow-hidden border border-white/10 shadow-elegant hover:shadow-glow transition-shadow"
                style={{
                  background: `linear-gradient(135deg, ${item.color}, ${item.accent})`,
                }}
              >
                <div className="relative aspect-[4/5] sm:aspect-[5/4] w-full overflow-hidden">
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={lang === "ar" ? item.titleAr : item.titleEn}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-[0.2em] uppercase">
                      {t.portfolio.categories[item.category]}
                    </span>
                    <span className="text-xs font-black text-white/80 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-start">
                    <h3 className="text-xl sm:text-3xl font-black mb-1 leading-tight text-white">
                      {lang === "ar" ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      {lang === "ar" ? item.clientAr : item.clientEn}
                    </p>
                  </div>
                </div>
              </Link>
            </CardSticky>
          ))}
        </div>
      </ContainerScroll>
    </section>
  );
}
