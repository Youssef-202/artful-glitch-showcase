export type PortfolioCategory = "branding" | "web" | "design" | "photo";

export type PortfolioItem = {
  id: string;
  category: PortfolioCategory;
  titleAr: string;
  titleEn: string;
  clientAr: string;
  clientEn: string;
  color: string;
  accent: string;
  coverUrl?: string | null;
};

// Fallback used only if DB fetch fails / is empty
export const portfolioItemsFallback: PortfolioItem[] = [
  { id: "p1", category: "branding", titleAr: "هوية لونا", titleEn: "Luna Identity", clientAr: "لونا للعطور", clientEn: "Luna Perfumes", color: "#115e59", accent: "#5fd9cf" },
  { id: "p2", category: "web", titleAr: "متجر أوريون", titleEn: "Orion Store", clientAr: "أوريون", clientEn: "Orion", color: "#0d4f4a", accent: "#7fe3da" },
  { id: "p3", category: "design", titleAr: "حملة الرياض", titleEn: "Riyadh Campaign", clientAr: "ميسم", clientEn: "Maysam", color: "#1d7a73", accent: "#a7f0e8" },
  { id: "p4", category: "photo", titleAr: "إنتاج بصري ٢٠٢٤", titleEn: "Visual 2024", clientAr: "كيف", clientEn: "Kayf", color: "#0a3d3a", accent: "#5fd9cf" },
];

// Re-export name for backward compatibility
export const portfolioItems = portfolioItemsFallback;
