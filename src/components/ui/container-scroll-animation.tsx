"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import cityBg from "@/assets/futuristic-city-bg.jpg";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = (): [number, number] => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-0 lg:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-none lg:max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-white p-2 md:p-6 bg-white backdrop-blur-xl rounded-[30px] shadow-2xl"
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0a1a18] md:rounded-2xl flex items-center justify-center">
        <img
          src={cityBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
        {/* Animated lights overlay */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen">
          <div className="absolute top-[20%] left-[15%] w-24 h-24 rounded-full bg-cyan-400/40 blur-2xl animate-[city-flicker_2.3s_ease-in-out_infinite]" />
          <div className="absolute top-[35%] left-[60%] w-32 h-32 rounded-full bg-fuchsia-500/40 blur-3xl animate-[city-flicker_3.1s_ease-in-out_infinite_0.4s]" />
          <div className="absolute top-[55%] left-[30%] w-20 h-20 rounded-full bg-yellow-300/50 blur-2xl animate-[city-flicker_1.7s_ease-in-out_infinite_0.8s]" />
          <div className="absolute top-[65%] left-[75%] w-28 h-28 rounded-full bg-pink-400/40 blur-3xl animate-[city-flicker_2.6s_ease-in-out_infinite_0.2s]" />
          <div className="absolute top-[45%] left-[45%] w-16 h-16 rounded-full bg-blue-400/50 blur-2xl animate-[city-flicker_1.9s_ease-in-out_infinite_1.1s]" />
          <div className="absolute top-[75%] left-[10%] w-20 h-20 rounded-full bg-emerald-400/40 blur-2xl animate-[city-flicker_2.8s_ease-in-out_infinite_0.6s]" />
          <div className="absolute top-[25%] left-[85%] w-24 h-24 rounded-full bg-orange-400/40 blur-3xl animate-[city-flicker_3.4s_ease-in-out_infinite_1.3s]" />
        </div>
        {/* Scanning beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -inset-y-10 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl animate-[city-sweep_6s_linear_infinite]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
