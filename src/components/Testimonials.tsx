import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageProvider";

type Item = { quote: string; name: string; role: string };

const items: Item[] = [
  {
    quote:
      "فريق إتقان غيّر شكل علامتنا التجارية بالكامل، نتائج فاقت توقعاتنا.",
    name: "أحمد المنصوري",
    role: "الرئيس التنفيذي",
  },
  {
    quote:
      "احترافية وسرعة في التنفيذ وإبداع لا يتوقف. شركاء نجاح حقيقيون.",
    name: "سارة الخالدي",
    role: "مديرة التسويق",
  },
  {
    quote:
      "تجربة مميزة من أول لقاء، فهموا فكرتنا ونفذوها بشكل أفضل مما تخيلنا.",
    name: "محمد عبدالله",
    role: "مؤسس",
  },
];

export default function Testimonials() {
  const { dir } = useLang();
  return (
    <section className="relative py-20" dir={dir}>
      <div className="px-6 max-w-7xl mx-auto text-center mb-12">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          TESTIMONIALS
        </p>
        <h2 className="text-3xl sm:text-5xl font-black">
          <span className="text-gradient">شركاء النجاح</span>
        </h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base">
          آراء عملائنا تعكس شغفنا بالتميّز
        </p>
      </div>

      <div className="px-6 max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-3xl border border-border/50 p-8 text-center hover:border-primary/60 hover:shadow-glow transition-all"
          >
            <blockquote className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-6">
              “{t.quote}”
            </blockquote>
            <figcaption>
              <p className="font-bold text-lg">{t.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.role}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
