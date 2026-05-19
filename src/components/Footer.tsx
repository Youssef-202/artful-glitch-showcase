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
    { Icon: Linkedin, href: "https://linkedin.com" },
    { Icon: Tiktok, href: "https://tiktok.com" },
    { Icon: XIcon, href: "https://x.com" },
    { Icon: Instagram, href: "https://instagram.com" },
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
    <footer dir="rtl" className="relative mt-16 px-4 sm:px-6 pb-4">
      <div className="glass-strong rounded-2xl max-w-7xl mx-auto px-6 py-16 text-foreground">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4 order-1 lg:order-4">
            <img src={logo} alt="إتقان" className="w-28 h-auto" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              مستقبل مشروعك يبدأ الآن مع إتقان
            </p>
          </div>

          {/* Quick links */}
          <div className="order-2 lg:order-3">
            <h3 className="text-lg font-bold mb-5 relative inline-block">
              الروابط السريعة
              <span className="absolute -bottom-1 right-0 w-10 h-0.5 bg-accent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="order-3 lg:order-2">
            <h3 className="text-lg font-bold mb-5 relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-1 right-0 w-10 h-0.5 bg-accent rounded-full" />
            </h3>
            <ul className="space-y-4">
              {contacts.map(({ Icon, value, href }, i) => {
                const content = (
                  <div className="flex items-center gap-3 text-sm text-foreground/85 hover:text-foreground transition-colors">
                    <span className="text-sm flex-1 text-right" dir="ltr" style={{ textAlign: "right" }}>{value}</span>
                    <span className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
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
          <div className="order-4 lg:order-1">
            <h3 className="text-lg font-bold mb-5 relative inline-block">
              تابعنا على
              <span className="absolute -bottom-1 right-0 w-10 h-0.5 bg-accent rounded-full" />
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              تابعنا على منصات التواصل الاجتماعي
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl glass-strong flex items-center justify-center hover:bg-accent hover:scale-110 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} copyright
          </p>
        </div>
      </div>
    </footer>
  );
}
