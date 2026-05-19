import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Wand2, Star, Inbox, Clock, Tag, Award } from "lucide-react";
import aboutWho from "@/assets/about-who.png";
import aboutVision from "@/assets/about-vision.png";

const reasons = [
  {
    icon: Inbox,
    title: "الإبداع",
    body: "نقدّم خلفية متنوّعة في الإعلان والتصميم والعلامات التجارية والعلاقات العامة، بالإضافة إلى التخطيط الاستراتيجي للعمل في شركتك. لن تبدو موادك الخاصة بك رائعة فحسب، بل ستحصل أيضًا على نتائج.",
  },
  {
    icon: Wand2,
    title: "الاهتمام بالتفاصيل",
    body: "اهتمامنا بالأشياء الصغيرة وتخطيط الجداول الزمنية وإدارة المشاريع الصعبة هو ما يجعلنا متميّزين عن البقية. نحن مبدعون مع مراقبة دقيقة لميزانيتك.",
  },
  {
    icon: Star,
    title: "وضع خطة للنجاح",
    body: "تريد نتائج؟ لقد وجدنا أن أفضل طريقة للحصول عليها هي البحث المسبق لشركتك والمنافسين والسوق المستهدف. فقط بعد أن نفهمك أنت وعملاءك تمامًا، نوصي بخطة نجاح.",
  },
  {
    icon: Clock,
    title: "المواعيد والتسليمات",
    body: "لقد عملنا مع مجموعة مختارة من المؤسسات والوكالات الحكومية لسنوات عديدة. قاعدتهم: إذا فاتنا موعد نهائي فنحن خارج اللعبة. لقد حقّقنا بعضًا من أضيق التحوّلات في العمل، ولم نفوّت أيًّا منها على الإطلاق.",
  },
  {
    icon: Tag,
    title: "الأسعار",
    body: "أسعارنا تنافسية وعادلة. لا توجد فواتير مفاجئة، يجب أن توافق مسبقًا على أي نفقات غير متوقّعة أو إضافية. هذه هي الطريقة التي نودّ أن نُعامل بها، وهذه هي الطريقة التي يُعامل بها عملاؤنا الكرام.",
  },
  {
    icon: Award,
    title: "خبراء",
    body: "تتكوّن وكالة إتقان من متخصّصين في خدمات الإعلان والتصميم لديهم خبرة في الشركات والوكالات، يندرجون من خلفيات مختلفة. على هذا النحو، لن تقوم إتقان أبدًا بتعيين موظفي دعم من الدرجة الثانية لأي حساب.",
  },
];

export default function About() {
  return (
    <div className="px-6 max-w-7xl mx-auto space-y-16" dir="rtl">
      <header className="text-center mb-4">
        <p className="text-sm text-primary tracking-widest mb-3">تعرّف علينا</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-6">
          <span className="text-gradient">وكالة إتقان</span>
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
          <p className="text-sm text-primary tracking-widest mb-4">نبذة عنّا</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="text-gradient">من نحن</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            وكالة إتقان هي وكالة دعاية وإعلان متخصّصة في تقديم خدمات الإعلان والتصميم والتسويق الرقمي
            بأعلى مستوى من الدقة والاحترافية وبكل الطرق الممكنة. نرسم لعلامتك التجارية خطوطها العريضة
            بناءً على دراسة معمّقة للسوق والمنافسين، ونبدأ معك من البداية بتحديد الجدوى من المشروع
            واختيار الوسائل الإعلانية الأكثر تأثيراً، لنعمل جاهدين على تحقيق كافة الأهداف التي تطمح
            إليها علامتك.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
            تواصل معنا <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center justify-center order-1 lg:order-2">
          <img src={aboutWho} alt="وكالة إتقان - من نحن" loading="lazy" width={1024} height={832} className="w-full max-w-md" />
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
        <div className="flex items-center justify-center">
          <img src={aboutVision} alt="وكالة إتقان - رؤيتنا" loading="lazy" width={1024} height={832} className="w-full max-w-md" />
        </div>
        <div className="text-right">
          <p className="text-sm text-primary tracking-widest mb-4">إلى أين نتجه</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="text-gradient">رؤيتنا</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            تسعى وكالة إتقان لأن تكون الشريك الأول للمؤسسات والشركات في رحلة نموّها، عبر تقديم حلول
            إعلانية وتسويقية مبتكرة وقادرة على تحقيق أهداف علامتك بأذكى الطرق وأكثرها تأثيراً، لنصنع
            معاً قصص نجاح حقيقية تستحق أن تُروى.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
            تواصل معنا <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* لماذا تختارنا */}
      <section className="pt-8 pb-16">
        <div className="text-center mb-12">
          <p className="text-sm text-primary tracking-widest mb-3">ما يميّزنا</p>
          <h2 className="text-3xl sm:text-5xl font-black">
            <span className="text-gradient">لماذا تختارنا ؟</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-strong rounded-3xl p-7 hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-4 shadow-glow">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-black mb-3 text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
