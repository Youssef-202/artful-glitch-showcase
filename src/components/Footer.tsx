import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const Tiktok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.6 6.3a5.3 5.3 0 0 1-3.4-1.2 5.3 5.3 0 0 1-1.9-3.1H11v13.1a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.3a5.8 5.8 0 1 0 5 5.7V8.7a8.4 8.4 0 0 0 5 1.6V7a5.3 5.3 0 0 1-.1-.7Z" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2H21l-6.52 7.45L22 22h-6.797l-4.713-6.18L4.8 22H2.04l6.99-7.99L2 2h6.91l4.27 5.65L18.244 2Zm-1.19 18h1.88L7.04 4H5.06l11.994 16Z" />
  </svg>
);

export default function Footer() {
  const socials = [
    { Icon: Linkedin, href: "https://www.linkedin.com/company/etqanagency", label: "LinkedIn" },
    { Icon: Tiktok, href: "https://www.tiktok.com/@etqanpagency?_r=1", label: "TikTok" },
    { Icon: XIcon, href: "https://x.com/etqanagency", label: "X (Twitter)" },
    { Icon: Instagram, href: "https://www.instagram.com/etqanagency", label: "Instagram" },
  ];

  const quickLinks = [
    { label: "الرئيسية", to: "/" },
    { label: "من نحن", to: "/about" },
    { label: "الخدمات", to: "/services" },
    { label: "أعمالنا", to: "/portfolio" },
    { label: "تواصل معنا", to: "/contact" },
  ];

  const contacts = [
    { Icon: MapPin, value: "الرياض - المملكة العربية السعودية", href: undefined as string | undefined },
    { Icon: Phone, value: "+966573511722", href: "tel:+966573511722" },
    { Icon: Mail, value: "info@etqan.com", href: "mailto:info@etqan.com" },
  ];

  return (
    <footer dir="rtl" className="relative mt-16">
      <div className="glass-strong w-full px-8 sm:px-12 lg:px-20 py-12 text-foreground">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col items-start gap-3">
            <img src={logo} alt="إتقان" className="w-24 h-auto" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              مستقبل مشروعك يبدأ الآن مع إتقان
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold mb-4 relative inline-block">
              الروابط السريعة
              <span className="absolute -bottom-1 right-0 w-8 h-0.5 bg-accent rounded-full" />
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-xs text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold mb-4 relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-1 right-0 w-8 h-0.5 bg-accent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {contacts.map(({ Icon, value, href }, i) => {
                const content = (
                  <div className="flex items-center gap-2.5 text-xs text-foreground/85 hover:text-foreground transition-colors">
                    <span className="flex-1 text-right" dir="ltr" style={{ textAlign: "right" }}>{value}</span>
                    <span className="w-8 h-8 rounded-lg glass-strong flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                );
                return (
                  <li key={i}>
                    {href ? <a href={href}>{content}</a> : content}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-bold mb-4 relative inline-block">
              تابعنا على
              <span className="absolute -bottom-1 right-0 w-8 h-0.5 bg-accent rounded-full" />
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              تابعنا على منصات التواصل الاجتماعي
            </p>
            <div className="flex gap-2.5">
              {socials.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative w-9 h-9 rounded-lg glass-strong flex items-center justify-center overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:rotate-[-6deg] hover:shadow-[0_8px_24px_-6px_hsl(var(--accent)/0.6)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/0 group-hover:ring-white/30 transition-all duration-300" />
                  <Icon className="relative w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-125 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
