import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  href?: string;
  width?: number;
  height?: number;
  cover?: string | null;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      className={cn("relative w-full py-6", className)}
      {...props}
    >
      <div className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
        <div className="flex gap-8 px-3 w-max">
          {logos.map((logo, i) => {
            const inner = logo.src ? (
              <img
                src={logo.src}
                alt={logo.alt}
                width={logo.width ?? 120}
                height={logo.height ?? 40}
                loading="lazy"
                className={cn(
                  "h-24 sm:h-32 w-auto object-contain transition",
                  logo.cover ? "opacity-100 drop-shadow-lg" : "opacity-90 hover:opacity-100"
                )}
              />
            ) : (
              <span
                className={cn(
                  "whitespace-nowrap text-3xl sm:text-4xl font-black transition",
                  logo.cover ? "text-white drop-shadow-lg" : "text-foreground/80 hover:text-foreground"
                )}
              >
                {logo.alt}
              </span>
            );
            const content = logo.cover ? (
              <div
                className="relative h-40 w-72 rounded-2xl overflow-hidden bg-cover bg-center border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] hover:border-emerald-400/70 transition group"
                style={{ backgroundImage: `url(${logo.cover})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 group-hover:from-black/50 transition" />
                <div className="relative z-10 h-full w-full flex items-center justify-center px-4">
                  {inner}
                </div>
              </div>
            ) : (
              <div className="relative h-40 w-72 rounded-2xl flex items-center justify-center px-6 bg-background/50 border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] hover:border-emerald-400/70 transition">
                {inner}
              </div>
            );
            return (
              <div
                key={`${logo.alt}-${i}`}
                className="flex h-48 sm:h-52 items-center justify-center shrink-0 snap-start"
              >
                {logo.href ? (
                  <a href={logo.href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
