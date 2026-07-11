import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import Layout from "@/components/Layout";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const ServicesIndex = lazy(() => import("./pages/ServicesIndex"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PortfolioDetail = lazy(() => import("./pages/PortfolioDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminGuide = lazy(() => import("./pages/admin/AdminGuide"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminPortfolio"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAccess = lazy(() => import("./pages/admin/AdminAccess"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminHero = lazy(() => import("./pages/admin/AdminHero"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen" />}>
              <Routes>
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-dashboard010" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="portfolio" element={<AdminPortfolio />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="access" element={<AdminAccess />} />
                  <Route path="seo" element={<AdminSEO />} />
                  <Route path="hero" element={<AdminHero />} />
                  <Route path="guide" element={<AdminGuide />} />
                </Route>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<ServicesIndex />} />
                  <Route path="/services/:id" element={<ServiceDetail />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/portfolio/:id" element={<PortfolioDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
