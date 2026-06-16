import { useRef, useState } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/external";
import { cn } from "@/lib/utils";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  accept?: string;
  label?: string;
  className?: string;
};

export function FileUpload({ value, onChange, folder = "uploads", accept = "image/*,video/*", label = "ارفع ملف", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("الحجم أكبر من 50MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("تم الرفع ✓");
    } catch (e: any) {
      toast.error(e.message ?? "فشل الرفع");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (f) upload(f);
  };

  const isImage = value && /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(value);

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-background/50">
          {isImage ? (
            <img src={value} alt="" className="w-full h-40 object-cover" />
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
          <button type="button" onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-2 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition">
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground truncate p-2 border-t border-border/40">{value.split("/").pop()}</p>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed transition p-6 text-center",
            drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-foreground/5",
            busy && "pointer-events-none opacity-60"
          )}
        >
          {busy ? <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /> : <Upload className="w-8 h-8 mx-auto text-primary" />}
          <p className="mt-2 text-sm font-bold">{busy ? "جاري الرفع…" : label}</p>
          <p className="text-xs text-muted-foreground mt-1">اسحب الملف هنا أو اضغط — حتى 50MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
    </div>
  );
}
