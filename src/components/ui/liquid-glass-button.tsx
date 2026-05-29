"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
  "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-primary-foreground hover:scale-105 duration-300 transition",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10",
        xxl: "h-14 rounded-md px-12 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(liquidbuttonVariants({ variant, size, className }))}
        {...props}
      >
        {/* Glass distortion layer */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] -z-10"
          style={{
            backdropFilter: 'url("#liquid-glass-filter") blur(2px) saturate(160%)',
            WebkitBackdropFilter: 'blur(2px) saturate(160%)',
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.28), hsl(var(--accent) / 0.18))",
            border: "1px solid hsl(var(--primary) / 0.4)",
            boxShadow:
              "inset 0 1px 0 0 hsl(0 0% 100% / 0.4), inset 0 -1px 0 0 hsl(0 0% 0% / 0.08), 0 8px 32px -8px hsl(var(--primary) / 0.35)",
          }}
        />
        {/* Glossy highlight */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] -z-10"
          style={{
            background:
              "linear-gradient(180deg, hsl(0 0% 100% / 0.35) 0%, hsl(0 0% 100% / 0.08) 45%, transparent 60%)",
          }}
        />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </Comp>
    );
  },
);
LiquidButton.displayName = "LiquidButton";

function GlassFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="liquid-glass-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="5" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

export { LiquidButton, liquidbuttonVariants, GlassFilter };
