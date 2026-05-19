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
};

export default function RequestServiceButton({ serviceKey, serviceNameAr, serviceNameEn }: Props) {
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
    const { error } = await supabase.from("service_orders").insert({
      user_id: user.id,
      service_key: serviceKey,
      service_name_ar: serviceNameAr,
      service_name_en: serviceNameEn ?? null,
      description: desc.trim().slice(0, 2000) || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم استلام طلبك بنجاح ✓");
    setOpen(false);
    setDesc("");
    nav("/account");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" /> اطلب الخدمة الآن
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="glass-strong rounded-3xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black">طلب: {serviceNameAr}</h3>
            <p className="text-sm text-muted-foreground">
              احكيلنا تفاصيل مشروعك علشان فريقنا يقدر يبدأ معاك فوراً.
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
              <button onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full font-bold text-sm hover:bg-foreground/5">
                إلغاء
              </button>
              <button onClick={submit} disabled={busy}
                className="px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50 inline-flex items-center gap-2">
                <Send className="w-4 h-4" /> {busy ? "جارِ الإرسال..." : "إرسال الطلب"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
