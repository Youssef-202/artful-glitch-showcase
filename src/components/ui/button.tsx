import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden isolate",
  {
    variants: {
      variant: {
        default: "text-primary-foreground hover:scale-[1.03] active:scale-[0.99]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const LiquidLayers = () => (
  <>
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] -z-10"
      style={{
        backdropFilter: 'url("#liquid-glass-filter") blur(2px) saturate(170%)',
        WebkitBackdropFilter: "blur(2px) saturate(170%)",
        background:
          "linear-gradient(135deg, hsl(var(--primary) / 0.28), hsl(var(--accent) / 0.18))",
        border: "1px solid hsl(var(--primary) / 0.4)",
        boxShadow:
          "inset 0 1px 0 0 hsl(0 0% 100% / 0.4), inset 0 -1px 0 0 hsl(0 0% 0% / 0.08), 0 8px 32px -8px hsl(var(--primary) / 0.35)",
      }}
    />
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] -z-10"
      style={{
        background:
          "linear-gradient(180deg, hsl(0 0% 100% / 0.35) 0%, hsl(0 0% 100% / 0.08) 45%, transparent 60%)",
      }}
    />
  </>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isLiquid = !variant || variant === "default";
    const content = isLiquid ? (
      <>
        <LiquidLayers />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </>
    ) : (
      children
    );
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
