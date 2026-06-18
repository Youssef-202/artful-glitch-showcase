import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

async function uploadOne(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function CoverUploader({
  value,
  onChange,
  folder = "covers",
  label = "صورة الغلاف",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div>
      <label className="block text-slate-300 text-xs font-semibold mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-28 h-20 rounded-lg border border-slate-700 bg-slate-900/60 overflow-hidden flex items-center justify-center text-slate-600">
          {value ? <img src={value} alt="cover" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" />}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="px-3 py-1.5 text-xs rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            رفع صورة
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 text-xs rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-1.5"
            >
              <X className="w-3 h-3" /> حذف
            </button>
          )}
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              setErr(null);
              try {
                const url = await uploadOne(f, folder);
                onChange(url);
              } catch (ex: any) {
                setErr(ex?.message || "فشل الرفع");
              } finally {
                setBusy(false);
                if (ref.current) ref.current.value = "";
              }
            }}
          />
        </div>
      </div>
      {err && <p className="text-xs text-rose-400 mt-1">{err}</p>}
    </div>
  );
}

export function GalleryUploader({
  value,
  onChange,
  folder = "gallery",
  label = "معرض الصور (يمكنك رفع 10 صور أو أكثر)",
  max = 50,
}: {
  value: string[] | null | undefined;
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const items = value || [];

  const handleFiles = async (files: FileList) => {
    setBusy(true);
    setErr(null);
    try {
      const arr = Array.from(files).slice(0, max - items.length);
      const urls = await Promise.all(arr.map((f) => uploadOne(f, folder)));
      onChange([...items, ...urls]);
    } catch (ex: any) {
      setErr(ex?.message || "فشل الرفع");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-slate-300 text-xs font-semibold">
          {label} <span className="text-slate-500">({items.length}/{max})</span>
        </label>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy || items.length >= max}
          className="px-3 py-1.5 text-xs rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          إضافة صور
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center text-slate-500 text-xs">
          لا توجد صور بعد. يمكنك رفع 10 صور أو أكثر دفعة واحدة.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {items.map((url, i) => (
            <div key={url + i} className="relative group rounded-lg overflow-hidden border border-slate-800">
              <img src={url} alt={`gallery-${i}`} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                <button type="button" onClick={() => move(i, -1)} className="p-1 rounded bg-slate-800 text-slate-200 text-[10px]">→</button>
                <button type="button" onClick={() => move(i, 1)} className="p-1 rounded bg-slate-800 text-slate-200 text-[10px]">←</button>
                <button type="button" onClick={() => removeAt(i)} className="p-1 rounded bg-rose-500/30 text-rose-200">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <span className="absolute top-1 right-1 text-[10px] bg-slate-950/70 px-1.5 py-0.5 rounded text-cyan-300">#{i + 1}</span>
            </div>
          ))}
        </div>
      )}
      {err && <p className="text-xs text-rose-400 mt-1">{err}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-slate-300 text-xs font-semibold mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "w-full bg-slate-900/60 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 px-3 text-white text-sm focus:outline-none";
export const textareaCls = inputCls + " resize-none";
