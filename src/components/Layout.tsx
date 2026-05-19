import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";
import NeuralBackground from "./ui/flow-field-background";
import { useTheme } from "@/theme/ThemeProvider";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const { theme } = useTheme();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-radial-primary" />
        <NeuralBackground
          color={theme === "light" ? "#115e59" : "#5fd9cf"}
          trailColor={theme === "light" ? "240, 250, 248" : "5, 18, 18"}
          trailOpacity={theme === "light" ? 0.08 : 0.12}
          particleCount={700}
        />
      </div>
      <Navbar />
      <FloatingCTA />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative pt-24"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {location.pathname === "/" && <Footer />}
    </>
  );
}
