import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type PageSEO = {
  path: string;
  title?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
};

type SEOData = {
  site_name?: string;
  default_title?: string;
  default_description?: string;
  default_keywords?: string;
  default_og_image?: string;
  twitter_handle?: string;
  google_site_verification?: string;
  pages?: PageSEO[];
};

let cache: SEOData | null = null;
let inflight: Promise<SEOData | null> | null = null;

async function loadSeo(): Promise<SEOData | null> {
  if (cache) return cache;
  if (!inflight) {
    inflight = (supabase as any)
      .from("site_pages")
      .select("content")
      .eq("page_key", "seo")
      .maybeSingle()
      .then(({ data }: any) => {
        cache = (data?.content as SEOData) ?? null;
        return cache;
      })
      .catch(() => null);
  }
  return inflight;
}

function setMeta(attr: "name" | "property", key: string, value?: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!value) {
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function toAbsolute(url?: string) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    loadSeo().then((seo) => {
      if (!active || !seo) return;

      const page =
        seo.pages?.find((p) => (p.path || "/").replace(/\/$/, "") === pathname.replace(/\/$/, "")) ??
        undefined;

      const title = page?.title || seo.default_title || document.title;
      const description = page?.description || seo.default_description;
      const keywords = page?.keywords || seo.default_keywords;
      const image = toAbsolute(page?.og_image || seo.default_og_image);
      const url = `${window.location.origin}${pathname}`;

      if (title) document.title = title;
      setMeta("name", "description", description);
      setMeta("name", "keywords", keywords);
      if (seo.google_site_verification)
        setMeta("name", "google-site-verification", seo.google_site_verification);

      setMeta("property", "og:title", title);
      setMeta("property", "og:description", description);
      setMeta("property", "og:url", url);
      setMeta("property", "og:site_name", seo.site_name);
      if (image) {
        setMeta("property", "og:image", image);
        setMeta("property", "og:image:secure_url", image);
        setMeta("name", "twitter:image", image);
      }

      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:title", title);
      setMeta("name", "twitter:description", description);
      if (seo.twitter_handle)
        setMeta("name", "twitter:site", `@${seo.twitter_handle.replace(/^@/, "")}`);

      setLink("canonical", url);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
