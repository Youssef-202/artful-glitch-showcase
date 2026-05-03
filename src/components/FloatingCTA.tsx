import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export default function FloatingCTA() {
  const { t, dir } = useLang();
  return (
    <motion.a
      href="https://wa.me/966553256499"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.common.ctaWhatsapp}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 z-[80] group ${dir === "rtl" ? "right-6" : "left-6"}`}
    >
      <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
      <span className="relative flex items-center gap-3 rounded-full bg-gradient-to-tr from-primary to-accent px-5 py-4 text-primary-foreground shadow-glow">
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline font-bold">{t.common.ctaContact}</span>
      </span>
    </motion.a>
  );
}
