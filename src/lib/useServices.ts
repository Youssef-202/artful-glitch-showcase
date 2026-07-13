import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/external";
import { services as fallbackServices, type Service } from "./services";

export type DisplayService = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  servicesPageImage?: string;
  homeNumber?: string;
  homeTitle?: string;
  homeTagline?: string;
  homeImage?: string;
  // Light-mode overrides
  imageLight?: string;
  servicesPageImageLight?: string;
  homeImageLight?: string;
  titleColorLight?: string;
  taglineColorLight?: string;
  homeTitleColorLight?: string;
  homeTaglineColorLight?: string;
};


export function useServices() {
  const [items, setItems] = useState<DisplayService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (supabase as any)
      .from("services")
      .select("id,number,title,tagline,description,image_url,services_page_image_url,home_number,home_title,home_tagline,home_image_url,sort_order,published,image_url_light,services_page_image_url_light,home_image_url_light,title_color_light,tagline_color_light,home_title_color_light,home_tagline_color_light")
      .eq("published", true)
      .order("sort_order", { ascending: true })

      .then(({ data }: any) => {
        if (!active) return;
        if (data && data.length) {
          setItems(
            data.map((d: any) => ({
              id: d.id,
              number: d.number ?? "",
              title: d.title ?? "",
              tagline: d.tagline ?? "",
              description: d.description ?? "",
              image: d.image_url || fallbackServices.find((f) => f.id === d.id)?.image || "",
              servicesPageImage: d.services_page_image_url ?? "",
              homeNumber: d.home_number ?? "",
              homeTitle: d.home_title ?? "",
              homeTagline: d.home_tagline ?? "",
              homeImage: d.home_image_url ?? "",
              imageLight: d.image_url_light ?? "",
              servicesPageImageLight: d.services_page_image_url_light ?? "",
              homeImageLight: d.home_image_url_light ?? "",
              titleColorLight: d.title_color_light ?? "",
              taglineColorLight: d.tagline_color_light ?? "",
              homeTitleColorLight: d.home_title_color_light ?? "",
              homeTaglineColorLight: d.home_tagline_color_light ?? "",
            }))

          );
        } else {
          setItems(
            fallbackServices.map((s: Service) => ({
              id: s.id,
              number: s.number,
              title: s.title,
              tagline: s.tagline,
              description: s.description,
              image: s.image,
            }))
          );
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}
