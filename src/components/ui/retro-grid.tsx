import { useEffect, useRef } from "react";

interface RetroGridProps {
  gridColor?: string;
  showScanlines?: boolean;
  glowEffect?: boolean;
  showBuildings?: boolean;
  className?: string;
}

function RetroGrid({
  gridColor = "#10b981",
  showScanlines = true,
  glowEffect = true,
  showBuildings = true,
  className = "",
}: RetroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildBuildings();
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 16, g: 185, b: 129 };
    };

    // Deterministic pseudo-random for stable buildings between frames
    const seeded = (i: number) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    type ShapeKind = "tower" | "tapered" | "twin" | "dome" | "pyramid" | "obelisk" | "arc";

    type Building = {
      x: number;
      w: number;
      h: number;
      layer: number; // 0 far, 1 mid, 2 near
      windowCols: number;
      windowRows: number;
      antenna: boolean;
      spire: boolean;
      beam: boolean; // holographic light beam from roof
      shape: ShapeKind;
      seed: number;
    };

    type Drone = { x: number; y: number; speed: number; size: number; layer: number };
    let drones: Drone[] = [];

    let buildings: Building[] = [];

    const buildBuildings = () => {
      buildings = [];
      drones = [];
      const horizonY = canvas.height * 0.55;
      const maxH = horizonY * 0.95;
      const shapes: ShapeKind[] = ["tower", "tapered", "twin", "dome", "pyramid", "obelisk", "arc"];
      // 3 layers for parallax depth
      for (let layer = 0; layer < 3; layer++) {
        const scale = 0.55 + layer * 0.4;
        const minW = 28 * scale;
        const maxW = 95 * scale;
        let x = -60;
        let i = layer * 1000 + 17;
        while (x < canvas.width + 60) {
          const w = minW + seeded(i++) * (maxW - minW);
          const h = (0.3 + seeded(i++) * 0.7) * maxH * (0.45 + layer * 0.3);
          const shape = shapes[Math.floor(seeded(i++) * shapes.length)];
          buildings.push({
            x,
            w,
            h,
            layer,
            windowCols: Math.max(2, Math.floor(w / (7 + (2 - layer) * 2))),
            windowRows: Math.max(4, Math.floor(h / (8 + (2 - layer) * 2))),
            antenna: seeded(i++) > 0.45,
            spire: seeded(i++) > 0.7,
            beam: seeded(i++) > 0.82,
            shape,
            seed: i,
          });
          x += w + (layer === 2 ? 6 : 2);
        }
      }
      // Drones / flying vehicles
      const droneCount = 14;
      for (let d = 0; d < droneCount; d++) {
        const layer = d % 3;
        drones.push({
          x: seeded(d * 37) * canvas.width,
          y: canvas.height * (0.18 + seeded(d * 53) * 0.32),
          speed: (0.3 + seeded(d * 71) * 0.7) * (layer === 0 ? 0.3 : layer === 1 ? 0.6 : 1.1),
          size: 1 + layer * 0.6,
          layer,
        });
      }
    };


    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // --- Mouse interactivity ---
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false, px: 0, py: 0 };
    const onMouseMove = (e: MouseEvent) => {
      // Normalize to -1..1 (center = 0)
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      mouse.px = e.clientX;
      mouse.py = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
      mouse.active = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const cellWidth = 120;
    const cellDepth = 80;
    const numCellsWide = 16;
    const numCellsDeep = 20;

    let cameraX = 0;
    let cameraY = 60;
    const cameraZ = 400;
    const focalLength = 500;


    let offset = 0;
    const speed = 1.5;
    let rafId = 0;
    let frame = 0;

    const project3DTo2D = (x: number, y: number, z: number) => {
      const relX = x - cameraX;
      const relY = y - cameraY;
      const relZ = z - cameraZ;
      if (relZ <= 10) return null;
      const scale = focalLength / relZ;
      const screenX = canvas.width / 2 + relX * scale;
      const screenY = canvas.height * 0.5 - relY * scale;
      return { x: screenX, y: screenY, scale, z: relZ };
    };

    const drawCell = (x: number, z: number, zOffset: number) => {
      const actualZ = z - zOffset;
      if (actualZ < -cellDepth || actualZ > numCellsDeep * cellDepth) return;

      const topLeft = project3DTo2D(x - cellWidth / 2, 0, actualZ);
      const topRight = project3DTo2D(x + cellWidth / 2, 0, actualZ);
      const bottomLeft = project3DTo2D(x - cellWidth / 2, 0, actualZ + cellDepth);
      const bottomRight = project3DTo2D(x + cellWidth / 2, 0, actualZ + cellDepth);

      if (!topLeft || !topRight || !bottomLeft || !bottomRight) return;
      if (actualZ < 0) return;

      const distanceFactor = Math.min(1, actualZ / (numCellsDeep * cellDepth));
      const alpha = Math.max(0.3, 1 - distanceFactor * 0.7);
      const lineWidth = Math.max(1, 2.5 * (1 - distanceFactor * 0.5));

      if (glowEffect) {
        ctx.shadowBlur = 10 * (1 - distanceFactor);
        ctx.shadowColor = gridColor;
      }

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = gridColor;
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.moveTo(bottomLeft.x, bottomLeft.y);
      ctx.lineTo(bottomRight.x, bottomRight.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(topLeft.x, topLeft.y);
      ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const drawBuildings = (rgb: { r: number; g: number; b: number }) => {
      if (!showBuildings) return;
      const horizonY = canvas.height * 0.55;
      const neon = (a: number) =>
        `rgba(${Math.min(255, rgb.r + 80)}, ${Math.min(255, rgb.g + 60)}, ${Math.min(
          255,
          rgb.b + 100
        )}, ${a})`;
      const cyanNeon = (a: number) =>
        `rgba(${Math.min(255, rgb.r + 60)}, ${Math.min(255, rgb.g + 100)}, ${Math.min(
          255,
          rgb.b + 120
        )}, ${a})`;

      for (const layer of [0, 1, 2]) {
        const layerBuildings = buildings.filter((b) => b.layer === layer);
        const depthMul = 0.4 + layer * 0.3;
        const fillBase = `rgba(${Math.round(rgb.r * (0.03 + layer * 0.02))}, ${Math.round(
          rgb.g * (0.06 + layer * 0.04)
        )}, ${Math.round(rgb.b * (0.05 + layer * 0.03))}, ${depthMul + 0.5})`;
        const fillTop = `rgba(${Math.round(rgb.r * (0.06 + layer * 0.04))}, ${Math.round(
          rgb.g * (0.14 + layer * 0.08)
        )}, ${Math.round(rgb.b * (0.1 + layer * 0.05))}, ${depthMul + 0.55})`;
        const edge = `rgba(${rgb.r}, ${Math.min(255, rgb.g + 40)}, ${rgb.b}, ${0.4 + layer * 0.25})`;

        // Parallax shift per layer — closer layers move more
        const parallaxX = -mouse.x * (10 + layer * 22);
        const parallaxY = -mouse.y * (4 + layer * 8);
        ctx.save();
        ctx.translate(parallaxX, parallaxY);


        // Sort within layer for cleaner overlap (rear-first by x)
        for (const b of layerBuildings) {
          const top = horizonY - b.h;
          const cx = b.x + b.w / 2;

          // Vertical body gradient (darker bottom, lit top edge)
          const grad = ctx.createLinearGradient(0, top, 0, horizonY);
          grad.addColorStop(0, fillTop);
          grad.addColorStop(1, fillBase);
          ctx.fillStyle = grad;

          // --- Shape body ---
          ctx.beginPath();
          switch (b.shape) {
            case "tapered": {
              const inset = b.w * 0.15;
              ctx.moveTo(b.x, horizonY);
              ctx.lineTo(b.x + inset, top);
              ctx.lineTo(b.x + b.w - inset, top);
              ctx.lineTo(b.x + b.w, horizonY);
              break;
            }
            case "obelisk": {
              const inset = b.w * 0.35;
              ctx.moveTo(b.x, horizonY);
              ctx.lineTo(b.x + inset, top);
              ctx.lineTo(b.x + b.w - inset, top);
              ctx.lineTo(b.x + b.w, horizonY);
              break;
            }
            case "pyramid": {
              // Stepped silhouette
              const steps = 4;
              const sw = b.w / 2;
              for (let s = 0; s < steps; s++) {
                const t = s / steps;
                const sx = b.x + sw * t * 0.6;
                const sy = top + (b.h * t) / 1.5;
                const sxw = b.w - sw * t * 1.2;
                const sh = b.h - (b.h * t) / 1.5;
                ctx.rect(sx, sy, sxw, sh);
              }
              break;
            }
            case "dome": {
              const r = b.w / 2;
              ctx.moveTo(b.x, horizonY);
              ctx.lineTo(b.x, top + r);
              ctx.arc(cx, top + r, r, Math.PI, 0, false);
              ctx.lineTo(b.x + b.w, horizonY);
              break;
            }
            case "twin": {
              const gap = b.w * 0.18;
              const tw = (b.w - gap) / 2;
              ctx.rect(b.x, top, tw, b.h);
              ctx.rect(b.x + tw + gap, top + b.h * 0.05, tw, b.h - b.h * 0.05);
              // Skybridge
              ctx.rect(b.x + tw, top + b.h * 0.55, gap, b.h * 0.06);
              ctx.rect(b.x + tw, top + b.h * 0.25, gap, b.h * 0.04);
              break;
            }
            case "arc": {
              // Curved-top building
              ctx.moveTo(b.x, horizonY);
              ctx.lineTo(b.x, top + b.h * 0.15);
              ctx.quadraticCurveTo(cx, top - b.h * 0.05, b.x + b.w, top + b.h * 0.15);
              ctx.lineTo(b.x + b.w, horizonY);
              break;
            }
            case "tower":
            default: {
              ctx.rect(b.x, top, b.w, b.h);
            }
          }
          ctx.fill();

          // --- Neon edge accents ---
          ctx.strokeStyle = edge;
          ctx.lineWidth = layer === 2 ? 1.25 : 1;
          // Left vertical neon strip
          if (glowEffect) {
            ctx.shadowBlur = 6 + layer * 4;
            ctx.shadowColor = edge;
          }
          ctx.beginPath();
          ctx.moveTo(b.x + 1, horizonY);
          ctx.lineTo(b.x + 1, top + b.h * 0.1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(b.x + b.w - 1, horizonY);
          ctx.lineTo(b.x + b.w - 1, top + b.h * 0.1);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Mechanical floor bands (horizontal stripes)
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g + 30}, ${rgb.b}, ${0.18 + layer * 0.1})`;
          ctx.lineWidth = 0.5;
          const bandCount = Math.max(2, Math.floor(b.h / 22));
          for (let k = 1; k < bandCount; k++) {
            const by = top + (b.h * k) / bandCount;
            ctx.beginPath();
            ctx.moveTo(b.x + 2, by);
            ctx.lineTo(b.x + b.w - 2, by);
            ctx.stroke();
          }

          // --- Spire / antenna ---
          if (b.spire || b.antenna) {
            const ax = cx;
            const spireH = (b.spire ? 28 : 14) + layer * 8;
            ctx.strokeStyle = edge;
            ctx.lineWidth = b.spire ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(ax, top + (b.shape === "dome" ? -b.w / 2 + 2 : 2));
            ctx.lineTo(ax, top - spireH);
            ctx.stroke();
            // Tip blink
            const blink = (Math.sin(frame * 0.06 + b.seed) + 1) * 0.5;
            ctx.fillStyle = cyanNeon(0.45 + blink * 0.55);
            if (glowEffect) {
              ctx.shadowBlur = 8;
              ctx.shadowColor = cyanNeon(1);
            }
            ctx.beginPath();
            ctx.arc(ax, top - spireH, 1.8 + layer * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // --- Holographic beam from roof ---
          if (b.beam) {
            const bx = cx;
            const beamH = horizonY * 0.6;
            const beamGrad = ctx.createLinearGradient(0, top - beamH, 0, top);
            beamGrad.addColorStop(0, neon(0));
            beamGrad.addColorStop(0.7, neon(0.18));
            beamGrad.addColorStop(1, neon(0.35));
            ctx.fillStyle = beamGrad;
            const bw = 6 + layer * 4;
            ctx.beginPath();
            ctx.moveTo(bx - bw / 2, top);
            ctx.lineTo(bx + bw / 2, top);
            ctx.lineTo(bx + bw * 1.4, top - beamH);
            ctx.lineTo(bx - bw * 1.4, top - beamH);
            ctx.closePath();
            ctx.fill();
          }

          // --- Windows: vertical light strips for tall towers, grid for others ---
          const padX = b.w * 0.14;
          const padY = b.h * 0.08;
          const gridW = b.w - padX * 2;
          const gridH = b.h - padY * 2;

          if (b.shape === "tower" || b.shape === "tapered" || b.shape === "obelisk") {
            // Vertical neon light strips (more futuristic than window grid)
            const stripCount = Math.max(2, Math.floor(b.w / 9));
            for (let s = 0; s < stripCount; s++) {
              const sv = seeded(b.seed + s * 19);
              if (sv < 0.25) continue;
              const sx = b.x + padX + (gridW * (s + 0.5)) / stripCount;
              const stripTop = top + padY + b.h * 0.05 * sv;
              const stripBot = top + b.h - padY * 0.5;
              const flicker = (Math.sin(frame * 0.03 + sv * 40 + s) + 1) * 0.5;
              const a = 0.2 + layer * 0.15 + flicker * 0.25;
              ctx.strokeStyle = cyanNeon(a);
              ctx.lineWidth = 0.8 + layer * 0.3;
              ctx.beginPath();
              ctx.moveTo(sx, stripTop);
              ctx.lineTo(sx, stripBot);
              ctx.stroke();
            }
          }

          // Window grid (sparse, on top of strips for depth)
          const cw = gridW / b.windowCols;
          const ch = gridH / b.windowRows;
          const winW = Math.max(1, cw * 0.45);
          const winH = Math.max(1, ch * 0.4);
          for (let wr = 0; wr < b.windowRows; wr++) {
            for (let wc = 0; wc < b.windowCols; wc++) {
              const s = seeded(b.x * 13 + wr * 7 + wc * 31 + layer * 101);
              if (s < 0.55) continue;
              const flicker = (Math.sin(frame * 0.04 + s * 50) + 1) * 0.5;
              const a = 0.25 + layer * 0.25 + flicker * 0.3;
              ctx.fillStyle = `rgba(${Math.min(255, rgb.r + 80)}, ${Math.min(
                255,
                rgb.g + 120
              )}, ${Math.min(255, rgb.b + 60)}, ${a})`;
              const wx = b.x + padX + wc * cw + (cw - winW) / 2;
              const wy = top + padY + wr * ch + (ch - winH) / 2;
              ctx.fillRect(wx, wy, winW, winH);
            }
          }

          // Base glow / reflection on ground
          if (layer >= 1) {
            const baseGrad = ctx.createLinearGradient(0, horizonY - 4, 0, horizonY + 18 + layer * 6);
            baseGrad.addColorStop(0, neon(0.18 + layer * 0.08));
            baseGrad.addColorStop(1, neon(0));
            ctx.fillStyle = baseGrad;
            ctx.fillRect(b.x - 2, horizonY - 2, b.w + 4, 18 + layer * 6);
          }
        }
        ctx.restore();

        // Atmospheric haze between layers (cooler, greener)
        ctx.fillStyle = `rgba(${rgb.r * 0.08}, ${rgb.g * 0.18}, ${rgb.b * 0.1}, ${0.22 - layer * 0.07})`;
        ctx.fillRect(0, horizonY - 220, canvas.width, 220);
      }

      // --- Drones / hover-traffic (slight attraction toward mouse Y) ---
      for (const d of drones) {
        d.x += d.speed;
        if (d.x > canvas.width + 20) d.x = -20;
        const targetY = canvas.height * (0.18 + 0.32 * ((mouse.y + 1) / 2));
        d.y += (targetY - d.y) * 0.005 * (d.layer + 1);
        const trail = 18 + d.layer * 8;
        const tg = ctx.createLinearGradient(d.x - trail, d.y, d.x, d.y);
        tg.addColorStop(0, cyanNeon(0));
        tg.addColorStop(1, cyanNeon(0.6));
        ctx.strokeStyle = tg;
        ctx.lineWidth = d.size;
        ctx.beginPath();
        ctx.moveTo(d.x - trail, d.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
        if (glowEffect) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = cyanNeon(1);
        }
        ctx.fillStyle = cyanNeon(0.9);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- Interactive cursor glow ---
      if (mouse.active) {
        const glow = ctx.createRadialGradient(
          mouse.px,
          mouse.py,
          0,
          mouse.px,
          mouse.py,
          240
        );
        glow.addColorStop(0, cyanNeon(0.35));
        glow.addColorStop(0.4, cyanNeon(0.1));
        glow.addColorStop(1, cyanNeon(0));
        ctx.fillStyle = glow;
        ctx.fillRect(mouse.px - 240, mouse.py - 240, 480, 480);
      }
    };



    const drawScanlines = () => {
      if (!showScanlines) return;
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#000000";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      frame++;
      // Smooth mouse lerp
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      // Camera follows mouse subtly for a living parallax
      cameraX = mouse.x * 80;
      cameraY = 60 - mouse.y * 30;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rgb = hexToRgb(gridColor);

      // Green-tinted sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.55);
      skyGradient.addColorStop(0, `rgba(${rgb.r * 0.03}, ${rgb.g * 0.08}, ${rgb.b * 0.05}, 1)`);
      skyGradient.addColorStop(0.3, `rgba(${rgb.r * 0.05}, ${rgb.g * 0.15}, ${rgb.b * 0.08}, 1)`);
      skyGradient.addColorStop(0.5, `rgba(${rgb.r * 0.1}, ${rgb.g * 0.25}, ${rgb.b * 0.15}, 1)`);
      skyGradient.addColorStop(0.7, `rgba(${rgb.r * 0.15}, ${rgb.g * 0.35}, ${rgb.b * 0.2}, 1)`);
      skyGradient.addColorStop(0.85, `rgba(${rgb.r * 0.25}, ${rgb.g * 0.5}, ${rgb.b * 0.3}, 1)`);
      skyGradient.addColorStop(1, `rgba(${rgb.r * 0.35}, ${rgb.g * 0.65}, ${rgb.b * 0.4}, 1)`);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);

      // Draw buildings on horizon (before ground/grid for layering)
      drawBuildings(rgb);


      const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
      groundGradient.addColorStop(0, `rgba(${rgb.r * 0.08}, ${rgb.g * 0.18}, ${rgb.b * 0.1}, 1)`);
      groundGradient.addColorStop(0.3, `rgba(${rgb.r * 0.03}, ${rgb.g * 0.08}, ${rgb.b * 0.04}, 1)`);
      groundGradient.addColorStop(1, "#000000");
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);

      offset += speed;
      if (offset >= cellDepth) offset = 0;

      for (let row = -5; row < numCellsDeep + 5; row++) {
        const z = row * cellDepth;
        for (let col = -Math.floor(numCellsWide / 2); col <= Math.floor(numCellsWide / 2); col++) {
          const x = col * cellWidth;
          drawCell(x, z, offset);
        }
      }

      drawScanlines();

      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height * 0.3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.height * 0.8
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [gridColor, showScanlines, glowEffect, showBuildings]);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
}

export default RetroGrid;
