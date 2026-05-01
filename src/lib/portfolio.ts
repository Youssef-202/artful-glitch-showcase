export type PortfolioItem = {
  id: string;
  category: "branding" | "web" | "design" | "photo";
  titleAr: string;
  titleEn: string;
  clientAr: string;
  clientEn: string;
  color: string;
  accent: string;
};

export const portfolioItems: PortfolioItem[] = [
  { id: "p1", category: "branding", titleAr: "هوية لونا", titleEn: "Luna Identity", clientAr: "لونا للعطور", clientEn: "Luna Perfumes", color: "#115e59", accent: "#5fd9cf" },
  { id: "p2", category: "web", titleAr: "متجر أوريون", titleEn: "Orion Store", clientAr: "أوريون", clientEn: "Orion", color: "#0d4f4a", accent: "#7fe3da" },
  { id: "p3", category: "design", titleAr: "حملة الرياض", titleEn: "Riyadh Campaign", clientAr: "ميسم", clientEn: "Maysam", color: "#1d7a73", accent: "#a7f0e8" },
  { id: "p4", category: "photo", titleAr: "إنتاج بصري ٢٠٢٤", titleEn: "Visual 2024", clientAr: "كيف", clientEn: "Kayf", color: "#0a3d3a", accent: "#5fd9cf" },
  { id: "p5", category: "branding", titleAr: "هوية نسيم", titleEn: "Naseem Brand", clientAr: "نسيم", clientEn: "Naseem", color: "#125e58", accent: "#80e2d8" },
  { id: "p6", category: "web", titleAr: "منصة طرز", titleEn: "Tiraz Platform", clientAr: "طرز", clientEn: "Tiraz", color: "#0f504b", accent: "#6cdfd3" },
  { id: "p7", category: "design", titleAr: "كتالوج رواق", titleEn: "Rawaq Catalog", clientAr: "رواق", clientEn: "Rawaq", color: "#176e66", accent: "#9aebe1" },
  { id: "p8", category: "photo", titleAr: "جلسة سدرة", titleEn: "Sidra Shoot", clientAr: "سدرة", clientEn: "Sidra", color: "#08302d", accent: "#5fd9cf" },
  { id: "p9", category: "branding", titleAr: "هوية فلج", titleEn: "Falaj Brand", clientAr: "فلج", clientEn: "Falaj", color: "#10544f", accent: "#76e2d6" },
];
