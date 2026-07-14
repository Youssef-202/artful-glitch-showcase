import accountImg from "@/assets/services/account.png";
import photoImg from "@/assets/services/photo.png";
import contentImg from "@/assets/services/content.png";
import strategyImg from "@/assets/services/strategy.png";
import adsImg from "@/assets/services/ads.png";
import webImg from "@/assets/services/web.jpg";
import designImg from "@/assets/services/design.jpg";
import brandImg from "@/assets/services/brand.png";

export type Service = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  image: string;
};

export const services: Service[] = [
  {
    id: "account",
    image: accountImg,
    number: "01",
    title: "إدارة الحسابات",
    tagline: "حضور رقمي يصنع الأثر",
    description:
      "ندير حساباتكم على منصات التواصل الاجتماعي بفكر استراتيجي وتفاعل يومي يبني مجتمعاً حقيقياً حول علامتكم.",
    bullets: ["تخطيط محتوى شهري", "تفاعل وردود مباشرة", "تقارير أداء دورية"],
  },
  {
    id: "photo",
    image: photoImg,
    number: "02",
    title: "التصوير والإنتاج البصري",
    tagline: "كل صورة تحكي قصة",
    description:
      "جلسات تصوير احترافية وإنتاج فيديوهات بصرية تنقل هوية علامتكم بأسلوب سينمائي يلفت الأنظار.",
    bullets: ["تصوير منتجات", "فيديو إعلاني", "موشن جرافيك"],
  },
  {
    id: "content",
    image: contentImg,
    number: "03",
    title: "كتابة وصناعة المحتوى",
    tagline: "",
    description:
      "محتوى عربي إبداعي مُحسَّن لمحركات البحث ومنصات التواصل، يتحدث بلغة جمهوركم ويحرك قراراتهم.",
    bullets: ["مقالات ومدونات", "نصوص إعلانية", "كتابة هوية صوتية"],
  },
  {
    id: "strategy",
    image: strategyImg,
    number: "04",
    title: "الخطط والاستراتيجيات التسويقية",
    tagline: "خارطة طريق نحو النمو",
    description:
      "نبني لكم استراتيجية تسويقية شاملة تنطلق من تحليل عميق للسوق وتنتهي بأهداف قابلة للقياس.",
    bullets: ["تحليل المنافسين", "تحديد الجمهور", "خطة تنفيذية"],
  },
  {
    id: "ads",
    image: adsImg,
    number: "05",
    title: "إدارة الحملات الإعلانية",
    tagline: "إعلانات تحقق أهدافكم",
    description:
      "حملات مدفوعة على Meta وGoogle وTikTok بإدارة دقيقة للميزانية وتحسين مستمر لتعظيم العائد.",
    bullets: ["إعلانات مستهدفة", "تحسين A/B", "تتبع التحويلات"],
  },
  {
    id: "web",
    image: webImg,
    number: "06",
    title: "تطوير المواقع",
    tagline: "تجارب رقمية متكاملة",
    description:
      "مواقع سريعة، آمنة، ومتجاوبة بأحدث التقنيات، مصممة لتحويل الزوار إلى عملاء.",
    bullets: ["مواقع تعريفية", "متاجر إلكترونية", "تطبيقات ويب"],
  },
  {
    id: "design",
    image: designImg,
    number: "07",
    title: "التصميم الجرافيكي",
    tagline: "جمالٌ بمعنى",
    description:
      "تصاميم بصرية تجمع بين الإبداع والوظيفة، من المنشورات اليومية إلى المطبوعات الفاخرة.",
    bullets: ["منشورات سوشيال", "مطبوعات", "هويات بصرية"],
  },
  {
    id: "brand",
    image: brandImg,
    number: "08",
    title: "بناء العلامة التجارية",
    tagline: "هوية تُذكر وتُحب",
    description:
      "نبني علامتكم من الصفر: الاسم، الشعار، الألوان، الصوت، والقصة التي تربطكم بجمهوركم.",
    bullets: ["استراتيجية العلامة", "تصميم الشعار", "دليل الهوية"],
  },
];
