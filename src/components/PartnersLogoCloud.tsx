import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import { useLang } from "@/i18n/LanguageProvider";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  website_url: string | null;
};

export default function PartnersLogoCloud() {
  const { dir } = useLang();
  const [items, setItems] = useState<Partner[]>([]);

  useEffect(() => {
    supabase
      .from("partners")
      .select("id,name,logo_url,cover_url,website_url")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data as any) ?? []));
  }, []);

 

  return (
    <section className="relative px-6 py-20 max-w-7xl mx-auto" dir={dir}>
      <div className="text-center mb-10">
        <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">
          {"\n"}
        </p>
        <h2 className="text-3xl font-black leading-tight sm:text-5xl">
          <span className="text-gradient text-6xl font-mono font-extrabold text-center text-slate-50 bg-slate-800">​شـــــركـــــــاء الــــــنـــــجــــاح</span>
          <br />
          <span className="text-foreground/80">​</span>
        </h2>
        <p className="mt-3 text-muted-foreground sm:text-base text-2xl font-mono my-px border-0">
          نفخر بشراكتنا مع نخبة من العلامات التجارية الرائدة
        </p>
      </div>

      {items.length > 0 ? (
        <LogoCloud
          logos={items.map((p) => ({
            src: p.logo_url ?? "",
            alt: p.name,
            href: p.website_url ?? undefined,
            cover: p.cover_url,
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
