import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageProvider";
import { Sparkles, Target, Eye, Heart } from "lucide-react";

export default function About() {
  const { t } = useLang();
  const valueIcons = [Sparkles, Eye, Heart, Target];

  return (
    <div className="px-6 max-w-5xl mx-auto">
      <header className="text-center mb-12">
        <p className="text-sm text-primary tracking-widest mb-3">{t.about.kicker}</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-6">
          <span className="text-gradient">{t.about.title}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">{t.about.body}</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-strong rounded-3xl p-8">
          <Target className="w-8 h-8 text-primary mb-4" />
          <h2 className="text-2xl font-black mb-3">{t.about.missionTitle}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.about.missionBody}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-8">
          <Eye className="w-8 h-8 text-primary mb-4" />
          <h2 className="text-2xl font-black mb-3">{t.about.visionTitle}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.about.visionBody}</p>
        </motion.div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-center mb-6">
        <span className="text-gradient">{t.about.valuesTitle}</span>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {t.about.values.map((v, i) => {
          const Icon = valueIcons[i] ?? Sparkles;
          return (
            <motion.div
              key={v}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <Icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-bold text-sm">{v}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
