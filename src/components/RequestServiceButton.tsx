import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";

type Props = {
  serviceKey: string;
  serviceNameAr: string;
  serviceNameEn?: string;
  label?: string;
};

export default function RequestServiceButton({ serviceKey, serviceNameAr, serviceNameEn, label }: Props) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [desc, setDesc] = useState("");

  const submit = async () => {
    if (!user) {
      toast.info("سجّل دخول أولاً علشان تقدر تطلب الخدمة");
      nav("/auth");
      return;
    }
    setBusy(true);
    const description = desc.trim().slice(0, 2000) || null;
    const { error } = await supabase.from("service_orders").insert({
      user_id: user.id,
      service_key: serviceKey,
      service_name_ar: serviceNameAr,
      service_name_en: serviceNameEn ?? null,
      description,
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Build WhatsApp message and open it so the request is sent to the site's WhatsApp
    const lines = [
      "طلب خدمة جديد 🚀",
      `الخدمة: ${serviceNameAr}${serviceNameEn ? ` (${serviceNameEn})` : ""}`,
      `كود الخدمة: ${serviceKey}`,
      `العميل: ${user.email ?? user.id}`,
      description ? `التفاصيل:\n${description}` : "بدون تفاصيل إضافية",
    ];
    const waUrl = `https://wa.me/966573511722?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    toast.success("تم استلام طلبك ✓ وتم تحويلك للواتساب لتأكيد التفاصيل");
    setOpen(false);
    setDesc("");
    nav("/account");
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" /> {label || "اطلب الخدمة الآن"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" onClick={close}>
          <div
            className="glass-strong rounded-3xl p-6 w-full max-w-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black">طلب: {serviceNameAr}</h3>
            <p className="text-sm text-muted-foreground">
              احكيلنا تفاصيل مشروعك وهيتواصل معاك فريقنا لتأكيد التفاصيل وطريقة الدفع.
            </p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="اكتب تفاصيل المشروع، الميزانية المتوقعة، الموعد المرغوب..."
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center gap-2 justify-end">
              <button onClick={close} className="px-5 py-2.5 rounded-full font-bold text-sm hover:bg-foreground/5">
                إلغاء
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" /> {busy ? "جارِ الإرسال..." : "إرسال الطلب"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
