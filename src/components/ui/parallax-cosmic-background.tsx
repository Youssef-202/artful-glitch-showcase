import React, { useEffect, useMemo } from 'react';

interface CosmicParallaxBgProps {
  head: string;
  text: string;
  loop?: boolean;
  className?: string;
}

const generateStarBoxShadow = (count: number): string => {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
};

export const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  head,
  text,
  loop = true,
  className = '',
}) => {
  const textParts = useMemo(() => text.split(',').map((p) => p.trim()), [text]);

  const smallStars = useMemo(() => generateStarBoxShadow(700), []);
  const mediumStars = useMemo(() => generateStarBoxShadow(200), []);
  const bigStars = useMemo(() => generateStarBoxShadow(100), []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--animation-iteration',
      loop ? 'infinite' : '1'
    );
  }, [loop]);

  const animClass = ['animGravity', 'animDont', 'animLet', 'animGo'];

  return (
    <section
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-b from-[hsl(176_60%_4%)] via-[hsl(176_55%_8%)] to-[hsl(176_69%_22%)] ${className}`}
      dir="ltr"
    >
      {/* Stars */}
      <div
        className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent rounded-full"
        style={{
          boxShadow: smallStars,
          animation: 'animStar 50s linear infinite',
        }}
      >
        <div
          className="absolute top-[2000px] w-[1px] h-[1px] bg-transparent rounded-full"
          style={{ boxShadow: smallStars }}
        />
      </div>

      <div
        className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent rounded-full"
        style={{
          boxShadow: mediumStars,
          animation: 'animStar 100s linear infinite',
        }}
      >
        <div
          className="absolute top-[2000px] w-[2px] h-[2px] bg-transparent rounded-full"
          style={{ boxShadow: mediumStars }}
        />
      </div>

      <div
        className="absolute top-0 left-0 w-[3px] h-[3px] bg-transparent rounded-full"
        style={{
          boxShadow: bigStars,
          animation: 'animStar 150s linear infinite',
        }}
      >
        <div
          className="absolute top-[2000px] w-[3px] h-[3px] bg-transparent rounded-full"
          style={{ boxShadow: bigStars }}
        />
      </div>

      {/* Horizon glow */}
      <div
        className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, hsl(176 70% 45% / 0.55) 0%, hsl(176 65% 30% / 0.3) 30%, transparent 70%)',
        }}
      />

      {/* Earth curve */}
      <div
        className="absolute -bottom-[60%] left-1/2 -translate-x-1/2 w-[200%] aspect-square rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, hsl(176 70% 35%) 0%, hsl(176 69% 18%) 40%, hsl(176 60% 6%) 70%)',
          boxShadow:
            '0 -30px 80px hsl(176 70% 45% / 0.5), inset 0 30px 60px hsl(176 80% 60% / 0.3)',
        }}
      />

      {/* Title */}
      <h1 className="absolute top-[28%] left-1/2 -translate-x-1/2 text-center text-white font-black tracking-[0.15em] text-5xl sm:text-7xl md:text-8xl lg:text-9xl whitespace-nowrap drop-shadow-[0_0_40px_hsl(176_70%_55%/0.6)]">
        {head.toUpperCase()}
      </h1>

      {/* Subtitle parts */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex gap-3 sm:gap-6 text-white/90 text-sm sm:text-lg md:text-xl font-bold tracking-widest">
        {textParts.map((part, index) => (
          <span
            key={index}
            className="inline-block opacity-0"
            style={{
              animation: `${animClass[index % animClass.length]} 8s ease-in-out var(--animation-iteration)`,
            }}
          >
            {part.toUpperCase()}
          </span>
        ))}
      </div>
    </section>
  );
};
