import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./rich-text-editor.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
};

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block", "link", "image"],
    ["clean"],
  ],
};

export function RichTextEditor({ value, onChange, placeholder, dir = "rtl" }: Props) {
  return (
    <div className="rich-text-editor" dir={dir}>
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} placeholder={placeholder} />
    </div>
  );
}
