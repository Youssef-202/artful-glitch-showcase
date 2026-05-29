import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "./index.css";
import { GlassFilter } from "./components/ui/liquid-glass-button";

createRoot(document.getElementById("root")!).render(
  <>
    <GlassFilter />
    <App />
  </>,
);
