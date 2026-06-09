import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import aboutWho from "@/assets/about-who.png";
import aboutVision from "@/assets/about-vision.png";
import { supabase } from "@/integrations/supabase/client";

type Reason = { title: string; body: string };
type AboutContent = {
  header_kicker: string;
  header_title: string;
  who_kicker: string;
  who_title: string;
  who_body: string;
  who_image: string;
  who_image_fit?: "cover" | "contain";
  who_image_height?: number;
  vision_kicker: string;
  vision_title: string;
  vision_body: string;
  vision_image: string;
  vision_image_fit?: "cover" | "contain";
  vision_image_height?: number;
  reasons_kicker: string;
  reasons_title: string;
  reasons: Reason[];
};

const fallback: AboutContent = {
  header_kicker: "تعرّف علينا",
  header_title: "وكالة إتقان",
  who_kicker: "نبذة عنّا",
  who_title: "من نحن",
  who_body: "وكالة إتقان هي وكالة دعاية وإعلان متخصّصة في تقديم خدمات الإعلان والتصميم والتسويق الرقمي بأعلى مستوى من الدقة والاحترافية.",
  who_image: "",
  who_image_fit: "cover",
  who_image_height: 420,
  vision_kicker: "إلى أين نتجه",
  vision_title: "رؤيتنا",
  vision_body: "تسعى وكالة إتقان لأن تكون الشريك الأول للمؤسسات والشركات في رحلة نموّها.",
  vision_image: "",
  vision_image_fit: "cover",
  vision_image_height: 420,
  reasons_kicker: "ما يميّزنا",
  reasons_title: "لماذا تختارنا ؟",
  reasons: [],
};

export default function About() {
  const [c, setC] = useState<AboutContent>(fallback);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "about").maybeSingle()
      .then(({ data }: any) => { if (data?.content) setC({ ...fallback, ...(data.content as AboutContent) }); });
  }, []);

  return (
    <div className="px-6 max-w-7xl mx-auto space-y-16" dir="rtl">
      <header className="text-center mb-4">
        <p className="text-sm text-primary tracking-widest mb-3">{c.header_kicker}</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-6">
          <span className="text-gradient">{c.header_title}</span>
        </h1>
      </header>

      {/* من نحن */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="grid lg:grid-cols-2 gap-10 items-center glass-strong rounded-3xl p-8 lg:p-12"
      >
        <div className="text-right order-2 lg:order-1">
          <p className="text-sm text-primary tracking-widest mb-4">{c.who_kicker}</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="text-gradient">{c.who_title}</span>
          </h2>
          <p className="text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
            {c.who_body}
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
            تواصل معنا <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div
          className="order-1 lg:order-2 w-full rounded-2xl overflow-hidden bg-background/30"
          style={(c.who_image_fit ?? "cover") === "cover" ? { height: `${c.who_image_height ?? 420}px` } : { maxHeight: `${c.who_image_height ?? 420}px` }}
        >
          <img
            src={c.who_image || aboutWho}
            alt={c.who_title}
            loading="lazy"
            className={(c.who_image_fit ?? "cover") === "cover" ? "w-full h-full object-cover" : "w-full h-auto max-h-full object-contain mx-auto"}
          />
        </div>
      </motion.div>

      {/* رؤيتنا */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="grid lg:grid-cols-2 gap-10 items-center glass-strong rounded-3xl p-8 lg:p-12"
      >
        <div
          className="w-full rounded-2xl overflow-hidden bg-background/30"
          style={(c.vision_image_fit ?? "cover") === "cover" ? { height: `${c.vision_image_height ?? 420}px` } : { maxHeight: `${c.vision_image_height ?? 420}px` }}
        >
          <img
            src={c.vision_image || aboutVision}
            alt={c.vision_title}
            loading="lazy"
            className={(c.vision_image_fit ?? "cover") === "cover" ? "w-full h-full object-cover" : "w-full h-auto max-h-full object-contain mx-auto"}
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-primary tracking-widest mb-4">{c.vision_kicker}</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="text-gradient">{c.vision_title}</span>
          </h2>
          <p className="text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
            {c.vision_body}
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
            تواصل معنا <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* لماذا تختارنا */}
      {c.reasons.length > 0 && (
        <section className="pt-8 pb-16">
          <div className="text-center mb-12">
            <p className="text-sm text-primary tracking-widest mb-3">{c.reasons_kicker}</p>
            <h2 className="text-3xl sm:text-5xl font-black">
              <span className="text-gradient">{c.reasons_title}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.reasons.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-strong rounded-3xl p-7 hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-4 shadow-glow">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-black mb-3 text-foreground">{r.title}</h3>
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{r.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
