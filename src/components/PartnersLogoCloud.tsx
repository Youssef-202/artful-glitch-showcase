import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import { useLang } from "@/i18n/LanguageProvider";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export default function PartnersLogoCloud() {
  const { dir } = useLang();
  const [items, setItems] = useState<Partner[]>([]);

  useEffect(() => {
    supabase
      .from("partners")
      .select("id,name,logo_url,website_url")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data as any) ?? []));
  }, []);

  const withLogos = items.filter((p) => !!p.logo_url);

  return (
    <section className="relative px-6 py-20 max-w-7xl mx-auto" dir={dir}>
      <div className="text-center mb-10">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          PARTNERS
        </p>
        <h2 className="text-3xl sm:text-5xl font-black">
          <span className="text-gradient">موثوق به من قِبل الخبراء</span>
        </h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base">
          نفخر بشراكتنا مع نخبة من العلامات التجارية الرائدة
        </p>
      </div>

      {withLogos.length > 0 ? (
        <LogoCloud
          logos={withLogos.map((p) => ({
            src: p.logo_url as string,
            alt: p.name,
            href: p.website_url ?? undefined,
          }))}
        />
      ) : (
        <div className="text-center text-sm text-muted-foreground/70">
          سيتم عرض شعارات الشركاء هنا قريباً
        </div>
      )}
    </section>
  );
}
