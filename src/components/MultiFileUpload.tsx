import { useRef, useState } from "react";
import { Upload, Loader2, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/external";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  accept?: string;
  label?: string;
  maxSizeMB?: number;
  className?: string;
};

export function MultiFileUpload({
  value,
  onChange,
  folder = "uploads",
  accept = "image/*,video/*",
  label = "ارفع صور (يمكنك اختيار أكثر من ملف)",
  maxSizeMB = 50,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const uploadOne = async (file: File): Promise<string | null> => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`${file.name}: أكبر من ${maxSizeMB}MB`);
      return null;
    }
    const ext = file.name.split(".").pop() || "bin";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      toast.error(`${file.name}: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setProgress({ done: 0, total: arr.length });
    const uploaded: string[] = [];
    // Parallel batches of 3 for speed without overwhelming
    const batchSize = 3;
    for (let i = 0; i < arr.length; i += batchSize) {
      const batch = arr.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(uploadOne));
      results.forEach((u) => u && uploaded.push(u));
      setProgress({ done: Math.min(i + batchSize, arr.length), total: arr.length });
    }
    if (uploaded.length) {
      onChange([...value, ...uploaded]);
      toast.success(`تم رفع ${uploaded.length} ملف ✓`);
    }
    setProgress(null);
  };

  const removeAt = (i: number) => {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const isImage = (u: string) => /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(u);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !progress && inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed transition p-6 text-center",
          drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-foreground/5",
          progress && "pointer-events-none opacity-70"
        )}
      >
        {progress ? (
          <>
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-sm font-bold">
              جاري الرفع… {progress.done}/{progress.total}
            </p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-primary" />
            <p className="mt-2 text-sm font-bold">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              اسحب الملفات هنا أو اضغط — يمكنك اختيار عدد غير محدود · حتى {maxSizeMB}MB لكل ملف
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>{value.length} ملف مرفوع</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-destructive hover:underline"
            >
              مسح الكل
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {value.map((url, i) => (
              <div
                key={url + i}
                className="relative group rounded-xl overflow-hidden border border-border bg-background/50 aspect-square"
              >
                {isImage(url) ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 break-all">
                    {url.split("/").pop()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    className="p-1.5 rounded-md bg-background/90 text-foreground text-xs"
                    title="إلى اليسار"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    className="p-1.5 rounded-md bg-background/90 text-foreground text-xs"
                    title="إلى اليمين"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="p-1.5 rounded-md bg-destructive text-destructive-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="absolute top-1 left-1 text-[10px] font-bold bg-background/80 rounded px-1.5 py-0.5">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
