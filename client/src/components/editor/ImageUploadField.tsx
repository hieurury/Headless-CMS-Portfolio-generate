import React, { useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';
import { MediaStoreDialog } from '../common/MediaStoreDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  /** Current image URL stored in block props */
  value: string;
  /** Called with the new Cloudinary URL after a successful upload */
  onChange: (url: string) => void;
  sectionId?: string;
  fieldKey?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ImageUploadField — drag-and-drop upload zone for the SmartPropEditor.
 *
 * Flow:
 *   1. User drops / clicks to pick an image file.
 *   2. A local object-URL preview is shown immediately.
 *   3. User clicks "Upload" → file is POSTed to /api/v1/upload/image.
 *   4. On success → onChange(cloudinaryUrl) updates the block prop.
 */
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, sectionId, fieldKey }) => {
  const { pendingUploads, setPendingUpload, removePendingUpload } = useEditorContext();
  const pendingUpload = sectionId ? pendingUploads.find(p => p.sectionId === sectionId && p.fieldKey === fieldKey) : undefined;

  const [isDragging, setIsDragging] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // The preview shown: local blob while a file is staged, or the saved Cloudinary URL
  const previewSrc = pendingUpload ? pendingUpload.objectUrl : value;

  // ── File selection ─────────────────────────────────────────────────────────

  const selectFile = useCallback((file: File) => {
    if (!sectionId) return;
    if (!isValidImageFile(file)) {
      return;
    }

    const preview = URL.createObjectURL(file);
    setPendingUpload(sectionId, file, preview, fieldKey);
  }, [sectionId, fieldKey, setPendingUpload]);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  // Handled globally by PageEditorPage on Save


  // ── Clear ──────────────────────────────────────────────────────────────────

  const handleClear = () => {
    if (pendingUpload && sectionId) {
      URL.revokeObjectURL(pendingUpload.objectUrl);
      removePendingUpload(sectionId, fieldKey);
    }
    onChange('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {/* ── Preview or Drop Zone ── */}
      {previewSrc ? (
        <div className="relative group rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <img
            src={previewSrc}
            alt="preview"
            className="w-full h-36 object-cover"
          />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <Upload size={13} />
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/70 hover:bg-red-500 text-white text-xs font-medium transition-colors"
            >
              <X size={13} />
              Remove
            </button>
          </div>
          {/* Pending badge */}
          {pendingUpload && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border-hover)] text-[10px] font-semibold text-[var(--color-text-muted)]">
              Not uploaded yet
            </div>
          )}
        </div>
      ) : (
        /* Drop Zone */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => setIsDialogOpen(true)}
          className={`
            relative flex flex-col items-center justify-center gap-2 w-full h-32 rounded-lg cursor-pointer
            border-2 border-dashed transition-all
            ${isDragging
              ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-2)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-white/3'
            }
          `}
        >
          <ImageIcon size={28} className="text-[var(--color-text-faint)]" />
          <div className="text-center">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              Drag &amp; drop an image here
            </p>
            <p className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
              or click to browse — JPG, PNG, WebP, GIF up to 10 MB
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
      >
        <Upload size={13} />
        Choose from Media Store
      </button>
      <MediaStoreDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectImage={(url) => {
          onChange(url);
        }}
      />
    </div>
  );
};
