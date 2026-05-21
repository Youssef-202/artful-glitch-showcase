"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .cinematic-section .gsap-reveal { visibility: hidden; }

  .cinematic-section .bg-grid-theme {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .cinematic-section .text-3d-matte {
    color: hsl(var(--foreground));
    text-shadow:
      0 10px 30px hsl(var(--primary) / 0.25),
      0 2px 4px hsl(var(--primary) / 0.15);
  }

  .cinematic-section .text-primary-gradient {
    background: linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter: drop-shadow(0 12px 24px hsl(var(--primary) / 0.35));
  }

  .cinematic-section .premium-depth-card {
    background: linear-gradient(145deg, hsl(var(--primary) / 0.95) 0%, hsl(176 60% 6%) 100%);
    box-shadow:
      0 40px 100px -20px hsl(var(--primary) / 0.5),
      0 20px 40px -20px rgba(0,0,0,0.6),
      inset 0 1px 2px rgba(255,255,255,0.15),
      inset 0 -2px 4px rgba(0,0,0,0.6);
    border: 1px solid hsl(var(--primary) / 0.3);
    position: relative;
    overflow: hidden;
  }

  .cinematic-section .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 1;
    background: radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--accent) / 0.18) 0%, transparent 45%);
    mix-blend-mode: screen;
  }

  .cinematic-section .testimonial-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow:
      0 25px 50px -12px rgba(0,0,0,0.5),
      inset 0 1px 1px rgba(255,255,255,0.15);
  }

  .cinematic-section .partner-chip {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 12px 24px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15);
    color: #fff;
  }
`;

type Testimonial = { quote: string; name: string; role: string };
type Partner = { name: string; logo?: string };

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
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

export function CinematicHero({
  kicker = "إتقان × رؤيتك",
  tagline1 = "نصنع علامتك",
  tagline2 = "بإتقان حقيقي.",
  cardHeading = "ثقة عملائنا هي إنجازنا",
  cardDescription = "في وكالة إتقان نؤمن أن نجاح علامتك التجارية هو مقياس نجاحنا. نعمل بشغف وحرفية مع نخبة من الشركاء والعملاء لنحقق نتائج تُروى.",
  metricValue = 120,
  metricLabel = "مشروع ناجح",
  ctaHeading = "ابدأ رحلتك مع إتقان",
  ctaDescription = "انضم لقائمة شركائنا وعملائنا وحقق أهداف علامتك بأذكى الطرق.",
  testimonials = DEFAULT_TESTIMONIALS,
  partners = DEFAULT_PARTNERS,
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current) return;
        const rect = mainCardRef.current.getBoundingClientRect();
        mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-content", ".testimonial-card", ".partners-grid", ".metric-block"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      gsap.timeline({ delay: 0.2 })
        .to(".text-track", { duration: 1.4, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "expo.out", stagger: 0.15 });

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3000",
          pin: pinRef.current,
          pinType: "transform",
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });


      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.15, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .to(".card-content", { autoAlpha: 1, duration: 1 }, "-=0.5")
        .fromTo(".card-heading", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: "expo.out" }, "-=0.5")
        .fromTo(".card-desc", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out" }, "-=0.8")
        .fromTo(".metric-block", { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "back.out(1.4)" }, "-=0.6")
        .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 1.5, ease: "expo.out" }, "<")
        .fromTo(".testimonial-card",
          { y: 80, autoAlpha: 0, scale: 0.9 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.2, ease: "back.out(1.2)" }, "-=0.5")
        .to({}, { duration: 1.5 })
        .fromTo(".partners-grid", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" })
        .fromTo(".partner-chip",
          { y: 30, autoAlpha: 0, scale: 0.8 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: "back.out(1.5)" }, "-=0.5")
        .to({}, { duration: 2 })
        .to([".card-content"], { autoAlpha: 0, y: -40, duration: 1, ease: "power2.in" })
        .to(".main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut",
          duration: 1.5,
        }, "pullback")
        .to(".cta-wrapper", { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.5 }, "pullback")
        .to({}, { duration: 1 })
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.3 })
        .to(".cta-wrapper", { autoAlpha: 0, scale: 0.9, duration: 1 }, "<");
    }, containerRef);

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [metricValue]);



  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div ref={containerRef} className="cinematic-outer relative w-full">
        <div
          ref={pinRef}
          dir="rtl"
          className={cn(
            "cinematic-section relative w-full h-screen overflow-hidden bg-background",
            className
          )}
          {...props}
        >
          <div className="bg-grid-theme absolute inset-0 z-0" />


        {/* Hero text */}
        <div className="hero-text-wrapper absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <p className="text-track text-xs sm:text-sm tracking-[0.4em] text-primary font-bold mb-6">
            {kicker}
          </p>
          <h1 className="text-track text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] text-3d-matte">
            {tagline1}
          </h1>
          <h1 className="text-track text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] mt-2 text-primary-gradient">
            {tagline2}
          </h1>
        </div>

        {/* Main card */}
        <div
          ref={mainCardRef}
          className="main-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[80vh] rounded-[40px] premium-depth-card z-20 overflow-hidden"
        >
          <div className="card-sheen" />

          {/* Inner content */}
          <div className="card-content relative z-10 w-full h-full flex flex-col items-center justify-center px-6 sm:px-12 py-8 text-white">
            {/* Heading block — always visible, top */}
            <div className="card-head-block flex flex-col items-center text-center mb-6">
              <p className="text-xs sm:text-sm tracking-[0.4em] text-white/60 font-bold mb-3">آراء عملائنا</p>
              <h2 className="card-heading text-3xl sm:text-5xl font-black mb-3 max-w-3xl leading-tight">
                {cardHeading}
              </h2>
              <p className="card-desc text-sm sm:text-base text-white/70 max-w-xl leading-relaxed mb-4">
                {cardDescription}
              </p>
              <div className="metric-block flex items-baseline gap-2">
                <span className="counter-val text-4xl sm:text-5xl font-black text-primary-gradient">0</span>
                <span className="text-xs sm:text-sm text-white/60 font-bold">+ {metricLabel}</span>
              </div>
            </div>

            {/* Stage wrapper — testimonials & partners overlay each other */}
            <div className="stage-wrapper relative w-full max-w-5xl h-[280px] sm:h-[260px]">
              {/* Testimonials */}
              <div className="stage-testimonials absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
                  {testimonials.slice(0, 3).map((t, i) => (
                    <div key={i} className="testimonial-card rounded-2xl p-5 text-center flex flex-col justify-between h-full min-h-[200px]">
                      <p className="text-sm text-white/90 leading-relaxed mb-4 flex-1 flex items-center justify-center">"{t.quote}"</p>
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-sm font-bold text-white">{t.name}</p>
                        <p className="text-xs text-white/50 mt-1">{t.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partners */}
              <div className="stage-partners absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs sm:text-sm tracking-[0.4em] text-white/60 font-bold mb-5 text-center">
                  شركاء النجاح
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl">
                  {partners.map((p, i) => (
                    <div
                      key={i}
                      className="partner-chip rounded-xl px-5 py-3 sm:px-6 sm:py-4 min-w-[110px] text-center"
                    >
                      {p.logo ? (
                        <img src={p.logo} alt={p.name} className="h-7 object-contain mx-auto" />
                      ) : (
                        <span className="font-bold text-sm sm:text-base">{p.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Final CTA */}
        <div className="cta-wrapper absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 text-3d-matte max-w-4xl leading-tight">
            {ctaHeading}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            {ctaDescription}
          </p>
        </div>
        </div>
      </div>
    </>
  );

}

export default CinematicHero;
