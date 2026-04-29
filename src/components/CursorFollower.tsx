import { useEffect, useRef, useState } from "react";

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) {
      setEnabled(false);
      return;
    }
    let dx = 0, dy = 0, rx = 0, ry = 0, mx = 0, my = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      dx += (mx - dx) * 0.35;
      dy += (my - dy) * 0.35;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dx - 4}px, ${dy - 4}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx - 24}px, ${ry - 24}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[90] w-12 h-12 rounded-full border border-primary/60 mix-blend-screen" style={{ boxShadow: "0 0 30px hsl(222 91% 58% / 0.6)" }} />
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[90] w-2 h-2 rounded-full bg-primary" />
    </>
  );
}
