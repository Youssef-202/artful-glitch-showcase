import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack";
import { useTheme } from "@/theme/ThemeProvider";

export default function PortfolioStack() {
  const { t, lang, dir } = useLang();
  const { items: allItems } = usePortfolio();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const items = allItems.slice(0, 10);
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
      {/* ambient backdrop - matches services section */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>
      <ContainerScroll className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {/* Sticky text column */}
        <div className="lg:sticky lg:top-24 lg:h-fit self-start text-start">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-normal leading-tight mb-6">
            <span className="text-gradient font-sans font-extrabold text-white">{heading}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
            {intro}
          </p>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent !text-white shadow-glow hover:scale-105 transition text-sm"
            style={{ color: "#ffffff" }}
          >
            {t.common.viewAll} <Arrow className="w-4 h-4" />
          </Link>
        </div>

        {/* Stacked cards column */}
        <div className="flex flex-col gap-6">
          {items.map((item, index) => {
            const cover = (isLight && item.homeCoverUrlLight) || item.homeCoverUrl || item.coverUrl;
            const titleColor = (isLight && item.homeTitleColorLight) || item.homeTitleColor || "#ffffff";
            const clientColor = (isLight && item.homeClientColorLight) || item.homeClientColor || "rgba(255,255,255,0.7)";
            const title = lang === "ar"
              ? (item.homeTitleAr || item.titleAr)
              : (item.homeTitleEn || item.titleEn);
            const client = lang === "ar"
              ? (item.homeClientAr || item.clientAr)
              : (item.homeClientEn || item.clientEn);
            return (
            <CardSticky
              key={item.id}
              index={index}
              incrementY={16}
              incrementZ={1}
            >
              <Link
                to={`/portfolio/${item.id}`}
                className="group block rounded-3xl overflow-hidden border border-teal-900/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_-10px_rgba(3,108,95,0.9)] transition-shadow"
                style={{
                  background: "linear-gradient(135deg, #022e29, #03332d, #01211d)",
                }}
              >
                <div className="relative aspect-[4/5] sm:aspect-[5/4] w-full overflow-hidden">
                  {cover && (
                    <img
                      src={cover}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#01211d] via-[#022e29]/40 to-transparent" />
                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-[0.2em] uppercase">
                      {t.portfolio.categories[item.category]}
                    </span>
                    <span className="text-xs font-black text-white/80 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-start">
                    <h3
                      className="text-xl sm:text-3xl font-black mb-1 leading-tight"
                      style={{ color: titleColor }}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm"
                      style={{ color: clientColor }}
                    >
                      {client}
                    </p>
                  </div>
                </div>
              </Link>
            </CardSticky>
            );
          })}

        </div>
      </ContainerScroll>
    </section>
  );
}
