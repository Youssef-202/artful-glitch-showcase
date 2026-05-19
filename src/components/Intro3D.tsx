import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import logo3d from "@/assets/etqan-logo-3d.png";

export default function Intro3D() {
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState<"in" | "settle">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("settle"), 1400);
    const t2 = setTimeout(() => setShow(false), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === "settle" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none"
          style={{ background: "#020617" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(95,217,207,0.22), transparent 60%)",
            }}
          />

          {/* Animated radial pulse */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 2, opacity: [0, 0.4, 0] }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: 420,
              height: 420,
              background:
                "radial-gradient(circle, rgba(95,217,207,0.45) 0%, transparent 70%)",
            }}
          />

          {/* Logo — matches hero color/style, scales down to feel continuous */}
          <motion.img
            src={logo3d}
            alt=""
            initial={{ opacity: 0, scale: 1.4, filter: "blur(14px)" }}
            animate={{
              opacity: 1,
              scale: stage === "settle" ? 0.55 : 1,
              filter: "blur(0px)",
            }}
            transition={{
              opacity: { duration: 0.7, ease: "easeOut" },
              scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 0.7, ease: "easeOut" },
            }}
            className="relative z-10 w-auto h-auto max-w-[80vw] object-contain"
            style={{
              maxHeight: "55vh",
              filter:
                "drop-shadow(0 0 24px rgba(95,217,207,0.7)) drop-shadow(0 0 60px rgba(95,217,207,0.4))",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
