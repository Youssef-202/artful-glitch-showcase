import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, CSSProperties } from "react";

type Theme = "dark" | "light";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void };

const ThemeContext = createContext<Ctx | null>(null);

const CURTAIN_DURATION = 600;
const EASING = "cubic-bezier(0.76, 0, 0.24, 1)";

type Phase = "idle" | "prep" | "falling" | "swapped" | "rising";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme) || "light";
  });
  const [phase, setPhase] = useState<Phase>("idle");
  const [curtainColor, setCurtainColor] = useState<string>("");
  const animatingRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const applyTheme = useCallback((next: Theme) => {
    if (animatingRef.current) return;
    if (next === theme) return;
    animatingRef.current = true;

    // Read the NEXT theme's background by temporarily swapping the class
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("light", "dark");
    root.classList.add(next);
    const nextBg = getComputedStyle(root).getPropertyValue("--background").trim();
    root.classList.remove("light", "dark");
    root.classList.add(hadDark ? "dark" : "light");

    const color = nextBg ? `hsl(${nextBg})` : (next === "dark" ? "#0a1a1a" : "#f3ede1");
    setCurtainColor(color);

    // Phase 1: render curtain at scaleY(0), no transition (prep frame)
    setPhase("prep");

    // Phase 2: next frame -> trigger falling (scaleY 1) with transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("falling");
      });
    });

    // Phase 3: after fall completes, swap theme behind curtain
    setTimeout(() => {
      setThemeState(next);
      setPhase("swapped");
      // Phase 4: rise away
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("rising");
        });
      });
      setTimeout(() => {
        setPhase("idle");
        animatingRef.current = false;
      }, CURTAIN_DURATION + 80);
    }, CURTAIN_DURATION + 30);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => applyTheme(t), [applyTheme]);
  const toggleTheme = useCallback(() => applyTheme(theme === "dark" ? "light" : "dark"), [applyTheme, theme]);

  let transform = "scaleY(0)";
  let transformOrigin = "top";
  let transition: string = "none";
  if (phase === "prep") {
    transform = "scaleY(0)";
    transformOrigin = "top";
    transition = "none";
  } else if (phase === "falling") {
    transform = "scaleY(1)";
    transformOrigin = "top";
    transition = `transform ${CURTAIN_DURATION}ms ${EASING}`;
  } else if (phase === "swapped") {
    transform = "scaleY(1)";
    transformOrigin = "bottom";
    transition = "none";
  } else if (phase === "rising") {
    transform = "scaleY(0)";
    transformOrigin = "bottom";
    transition = `transform ${CURTAIN_DURATION}ms ${EASING}`;
  }

  const curtainStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: curtainColor,
    transformOrigin,
    transform,
    transition,
    zIndex: 9999,
    pointerEvents: phase === "idle" ? "none" : "auto",
    willChange: "transform",
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
      {phase !== "idle" && <div aria-hidden style={curtainStyle} />}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
