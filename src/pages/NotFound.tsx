import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageProvider";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLang();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center glass-strong rounded-3xl p-10 max-w-md">
        <h1 className="mb-4 text-7xl font-black"><span className="text-gradient">404</span></h1>
        <p className="mb-6 text-lg text-muted-foreground">{t.common.pageNotFound}</p>
        <Link to="/" className="inline-block rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
          {t.common.backHome}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
