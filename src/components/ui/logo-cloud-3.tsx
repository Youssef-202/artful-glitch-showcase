import { InfiniteSlider } from "@/components/ui/infinite-slider";
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
  const minCount = 12;
  const repeats = Math.max(1, Math.ceil(minCount / Math.max(logos.length, 1)));
  const logosLoop = Array.from({ length: repeats }, () => logos).flat();
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-6",
        className
      )}
      {...props}
    >
      <InfiniteSlider gap={32} duration={30} durationOnHover={90}>
        {logosLoop.map((logo, i) => {
          const inner = logo.src ? (
            <img
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 120}
              height={logo.height ?? 40}
              loading="lazy"
              className={cn(
                "h-16 sm:h-20 w-auto object-contain transition",
                logo.cover
                  ? "opacity-100 drop-shadow-lg"
                  : "opacity-70 grayscale hover:opacity-100 hover:grayscale-0"
              )}
            />
          ) : (
            <span className={cn(
              "whitespace-nowrap text-2xl sm:text-3xl font-black transition",
              logo.cover ? "text-white drop-shadow-lg" : "text-foreground/70 hover:text-foreground"
            )}>
              {logo.alt}
            </span>
          );
          const content = logo.cover ? (
            <div
              className="relative h-24 w-48 rounded-2xl overflow-hidden bg-cover bg-center border border-border/40 shadow-elegant group"
              style={{ backgroundImage: `url(${logo.cover})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 group-hover:from-black/50 transition" />
              <div className="relative z-10 h-full w-full flex items-center justify-center px-4">
                {inner}
              </div>
            </div>
          ) : inner;
          return (
            <div
              key={`${logo.alt}-${i}`}
              className="flex h-28 items-center justify-center px-2"
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
      </InfiniteSlider>
    </div>
  );
}
