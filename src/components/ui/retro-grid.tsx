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

    const cellWidth = 120;
    const cellDepth = 80;
    const numCellsWide = 16;
    const numCellsDeep = 20;

    const cameraX = 0;
    const cameraY = 60;
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
      // Sort by layer (far first)
      const layers = [0, 1, 2];
      for (const layer of layers) {
        const layerBuildings = buildings.filter((b) => b.layer === layer);
        const depthAlpha = 0.35 + layer * 0.25;
        const fillBase = `rgba(${Math.round(rgb.r * (0.04 + layer * 0.03))}, ${Math.round(
          rgb.g * (0.08 + layer * 0.06)
        )}, ${Math.round(rgb.b * (0.06 + layer * 0.04))}, ${depthAlpha + 0.45})`;
        const edge = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.35 + layer * 0.2})`;

        for (const b of layerBuildings) {
          const top = horizonY - b.h;
          // Body
          ctx.fillStyle = fillBase;
          ctx.fillRect(b.x, top, b.w, b.h);

          // Futuristic roof shapes
          if (b.futuristic > 0.7) {
            // Stepped pyramid
            ctx.fillStyle = fillBase;
            ctx.fillRect(b.x + b.w * 0.15, top - b.h * 0.08, b.w * 0.7, b.h * 0.08);
            ctx.fillRect(b.x + b.w * 0.3, top - b.h * 0.14, b.w * 0.4, b.h * 0.06);
          } else if (b.futuristic > 0.4) {
            // Slanted top
            ctx.beginPath();
            ctx.moveTo(b.x, top);
            ctx.lineTo(b.x + b.w, top - b.h * 0.08);
            ctx.lineTo(b.x + b.w, top);
            ctx.closePath();
            ctx.fill();
          }

          // Antenna / spire
          if (b.antenna) {
            ctx.strokeStyle = edge;
            ctx.lineWidth = 1;
            const ax = b.x + b.w * 0.5;
            ctx.beginPath();
            ctx.moveTo(ax, top - b.h * 0.05);
            ctx.lineTo(ax, top - b.h * 0.05 - 18 - layer * 6);
            ctx.stroke();
            // Blinking tip light
            const blink = (Math.sin(frame * 0.05 + b.x) + 1) * 0.5;
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g + 30}, ${rgb.b}, ${0.4 + blink * 0.6})`;
            ctx.beginPath();
            ctx.arc(ax, top - b.h * 0.05 - 18 - layer * 6, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Edge highlight
          ctx.strokeStyle = edge;
          ctx.lineWidth = 1;
          ctx.strokeRect(b.x + 0.5, top + 0.5, b.w - 1, b.h - 1);

          // Windows (lit) — denser/brighter for closer layers
          const winAlphaBase = 0.25 + layer * 0.3;
          const padX = b.w * 0.12;
          const padY = b.h * 0.08;
          const gridW = b.w - padX * 2;
          const gridH = b.h - padY * 2;
          const cw = gridW / b.windowCols;
          const ch = gridH / b.windowRows;
          const winW = Math.max(1, cw * 0.55);
          const winH = Math.max(1, ch * 0.5);
          for (let wr = 0; wr < b.windowRows; wr++) {
            for (let wc = 0; wc < b.windowCols; wc++) {
              const s = seeded(b.x * 13 + wr * 7 + wc * 31 + layer * 101);
              if (s < 0.35) continue; // dark window
              const flicker = (Math.sin(frame * 0.04 + s * 50) + 1) * 0.5;
              const a = winAlphaBase + flicker * 0.35;
              ctx.fillStyle = `rgba(${Math.min(255, rgb.r + 60)}, ${Math.min(
                255,
                rgb.g + 80
              )}, ${Math.min(255, rgb.b + 40)}, ${a})`;
              const wx = b.x + padX + wc * cw + (cw - winW) / 2;
              const wy = top + padY + wr * ch + (ch - winH) / 2;
              ctx.fillRect(wx, wy, winW, winH);
            }
          }
        }

        // Atmospheric haze between layers
        ctx.fillStyle = `rgba(${rgb.r * 0.1}, ${rgb.g * 0.15}, ${rgb.b * 0.1}, ${0.18 - layer * 0.05})`;
        ctx.fillRect(0, horizonY - 200, canvas.width, 200);
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
      cancelAnimationFrame(rafId);
    };
  }, [gridColor, showScanlines, glowEffect, showBuildings]);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
}

export default RetroGrid;
