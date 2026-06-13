import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Tag } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { supabaseExternal as supabase } from "@/integrations/supabase/external";

type ServiceRow = {
  id: string;
  number: string;
  title: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  price_from: number | null;
  currency: string;
};

export default function ServicesIndex() {
  const { t, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [items, setItems] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("services")
      .select("id,number,title,tagline,description,image_url,duration,price_from,currency")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setItems(((data as any) ?? []) as ServiceRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="px-6 py-12 max-w-7xl mx-auto">
      <header className="text-center mb-12">
        <p className="text-sm text-primary tracking-widest mb-3">{t.common.ourServices}</p>
        <h1 className="text-4xl sm:text-6xl font-black">
          <span className="text-gradient">{t.nav.services}</span>
        </h1>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((s, i) => (
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
                  {s.image_url && (
                    <img
                      src={s.image_url}
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                  <span className="absolute top-4 left-4 text-gradient font-black text-2xl">{s.number}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <h2 className="text-xl font-black">{s.title}</h2>
                    <Arrow className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  {s.tagline && <p className="text-sm text-primary mb-2">{s.tagline}</p>}
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{s.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {s.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.duration}
                      </span>
                    )}
                    {s.price_from != null && (
                      <span className="inline-flex items-center gap-1 text-accent font-bold">
                        <Tag className="w-3 h-3" /> من {Number(s.price_from).toLocaleString()} {s.currency}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-16">
              لا توجد خدمات منشورة بعد
            </div>
          )}
        </div>
      )}
    </div>
  );
}
