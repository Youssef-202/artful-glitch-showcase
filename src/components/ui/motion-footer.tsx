"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;
}

@keyframes footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
}
@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }
[dir="rtl"] .animate-footer-scroll-marquee { animation-direction: reverse; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, hsl(var(--foreground) / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--foreground) / 0.05) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    hsl(var(--primary) / 0.30) 0%,
    hsl(var(--accent) / 0.18) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, hsl(var(--foreground) / 0.04) 0%, hsl(var(--foreground) / 0.01) 100%);
  box-shadow:
    0 10px 30px -10px hsl(var(--background) / 0.5),
    inset 0 1px 1px hsl(var(--foreground) / 0.10),
    inset 0 -1px 2px hsl(var(--background) / 0.8);
  border: 1px solid hsl(var(--foreground) / 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.footer-glass-pill:hover {
  background: linear-gradient(145deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--foreground) / 0.02) 100%);
  border-color: hsl(var(--primary) / 0.4);
  box-shadow:
    0 20px 40px -10px hsl(var(--primary) / 0.3),
    inset 0 1px 1px hsl(var(--foreground) / 0.2);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px hsl(var(--foreground) / 0.06);
  background: linear-gradient(180deg, hsl(var(--primary) / 0.18) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--foreground) / 0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 22px hsl(var(--primary) / 0.35));
}
`;

type MagneticButtonProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  href?: string;
};

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      const el = localRef.current;
      if (!el) return;
      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(el, { x: x * 0.35, y: y * 0.35, scale: 1.05, ease: "power2.out", duration: 0.4 });
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, scale: 1, ease: "elastic.out(1, 0.4)", duration: 1 });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        };
      }, el);
      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer inline-flex items-center justify-center", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

type Testimonial = { quote: string; name: string; role: string };
type Partner = { name: string; logo?: string };

export interface CinematicFooterProps {
  kicker?: string;
  giantText?: string;
  heading?: React.ReactNode;
  description?: string;
  marqueeItems?: string[];
  testimonials?: Testimonial[];
  partners?: Partner[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { quote: "فريق إتقان غيّر شكل علامتنا التجارية بالكامل، نتائج فاقت توقعاتنا.", name: "أحمد المنصوري", role: "الرئيس التنفيذي" },
  { quote: "احترافية وسرعة في التنفيذ وإبداع لا يتوقف. شركاء نجاح حقيقيون.", name: "سارة الخالدي", role: "مديرة التسويق" },
  { quote: "تجربة مميزة من أول لقاء، فهموا فكرتنا ونفذوها بشكل أفضل مما تخيلنا.", name: "محمد عبدالله", role: "مؤسس" },
];

const DEFAULT_PARTNERS: Partner[] = [
  { name: "Nova" }, { name: "Atlas" }, { name: "Orbit" }, { name: "Lumen" },
  { name: "Vertex" }, { name: "Pulse" }, { name: "Aria" }, { name: "Helix" },
];

const DEFAULT_MARQUEE = [
  "إبداع بإتقان ✦",
  "هوية بصرية متفرّدة ✦",
  "تسويق رقمي ذكي ✦",
  "شراكة في النجاح ✦",
  "نتائج تُروى ✦",
];

const MarqueeItem = ({ items }: { items: string[] }) => (
  <div className="flex shrink-0 items-center gap-12 px-6 text-sm sm:text-base font-bold text-foreground/40 tracking-[0.25em]">
    {items.map((t, i) => (
      <span key={i} className="whitespace-nowrap">{t}</span>
    ))}
  </div>
);

export function CinematicFooter({
  kicker = "إتقان × رؤيتك",
  giantText = "ETQAN",
  heading = (
    <>
      ثقة عملائنا
      <br />
      هي إنجازنا.
    </>
  ),
  description = "في وكالة إتقان نؤمن أن نجاح علامتك التجارية هو مقياس نجاحنا. نعمل بشغف وحرفية مع نخبة من الشركاء والعملاء.",
  marqueeItems = DEFAULT_MARQUEE,
  testimonials = DEFAULT_TESTIMONIALS,
  partners = DEFAULT_PARTNERS,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.85, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 60%",
            end: "center center",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(refresh);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <section
        ref={wrapperRef}
        dir="rtl"
        className="cinematic-footer-wrapper relative w-full overflow-hidden text-foreground"
      >
        {/* Grid background */}
        <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

        {/* Aurora glow */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="footer-aurora animate-footer-breathe absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] rounded-full" />
        </div>

        {/* Giant background text */}
        <div
          ref={giantTextRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center select-none"
        >
          <span className="footer-giant-bg-text">{giantText}</span>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-12">
          {/* Kicker */}
          <p className="text-center text-xs sm:text-sm tracking-[0.4em] text-primary font-bold mb-6">
            {kicker}
          </p>

          {/* Heading */}
          <div ref={headingRef} className="text-center max-w-4xl mx-auto">
            <h2 className="footer-text-glow text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              {heading}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Testimonials */}
          <div ref={linksRef} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <MagneticButton
                key={i}
                as="div"
                className="footer-glass-pill rounded-3xl p-6 text-right flex flex-col gap-4 h-full"
              >
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="border-t border-foreground/10 pt-3">
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
                </div>
              </MagneticButton>
            ))}
          </div>

          {/* Partners pills */}
          <div className="mt-14">
            <p className="text-center text-xs sm:text-sm tracking-[0.4em] text-primary font-bold mb-6">
              شركاء النجاح
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {partners.map((p, i) => (
                <MagneticButton
                  key={i}
                  as="div"
                  className="footer-glass-pill rounded-full px-6 py-3 min-w-[110px] text-center"
                >
                  {p.logo ? (
                    <img src={p.logo} alt={p.name} className="h-6 object-contain mx-auto" />
                  ) : (
                    <span className="font-bold text-sm sm:text-base text-foreground/90">{p.name}</span>
                  )}
                </MagneticButton>
              ))}
            </div>
          </div>

          {/* Marquee */}
          <div className="mt-20 overflow-hidden">
            <div className="flex w-max animate-footer-scroll-marquee">
              <MarqueeItem items={marqueeItems} />
              <MarqueeItem items={marqueeItems} />
              <MarqueeItem items={marqueeItems} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CinematicFooter;
