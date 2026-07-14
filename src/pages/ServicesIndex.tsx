import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { useServices } from "@/lib/useServices";
import { useTheme } from "@/theme/ThemeProvider";

export default function ServicesIndex() {
  const { t, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const { items: services } = useServices();
  const { theme } = useTheme();
  const isLight = theme === "light";


  return (
    <div className="px-6 py-12 max-w-7xl mx-auto">
      <header className="text-center mb-12">
        <p className="text-sm text-primary tracking-widest mb-3">{t.common.ourServices}</p>
        <h1 className="text-4xl sm:text-6xl font-black">
          <span className="text-gradient">{t.nav.services}</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => {
          const tr = (t.services as any)[s.id] ?? { title: s.title, tagline: s.tagline, description: s.description };
          const img = (isLight && s.servicesPageImageLight) || s.servicesPageImage || (isLight && s.imageLight) || s.image;
          const titleColor = (isLight && s.titleColorLight) || undefined;
          const taglineColor = (isLight && s.taglineColorLight) || undefined;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                to={`/services/${s.id}`}
                className="group block glass rounded-3xl overflow-hidden h-full hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-background/40">
                  <img
                    src={img}
                    alt={tr.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                  
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <h2 className="text-xl font-black" style={titleColor ? { color: titleColor } : undefined}>{tr.title}</h2>
                    <Arrow className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-sm text-primary mb-2" style={taglineColor ? { color: taglineColor } : undefined}>{tr.tagline}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tr.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
