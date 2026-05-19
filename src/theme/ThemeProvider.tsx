import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, CSSProperties } from "react";

type Theme = "dark" | "light";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void };

const ThemeContext = createContext<Ctx | null>(null);

const CURTAIN_DURATION = 550;
const EASING = "cubic-bezier(0.76, 0, 0.24, 1)";

type Phase = "idle" | "falling" | "rising";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [phase, setPhase] = useState<Phase>("idle");
  const curtainColorRef = useRef<string>("");
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

    // Curtain color = the page background of the NEXT theme
    const styles = getComputedStyle(document.documentElement);
    // Temporarily read with class swap to grab next bg
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("light", "dark");
    root.classList.add(next);
    const nextBg = getComputedStyle(root).getPropertyValue("--background").trim();
    // Restore current
    root.classList.remove("light", "dark");
    root.classList.add(hadDark ? "dark" : "light");

    curtainColorRef.current = nextBg ? `hsl(${nextBg})` : (next === "dark" ? "#0a1a1a" : "#f3ede1");
    setPhase("falling");

    setTimeout(() => {
      setThemeState(next);
      setPhase("rising");
      setTimeout(() => {
        setPhase("idle");
        animatingRef.current = false;
      }, CURTAIN_DURATION + 60);
    }, CURTAIN_DURATION);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => applyTheme(t), [applyTheme]);
  const toggleTheme = useCallback(() => applyTheme(theme === "dark" ? "light" : "dark"), [applyTheme, theme]);

  const curtainStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: curtainColorRef.current,
    transformOrigin: "top",
    transform: phase === "falling" ? "scaleY(1)" : "scaleY(0)",
    transition: phase !== "idle" ? `transform ${CURTAIN_DURATION}ms ${EASING}` : "none",
    zIndex: 9997,
    pointerEvents: "none",
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
      <div aria-hidden style={curtainStyle} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
