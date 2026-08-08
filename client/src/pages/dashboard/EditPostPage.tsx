import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostStore } from "../../store/postStore";
import { usePortfolioStore } from "../../store/portfolioStore";
import type { PostType } from "../../services/post.service";
import { uploadService } from "../../services/post.service";
import MyEditor from "../editor/components/BlockNote";
import { PostStatusDropdown, type PostStatusOption } from "../../components/common/PostStatusDropdown";
import {
  ArrowLeft, Loader2, Save, ChevronRight, Tag,
  AlignLeft, Hash, Type, Link as LinkIcon, Calendar,
  List, FileImage, Upload, X, Eye, Star, Clock, AlignLeft as ExcerptIcon,
  Globe
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

// Field Input Renderer
interface FieldInputProps { field: PostType["customFieldsSchema"][number]; index: number; value: any; onChange: (val: any) => void; }
const FieldInput: React.FC<FieldInputProps> = ({ field, index, value, onChange }) => {
  const base = "w-full px-3 py-2.5 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-sm";
  switch (field.type) {
    case "markdown":
      return (
        <div className="rounded-lg overflow-hidden border border-[var(--color-border)]">
          <MyEditor value={value} onChange={onChange} />
        </div>
      );
    case "image":
      return <ImageField fieldId={`field-${index}`} value={value} onChange={onChange} />;
    case "textarea":
      return <textarea id={`field-${index}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${field.label}...`} rows={4} className={`${base} resize-none `} />;
    case "number":
      return <input id={`field-${index}`} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="0" className={base} />;
    case "url":
      return <input id={`field-${field.name}`} type="url" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://" className={base} />;
    case "date":
      return <input id={`field-${field.name}`} type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base} />;
    case "select":
      return (
        <select id={`field-${field.name}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${base} cursor-pointer bg-[var(--color-surface)] [&>option]:bg-[#18181b] [&>option]:text-white`}>
          <option value="">Select {field.label}...</option>
          {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    default:
      return <input id={`field-${field.name}`} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${field.label}...`} className={base} />;
  }
};

// Field Wrapper
interface FieldWrapperProps {
  field: PostType["customFieldsSchema"][number];
  index: number;
  value: any;
  onChange: (val: any) => void;
}
const FieldWrapper: React.FC<FieldWrapperProps> = ({ field, index, value, onChange }) => {
  return (
    <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] relative group">
      <label htmlFor={`field-${field.name}`} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
        <span className="text-[var(--color-text-faint)]">{FIELD_ICONS[field.type] ?? <Type size={14} />}</span>
        {field.label}
        <span className="ml-auto mr-6 font-normal normal-case font-mono text-[10px] text-[var(--color-text-faint)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded">{field.type}</span>
      </label>
      <FieldInput field={field} index={index} value={value} onChange={onChange} />
    </div>
  );
};

// Main Component
export const EditPostPage: React.FC = () => {
  const { portfolioId, postId } = useParams<{ portfolioId: string; postId: string }>();
  const navigate = useNavigate();
  const { updatePost, fetchPostById, fetchPostTypeById, currentPost, currentPostType, isLoading } = usePostStore();
  const { current: portfolio } = usePortfolioStore();
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<PostStatusOption>("draft");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [orderedFields, setOrderedFields] = useState<PostType['customFieldsSchema']>([]);

  useEffect(() => {
    if (postId) {
      fetchPostById(postId).then(() => {
        setIsLoaded(true)
      });
    }
  }, [postId, fetchPostById]);

  useEffect(() => {
    if (currentPost && isLoaded) {
      setTitle(currentPost.title || "");
      setCoverImage(currentPost.coverImage || "");
      setStatus((currentPost.status || "draft") as any);
      setTags(currentPost.tags?.join(", ") || "");
      setExcerpt(currentPost.excerpt || "");
      setIsFeatured(currentPost.isFeatured ?? false);
      // Format ISO date to datetime-local string
      if (currentPost.publishedAt) {
        setPublishedAt(new Date(currentPost.publishedAt).toISOString().slice(0, 16));
      }
      setCustomFieldsData(currentPost.customFieldsData || {});
      if (currentPost.postTypeId) {
        fetchPostTypeById(currentPost.postTypeId);
      }
    }
  }, [currentPost, isLoaded, fetchPostTypeById]);

  useEffect(() => {
    if (currentPostType?.customFieldsSchema) {
      // Initialize orderedFields when PostType loads or changes
      setOrderedFields(currentPostType.customFieldsSchema);
    }
  }, [currentPostType]);

  const setField = (name: string, value: any) => setCustomFieldsData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !postId) return;
    setSaving(true); setError(null);
    try {
      const payload: any = {
        title: title.trim(),
        coverImage: coverImage || undefined,
        customFieldsData,
        status,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        excerpt: excerpt.trim() || undefined,
        isFeatured,
        publishedAt: status === "scheduled" && publishedAt ? publishedAt : undefined,
      };
      await updatePost(postId, payload);
      navigate(`/dashboard/portfolios/${portfolioId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update post";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally { setSaving(false); }
  };

  if (!isLoaded || (isLoading && !currentPost)) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

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
            <span className="text-[var(--color-text)] font-medium">Edit Post</span>
          </div>
          <div className="flex items-center gap-3">
            <PostStatusDropdown
              value={status}
              onChange={(newStatus) => setStatus(newStatus)}
              options={["draft", "published", "scheduled", "archived"]}
            />
            <button form="create-post-form" type="submit" disabled={saving || !title.trim()} className="flex items-center gap-2 h-9 px-5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold text-sm transition-all disabled:opacity-50 hover:opacity-85">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
            <button
              type="button"
              onClick={() => window.open(`/preview-post/${portfolioId}/${postId}`, '_blank')}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors text-sm font-medium"
              title="Preview internal"
            >
              <Eye size={14} /> Preview
            </button>
            {portfolio?.slug && currentPost?.slug && (
              <a
                href={`/p/${portfolio.slug}/post/${currentPost.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors text-sm font-medium"
                title="View public URL"
              >
                <Globe size={14} /> View Public
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container-max mx-auto px-6 py-8">
        <form id="create-post-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-sm shadow-sm">
          {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2"><Tag size={12} /> Title</label>
            <input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..." required
              className="w-full px-3 py-2.5 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-sm" />
          </div>

          {/* Excerpt */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              <ExcerptIcon size={12} /> Excerpt
              <span className="ml-auto font-normal normal-case text-[var(--color-text-faint)] text-[10px]">{excerpt.length}/500</span>
            </label>
            <textarea id="post-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary shown on post cards and RSS feeds..." maxLength={500} rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-text)] transition-all text-sm resize-none" />
          </div>

          {/* Featured & Schedule */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                onClick={() => setIsFeatured(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-all duration-200 ${isFeatured ? 'bg-amber-400' : 'bg-[var(--color-border)]'
                  }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${isFeatured ? 'left-5' : 'left-0.5'
                  }`} />
              </div>
              <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors flex items-center gap-1.5">
                <Star size={13} className={isFeatured ? 'text-amber-400 fill-amber-400' : ''} /> Featured post
              </span>
            </label>

            {status === "scheduled" && (
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Clock size={13} className="text-[var(--color-text-muted)] shrink-0" />
                <input
                  id="post-publish-at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="flex-1 px-3 py-2 rounded-lg bg-transparent border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-text)] transition-all text-sm"
                />
              </div>
            )}
          </div>

          {orderedFields.map((field, index) => (
            <FieldWrapper key={field._id || field.name} field={field} index={index} value={customFieldsData[field.name]} onChange={(val) => setField(field.name, val)} />
          ))}
        </form>
      </div>
    </div>
  );
};
