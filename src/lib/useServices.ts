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
  homeNumber?: string;
  homeTitle?: string;
  homeTagline?: string;
  homeImage?: string;
};


export function useServices() {
  const [items, setItems] = useState<DisplayService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (supabase as any)
      .from("services")
      .select("id,number,title,tagline,description,image_url,sort_order,published")
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
