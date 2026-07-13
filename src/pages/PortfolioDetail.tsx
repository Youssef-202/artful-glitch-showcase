import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Calendar, Clock, Tag, CheckCircle2 } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import { useTheme } from "@/theme/ThemeProvider";

export default function PortfolioDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { items, loading } = usePortfolio();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isAr = lang === "ar";

  const item = useMemo(() => items.find((p) => p.id === id), [items, id]);
  const related = useMemo(
    () => items.filter((p) => p.id !== id && p.category === item?.category).slice(0, 3),
    [items, id, item]
  );

  if (loading) {
    return <div className="px-4 max-w-5xl mx-auto py-20 text-center text-muted-foreground">…</div>;
  }

  if (!item) {
    return (
      <div className="px-4 max-w-5xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-black mb-4">{isAr ? "العمل غير موجود" : "Project not found"}</h1>
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-primary hover:underline">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? "العودة لمعرض الأعمال" : "Back to portfolio"}
        </Link>
      </div>
    );
  }

  const title = isAr ? item.titleAr : item.titleEn;
  const client = isAr ? item.clientAr : item.clientEn;
  const description = isAr ? item.descriptionAr : item.descriptionEn;
  const content = isAr ? item.contentAr : item.contentEn;
  const steps = (isAr ? item.processStepsAr : item.processStepsEn) ?? [];
  const categoryLabel = t.portfolio.categories[item.category];

  return (
    <div className="px-4 sm:px-8 max-w-6xl mx-auto pb-20">
      {/* Back */}
      <Link
        to="/portfolio"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition"
      >
        {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {isAr ? "العودة لمعرض الأعمال" : "Back to portfolio"}
      </Link>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 font-bold"
          style={{
            background: `linear-gradient(135deg, ${item.color}33, ${item.accent}33)`,
            color: item.accent,
          }}
        >
          <Tag className="w-3 h-3" /> {categoryLabel}
        </span>
        <h1 className="text-4xl sm:text-6xl font-black mb-4">
          <span className="text-gradient">{title}</span>
        </h1>
        {client && (
          <p className="text-lg text-muted-foreground mb-2">
            {isAr ? "العميل: " : "Client: "}
            <span className="text-foreground font-semibold">{client}</span>
          </p>
        )}
        {description && (
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mt-4">{description}</p>
        )}
      </motion.header>

      {/* Cover */}
      {((isLight && item.detailCoverUrlLight) || item.detailCoverUrl || item.coverUrl) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden glass mb-10 aspect-[16/9]"
          style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent})` }}
        >
          <img src={((isLight && item.detailCoverUrlLight) || item.detailCoverUrl || item.coverUrl)!} alt={title} className="w-full h-full object-cover" />
        </motion.div>
      )}

      {/* Meta strip */}
      {(item.year || item.duration || item.projectUrl) && (
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {item.year && (
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{isAr ? "السنة" : "Year"}</p>
                <p className="font-bold">{item.year}</p>
              </div>
            </div>
          )}
          {item.duration && (
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{isAr ? "المدة" : "Duration"}</p>
                <p className="font-bold">{item.duration}</p>
              </div>
            </div>
          )}
          {item.projectUrl && (
            <a
              href={item.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-foreground/5 transition"
            >
              <ExternalLink className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{isAr ? "رابط المشروع" : "Project link"}</p>
                <p className="font-bold truncate">{isAr ? "زيارة" : "Visit"}</p>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Story / content */}
      {content && (
        <section className="glass-strong rounded-3xl p-6 sm:p-10 mb-10">
          <h2 className="text-2xl font-black mb-4">{isAr ? "قصة المشروع" : "The Story"}</h2>
          <div className="prose prose-invert max-w-none whitespace-pre-line text-foreground/90 leading-relaxed">
            {content}
          </div>
        </section>
      )}

      {/* Process */}
      {steps.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-black mb-6">{isAr ? "كيف نُفّذ" : "How it was made"}</h2>
          <ol className="grid gap-4">
            {steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-5 flex gap-4 items-start"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center font-black shrink-0">
                  {i + 1}
                </div>
                <p className="text-foreground/90 leading-relaxed pt-1">{step}</p>
              </motion.li>
            ))}
          </ol>
        </section>
      )}

      {/* Gallery */}
      {item.galleryUrls && item.galleryUrls.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-black mb-6">{isAr ? "معرض الصور" : "Gallery"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.galleryUrls.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt={`${title} - ${i + 1}`}
                loading="lazy"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl w-full h-auto object-cover glass"
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty fallback */}
      {!content && steps.length === 0 && (!item.galleryUrls || item.galleryUrls.length === 0) && !description && (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground mb-10 flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-primary" />
          <p>{isAr ? "تفاصيل هذا العمل ستُضاف قريبًا." : "Details for this project are coming soon."}</p>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-black mb-6">{isAr ? "أعمال مشابهة" : "Related work"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/portfolio/${r.id}`}
                className="group glass rounded-2xl overflow-hidden block"
              >
                <div
                  className="aspect-[4/3]"
                  style={{ background: `linear-gradient(135deg, ${r.color}, ${r.accent})` }}
                >
                  {r.coverUrl && (
                    <img
                      src={r.coverUrl}
                      alt={isAr ? r.titleAr : r.titleEn}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary uppercase tracking-widest mb-1">
                    {t.portfolio.categories[r.category]}
                  </p>
                  <h3 className="font-bold line-clamp-1">{isAr ? r.titleAr : r.titleEn}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
