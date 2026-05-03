import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const channels = [
    { icon: MessageCircle, label: t.contact.whatsapp, value: "+966 55 325 6499", href: "https://wa.me/966553256499" },
  ];

  return (
    <div className="px-6 max-w-5xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-black mb-4">
          <span className="text-gradient">{t.contact.title}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.contact.subtitle}</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {channels.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6 text-center hover:shadow-glow transition"
          >
            <c.icon className="w-7 h-7 text-primary mx-auto mb-3" />
            <p className="font-bold mb-1">{c.label}</p>
            <p className="text-sm text-muted-foreground">{c.value}</p>
          </motion.a>
        ))}
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={(e) => {
          e.preventDefault();
          toast.success(t.contact.formSend + " ✓");
          setForm({ name: "", email: "", message: "" });
        }}
        className="glass-strong rounded-3xl p-8 mb-16 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t.contact.formName}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t.contact.formEmail}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition"
          />
        </div>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={t.contact.formMessage}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition resize-none"
        />
        <button
          type="submit"
          className="rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
        >
          {t.contact.formSend}
        </button>
      </motion.form>
    </div>
  );
}
