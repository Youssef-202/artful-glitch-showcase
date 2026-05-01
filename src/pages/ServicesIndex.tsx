import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { services } from "@/lib/services";

export default function ServicesIndex() {
  const { t, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

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
          const tr = t.services[s.id as keyof typeof t.services];
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                to={`/services/${s.id}`}
                className="group block glass rounded-3xl p-8 h-full hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-gradient font-black text-3xl">{s.number}</span>
                  <Arrow className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition" />
                </div>
                <h2 className="text-xl font-black mb-2">{tr.title}</h2>
                <p className="text-sm text-primary mb-3">{tr.tagline}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{tr.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
