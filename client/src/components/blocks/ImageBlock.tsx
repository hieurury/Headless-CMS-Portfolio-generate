import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';
import { MediaStoreDialog } from '../common/MediaStoreDialog';

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top' | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

export interface ImageBlockProps {
  url?: string;
  alt?: string;
  aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1' | '3/4';
  objectFit?: 'cover' | 'contain' | 'fill';
  borderRadius?: 'none' | 'sm' | 'md';
  alignX?: AlignX;
  alignY?: AlignY;
  textColor?: string;
  backgroundColor?: string;
  sectionId?: string;
  [key: string]: unknown;
}

const ASPECT_RATIO_MAP: Record<string, string> = {
  auto: 'auto',
  '16/9': '16 / 9',
  '4/3': '4 / 3',
  '1/1': '1 / 1',
  '3/4': '3 / 4',
};

const RADIUS_MAP: Record<string, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
};

export const ImageBlock: React.FC<ImageBlockProps> = ({
  url = '',
  alt = 'Image',
  aspectRatio = 'auto',
  objectFit = 'cover',
  borderRadius = 'md',
  alignX = 'center',
  alignY = 'middle',
  textColor,
  backgroundColor,
  sectionId,
}) => {
  const { isEditorMode, previewMode, pendingUploads, onPropsChange, removePendingUpload } = useEditorContext();
  const radiusClass = RADIUS_MAP[borderRadius] ?? 'rounded-md';
  const ratioStyle = ASPECT_RATIO_MAP[aspectRatio] ?? 'auto';

  // Find if this block has a pending upload in the global state
  const pendingUpload = pendingUploads.find(p => p.sectionId === sectionId && (p.fieldKey === 'url' || !p.fieldKey));
  const activeUrl = pendingUpload ? pendingUpload.objectUrl : url;

  const [isMediaStoreOpen, setIsMediaStoreOpen] = useState(false);
  const outerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: JUSTIFY_MAP[alignX] ?? 'center',
    alignItems: ALIGN_ITEMS_MAP[alignY] ?? 'center',
    backgroundColor: backgroundColor,
    color: textColor,
  };

  const handleSelectImage = useCallback((selectedUrl: string) => {
    setIsMediaStoreOpen(false);
    if (sectionId) {
      removePendingUpload(sectionId, 'url');
      onPropsChange(sectionId, { url: selectedUrl });
    }
  }, [sectionId, onPropsChange, removePendingUpload]);

  // ── Empty state — shown when no URL is set yet AND no pending file ──────
  if (!activeUrl) {
    return (
      <div id={sectionId} style={outerStyle}>
        <div
          onClick={() => isEditorMode && !previewMode && setIsMediaStoreOpen(true)}
          className={`
            w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed 
            border-[var(--color-border)] bg-[var(--color-surface)] hover:border-indigo-500/60 hover:bg-indigo-500/5
            ${radiusClass} transition-all
            ${isEditorMode && !previewMode ? 'cursor-pointer' : ''}
          `}
          style={{
            aspectRatio: ratioStyle !== 'auto' ? ratioStyle : undefined,
            minHeight: '120px',
          }}
        >
          <ImageIcon size={32} className="text-[var(--color-text-faint)]" />
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            Click để chọn ảnh từ Kho Media
          </p>
        </div>

        {isEditorMode && !previewMode && (
          <MediaStoreDialog
            isOpen={isMediaStoreOpen}
            onClose={() => setIsMediaStoreOpen(false)}
            onSelectImage={handleSelectImage}
            currentUrl={url}
          />
        )}
      </div>
    );
  }

  // ── Image ────────────────────────────────────────────────────────────────
  return (
    <div id={sectionId} className="cms-block-wrapper relative group" style={outerStyle}>
      <div
        className="w-full flex relative"
        style={{ justifyContent: JUSTIFY_MAP[alignX] ?? 'center' }}
      >
        <img
          data-cms-field="url"
          src={activeUrl}
          alt={alt}
          className={`max-w-full ${radiusClass}`}
          style={{
            aspectRatio: ratioStyle !== 'auto' ? ratioStyle : undefined,
            objectFit,
            width: '100%',
            height: ratioStyle !== 'auto' ? '100%' : 'auto',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e1e2e/818cf8?text=Image+Not+Found';
          }}
        />

        {/* Hover overlay to change image */}
        {isEditorMode && !previewMode && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <button
              type="button"
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-medium backdrop-blur-sm shadow-md"
              onClick={() => setIsMediaStoreOpen(true)}
            >
              <Upload size={14} /> Thay đổi ảnh
            </button>
          </div>
        )}
      </div>

      {isEditorMode && !previewMode && (
        <MediaStoreDialog
          isOpen={isMediaStoreOpen}
          onClose={() => setIsMediaStoreOpen(false)}
          onSelectImage={handleSelectImage}
          currentUrl={url}
        />
      )}
    </div>
  );
};
