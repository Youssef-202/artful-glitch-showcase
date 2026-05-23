import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  href?: string;
  width?: number;
  height?: number;
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
      <InfiniteSlider gap={56} duration={30} durationOnHover={90}>
        {logosLoop.map((logo, i) => {
          const content = logo.src ? (
            <img
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 120}
              height={logo.height ?? 40}
              loading="lazy"
              className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span className="whitespace-nowrap text-xl sm:text-2xl font-black text-foreground/70 hover:text-foreground transition">
              {logo.alt}
            </span>
          );
          return (
            <div
              key={`${logo.alt}-${i}`}
              className="flex h-16 items-center justify-center px-4"
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
