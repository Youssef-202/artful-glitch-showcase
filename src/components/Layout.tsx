import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <>
      
      {!location.pathname.startsWith("/dashboard") && <Navbar />}
      {!location.pathname.startsWith("/dashboard") && <FloatingCTA />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={cn("relative", !location.pathname.startsWith("/dashboard") ? "pt-24" : "mt-[30px]")}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {location.pathname === "/" && <Footer />}
    </>
  );
}
