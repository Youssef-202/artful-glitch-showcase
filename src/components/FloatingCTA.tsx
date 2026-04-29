import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function FloatingCTA() {
  return (
    <motion.a
      href="https://wa.me/9665XXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[80] group"
    >
      <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
      <span className="relative flex items-center gap-3 rounded-full bg-gradient-to-tr from-primary to-accent px-5 py-4 text-primary-foreground shadow-glow">
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline font-bold">تواصل معنا</span>
      </span>
    </motion.a>
  );
}
