import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { usePostStore } from "../../store/postStore";
import type { PostType } from "../../services/post.service";
import { uploadService } from "../../services/post.service";
import MDEditor from "@uiw/react-md-editor";
import {
  ArrowLeft, Loader2, Save, ChevronRight, Tag,
  AlignLeft, Hash, Type, Link as LinkIcon, Calendar,
  List, FileImage, Upload, X,
} from "lucide-react";

const FIELD_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  textarea: <AlignLeft size={14} />,
  markdown: <AlignLeft size={14} />,
  number: <Hash size={14} />,
  url: <LinkIcon size={14} />,
  date: <Calendar size={14} />,
  select: <List size={14} />,
  image: <FileImage size={14} />,
};

// Image Upload Field
interface ImageFieldProps { value: string | undefined; onChange: (url: string) => void; fieldId: string; }
const ImageField: React.FC<ImageFieldProps> = ({ value, onChange, fieldId }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    setUploading(true); setError(null);
    try { const { url } = await uploadService.uploadImage(file); onChange(url); }
    catch { setError("Upload failed."); }
    finally { setUploading(false); }
  };
  return (
    <div>
      <input ref={inputRef} id={fieldId} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {value ? (
        <div className="relative group/img rounded-lg overflow-hidden border border-[var(--color-border)]">
          <img src={value} alt="Uploaded" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs">Change</button>
            <button type="button" onClick={() => onChange("")} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-white"><X size={14} /></button>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }} onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 h-32 rounded-lg border border-dashed border-[var(--color-border)] hover:border-[var(--color-text-muted)] cursor-pointer transition-all text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]">
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={18} /><span className="text-xs">Click or drag image here</span></>}
        </div>
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};

// Cover Image Upload
interface CoverImageProps { value: string; onChange: (url: string) => void; }
const CoverImageUpload: React.FC<CoverImageProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    setUploading(true);
    try { const { url } = await uploadService.uploadImage(file); onChange(url); }
    finally { setUploading(false); }
  };
  return (
    <div className="relative mb-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {value ? (
        <div className="relative group/cover rounded-xl overflow-hidden h-52 border border-[var(--color-border)]">
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm"><Upload size={14} /> Change Cover</button>
            <button type="button" onClick={() => onChange("")} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-white"><X size={14} /></button>
          </div>
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Loader2 size={28} className="animate-spin text-white" /></div>}
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <FileImage size={15} />} Add cover image
        </button>
      )}
    </div>
  );
};

// Field Input Renderer
interface FieldInputProps { field: PostType["customFieldsSchema"][number]; value: any; onChange: (val: any) => void; }
const FieldInput: React.FC<FieldInputProps> = ({ field, value, onChange }) => {
  const base = "w-full px-3 py-2.5 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-sm";
  switch (field.type) {
    case "markdown":
      return (
        <div data-color-mode="auto" className="rounded-lg overflow-hidden border border-[var(--color-border)]">
          <MDEditor id={`field-${field.name}`} value={value ?? ""} onChange={(v) => onChange(v ?? "")} height={300} preview="live" />
        </div>
      );
    case "image":
      return <ImageField fieldId={`field-${field.name}`} value={value} onChange={onChange} />;
    case "textarea":
      return <textarea id={`field-${field.name}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${field.label}...`} rows={4} className={`${base} resize-none`} />;
    case "number":
      return <input id={`field-${field.name}`} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="0" className={base} />;
    case "url":
      return <input id={`field-${field.name}`} type="url" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://" className={base} />;
    case "date":
      return <input id={`field-${field.name}`} type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base} />;
    case "select":
      return (
        <select id={`field-${field.name}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${base} cursor-pointer`}>
          <option value="">Select {field.label}...</option>
          {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    default:
      return <input id={`field-${field.name}`} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${field.label}...`} className={base} />;
  }
};

// Main Component
export const CreatePostPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [searchParams] = useSearchParams();
  const postTypeId = searchParams.get("postTypeId") ?? "";
  const navigate = useNavigate();
  const { createPost, fetchPostTypeById, currentPostType } = usePostStore();
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState("");
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (postTypeId) fetchPostTypeById(postTypeId); }, [postTypeId, fetchPostTypeById]);
  const setField = (name: string, value: any) => setCustomFieldsData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true); setError(null);
    try {
      await createPost({ title: title.trim(), postTypeId, coverImage: coverImage || undefined, customFieldsData, status, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
      navigate(`/dashboard/portfolios/${portfolioId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create post";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="container-max mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => navigate(`/dashboard/portfolios/${portfolioId}`)} className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
            <ChevronRight size={13} className="text-[var(--color-border)]" />
            <span className="text-[var(--color-text-muted)]">{currentPostType?.name ?? "Post Type"}</span>
            <ChevronRight size={13} className="text-[var(--color-border)]" />
            <span className="text-[var(--color-text)] font-medium">New Post</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="h-9 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:outline-none focus:border-[var(--color-text)] transition-all cursor-pointer">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button form="create-post-form" type="submit" disabled={saving || !title.trim()} className="flex items-center gap-2 h-9 px-5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-sm transition-all disabled:opacity-50 hover:opacity-85">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
          </div>
        </div>
      </header>

      <div className="container-max mx-auto px-6 py-8">
        <form id="create-post-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-sm shadow-sm">
          {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          
          <CoverImageUpload value={coverImage} onChange={setCoverImage} />
          
          <textarea id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..." required rows={2}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-[var(--color-text)] placeholder-[var(--color-text-faint)] resize-none leading-tight" />
          
          <div className="border-t border-[var(--color-border)]" />
          
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2"><Tag size={12} /> Tags (comma separated)</label>
            <input id="post-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. design, frontend, react"
              className="w-full px-3 py-2.5 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-sm" />
          </div>

          {currentPostType?.customFieldsSchema?.map((field) => (
            <div key={field.name} className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)]">
              <label htmlFor={`field-${field.name}`} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                <span className="text-[var(--color-text-faint)]">{FIELD_ICONS[field.type] ?? <Type size={14} />}</span>
                {field.label}
                <span className="ml-auto font-normal normal-case font-mono text-[10px] text-[var(--color-text-faint)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded">{field.type}</span>
              </label>
              <FieldInput field={field} value={customFieldsData[field.name]} onChange={(val) => setField(field.name, val)} />
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};
