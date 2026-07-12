import { useMemo, useRef, useState } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Code, Minus, Eye, Pencil, Wand2, CornerDownLeft,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
  minHeight?: number;
  placeholder?: string;
};

/** ينظّف النص: يحذف &nbsp; والمسافات الغريبة ويفصل كل فقرة بسطر فارغ */
export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";
  let s = raw
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ");
  // ضمان سطر فارغ بين الفقرات
  s = s.replace(/\n{3,}/g, "\n\n");
  // إذا الفقرات ملزوقة بسطر واحد فقط بين نصوص عادية → حوّلها لسطرين
  s = s
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/([^\n])\n(?=[^\n\-\*\d#>`])/g, "$1\n\n");
  return s.trim();
}

/** معاينة Markdown بسيطة بدون مكتبات خارجية */
function renderPreview(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='px-1 py-0.5 rounded bg-slate-800 text-cyan-300'>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' class='text-cyan-400 underline'>$1</a>");

  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false, inOl = false, para: string[] = [];
  const flushPara = () => {
    if (para.length) { out.push(`<p class="mb-4 leading-8">${inline(para.join(" "))}</p>`); para = []; }
  };
  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushPara(); closeLists(); continue; }
    let m;
    if ((m = line.match(/^###\s+(.*)$/))) { flushPara(); closeLists(); out.push(`<h3 class="text-lg font-bold text-white mt-5 mb-2">${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^##\s+(.*)$/)))  { flushPara(); closeLists(); out.push(`<h2 class="text-xl font-bold text-cyan-300 mt-6 mb-3">${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^#\s+(.*)$/)))   { flushPara(); closeLists(); out.push(`<h1 class="text-2xl font-black text-white mt-6 mb-3">${inline(m[1])}</h1>`); continue; }
    if ((m = line.match(/^>\s+(.*)$/)))   { flushPara(); closeLists(); out.push(`<blockquote class="border-r-4 border-cyan-500/60 pr-3 my-4 text-slate-300 italic">${inline(m[1])}</blockquote>`); continue; }
    if (/^[-*]\s+/.test(line))            { flushPara(); if (inOl) { out.push("</ol>"); inOl = false; } if (!inUl) { out.push("<ul class='list-disc pr-6 mb-4 space-y-1'>"); inUl = true; } out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`); continue; }
    if (/^\d+\.\s+/.test(line))           { flushPara(); if (inUl) { out.push("</ul>"); inUl = false; } if (!inOl) { out.push("<ol class='list-decimal pr-6 mb-4 space-y-1'>"); inOl = true; } out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`); continue; }
    if (/^---+$/.test(line))              { flushPara(); closeLists(); out.push("<hr class='my-5 border-slate-700' />"); continue; }
    para.push(line);
  }
  flushPara(); closeLists();
  return out.join("\n");
}

export default function MarkdownEditor({ value, onChange, dir = "rtl", minHeight = 320, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");

  const wrap = (before: string, after = before, sample = "") => {
    const el = ref.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = value.slice(s, e) || sample;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.selectionStart = s + before.length; el.selectionEnd = s + before.length + sel.length; });
  };

  const prefixLines = (prefix: string, sample = "نص") => {
    const el = ref.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = value.slice(s, e) || sample;
    const replaced = sel.split("\n").map((l) => (l.trim() ? prefix + l : l)).join("\n");
    const next = value.slice(0, s) + replaced + value.slice(e);
    onChange(next);
  };

  const insertBlock = (block: string) => {
    const el = ref.current; if (!el) { onChange((value ? value + "\n\n" : "") + block); return; }
    const s = el.selectionStart;
    const before = value.slice(0, s);
    const needsBreak = before && !before.endsWith("\n\n");
    const prefix = needsBreak ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const next = before + prefix + block + "\n\n" + value.slice(s);
    onChange(next);
  };

  const clean = () => onChange(normalizeMarkdown(value));

  const previewHtml = useMemo(() => renderPreview(value || ""), [value]);

  const ToolBtn = ({ icon: Icon, label, onClick }: any) => (
    <button type="button" onClick={onClick} title={label}
      className="w-8 h-8 flex items-center justify-center rounded-md text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 transition">
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden" dir={dir}>
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-800 bg-slate-900/60">
        <ToolBtn icon={Heading1} label="عنوان 1"  onClick={() => prefixLines("# ",  "عنوان رئيسي")} />
        <ToolBtn icon={Heading2} label="عنوان 2"  onClick={() => prefixLines("## ", "عنوان فرعي")} />
        <ToolBtn icon={Heading3} label="عنوان 3"  onClick={() => prefixLines("### ","عنوان صغير")} />
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <ToolBtn icon={Bold}       label="غامق"   onClick={() => wrap("**", "**", "نص غامق")} />
        <ToolBtn icon={Italic}     label="مائل"   onClick={() => wrap("*",  "*",  "نص مائل")} />
        <ToolBtn icon={Code}       label="كود"    onClick={() => wrap("`",  "`",  "code")} />
        <ToolBtn icon={Link2}      label="رابط"   onClick={() => wrap("[", "](https://)", "نص الرابط")} />
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <ToolBtn icon={List}        label="قائمة نقطية" onClick={() => prefixLines("- ", "عنصر")} />
        <ToolBtn icon={ListOrdered} label="قائمة مرقّمة" onClick={() => prefixLines("1. ", "عنصر")} />
        <ToolBtn icon={Quote}       label="اقتباس"      onClick={() => prefixLines("> ", "اقتباس")} />
        <ToolBtn icon={Minus}       label="فاصل"        onClick={() => insertBlock("---")} />
        <ToolBtn icon={CornerDownLeft} label="فقرة جديدة" onClick={() => insertBlock("")} />
        <span className="w-px h-5 bg-slate-800 mx-1" />
        <button type="button" onClick={clean} title="تنظيف النص وفصل الفقرات"
          className="h-8 px-2 flex items-center gap-1 rounded-md text-xs text-emerald-300 hover:bg-emerald-500/10">
          <Wand2 className="w-3.5 h-3.5" /> تنظيف
        </button>
        <div className="ms-auto flex items-center gap-1">
          <button type="button" onClick={() => setMode("edit")}
            className={`h-8 px-2 flex items-center gap-1 rounded-md text-xs ${mode==="edit"?"bg-cyan-500/15 text-cyan-300":"text-slate-400 hover:bg-slate-800"}`}>
            <Pencil className="w-3.5 h-3.5" /> تحرير
          </button>
          <button type="button" onClick={() => setMode("split")}
            className={`h-8 px-2 flex items-center rounded-md text-xs ${mode==="split"?"bg-cyan-500/15 text-cyan-300":"text-slate-400 hover:bg-slate-800"}`}>
            مقسّم
          </button>
          <button type="button" onClick={() => setMode("preview")}
            className={`h-8 px-2 flex items-center gap-1 rounded-md text-xs ${mode==="preview"?"bg-cyan-500/15 text-cyan-300":"text-slate-400 hover:bg-slate-800"}`}>
            <Eye className="w-3.5 h-3.5" /> معاينة
          </button>
        </div>
      </div>

      <div className={`grid ${mode==="split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {mode !== "preview" && (
          <textarea
            ref={ref}
            dir={dir}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={(e) => {
              const txt = e.clipboardData.getData("text");
              if (!txt) return;
              e.preventDefault();
              const el = ref.current!;
              const s = el.selectionStart, en = el.selectionEnd;
              const cleaned = txt.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ");
              const next = value.slice(0, s) + cleaned + value.slice(en);
              onChange(next);
              requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + cleaned.length; });
            }}
            placeholder={placeholder || "اكتب فقرتك الأولى هنا...\n\nاترك سطراً فارغاً بين كل فقرة والتي تليها.\n\n## عنوان فرعي\n- عنصر قائمة\n- عنصر آخر"}
            style={{ minHeight }}
            className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-600 p-4 outline-none font-mono text-[13px] leading-7 resize-y whitespace-pre-wrap"
          />
        )}
        {mode !== "edit" && (
          <div
            className="p-5 bg-slate-950/30 border-s border-slate-800 overflow-auto text-slate-200 text-[14px]"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-slate-600 text-sm'>المعاينة ستظهر هنا...</p>" }}
          />
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span>يدعم Markdown • كل فقرة يجب أن تكون منفصلة بسطر فارغ</span>
        <span>{(value || "").length} حرف · {(value || "").split(/\s+/).filter(Boolean).length} كلمة</span>
      </div>
    </div>
  );
}
