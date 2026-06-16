import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/external";
import { useLang } from "@/i18n/LanguageProvider";

type Item = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
};

export default function Testimonials() {
  const { dir } = useLang();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id,name,role,quote,avatar_url")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data as any) ?? []));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="relative py-20" dir={dir}>
      <div className="px-6 max-w-7xl mx-auto text-center mb-12">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          TESTIMONIALS
        </p>
        <h2 className="text-3xl sm:text-5xl font-black">
          <span className="text-gradient font-sans font-extrabold">شركاء النجاح</span>
        </h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base">
          آراء عملائنا تعكس شغفنا بالتميّز
        </p>
      </div>

      <div className="px-6 max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative glass rounded-3xl border border-border/50 p-8 text-center hover:border-primary/60 hover:shadow-glow transition-all"
          >
            <Quote className="absolute top-5 right-5 w-6 h-6 text-primary/40" />
            <blockquote className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-6">
              “{t.quote}”
            </blockquote>
            <figcaption className="flex flex-col items-center gap-2">
              {t.avatar_url && (
                <img
                  src={t.avatar_url}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/40"
                />
              )}
              <div>
                <p className="font-bold text-lg">{t.name}</p>
                {t.role && <p className="text-sm text-muted-foreground mt-1">{t.role}</p>}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
