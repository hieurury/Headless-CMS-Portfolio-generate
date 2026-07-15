import React, { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useEditorContext } from '../../core/context/EditorContext';

type AlignX = 'left' | 'center' | 'right';
type AlignY = 'top'  | 'middle' | 'bottom';

const JUSTIFY_MAP: Record<AlignX, string> = {
  left:   'flex-start',
  center: 'center',
  right:  'flex-end',
};
const ALIGN_ITEMS_MAP: Record<AlignY, string> = {
  top:    'flex-start',
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
  auto:   'auto',
  '16/9': '16 / 9',
  '4/3':  '4 / 3',
  '1/1':  '1 / 1',
  '3/4':  '3 / 4',
};

const RADIUS_MAP: Record<string, string> = {
  none:  '',
  sm:    'rounded-sm',
  md:    'rounded-md',
};

function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  url          = '',
  alt          = 'Image',
  aspectRatio  = 'auto',
  objectFit    = 'cover',
  borderRadius = 'md',
  alignX       = 'center',
  alignY       = 'middle',
  textColor,
  backgroundColor,
  sectionId,
}) => {
  const { isEditorMode, previewMode, pendingUploads, setPendingUpload } = useEditorContext();
  const radiusClass = RADIUS_MAP[borderRadius] ?? 'rounded-md';
  const ratioStyle  = ASPECT_RATIO_MAP[aspectRatio] ?? 'auto';

  // Find if this block has a pending upload in the global state
  const pendingUpload = pendingUploads.find(p => p.sectionId === sectionId && (p.fieldKey === 'url' || !p.fieldKey));
  const activeUrl = pendingUpload ? pendingUpload.objectUrl : url;

  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const outerStyle: React.CSSProperties = {
    width:           '100%',
    height:          '100%',
    display:         'flex',
    justifyContent:  JUSTIFY_MAP[alignX]     ?? 'center',
    alignItems:      ALIGN_ITEMS_MAP[alignY] ?? 'center',
    backgroundColor: backgroundColor,
    color:           textColor,
  };

  const selectFile = useCallback((file: File) => {
    if (!sectionId) return;
    if (!isValidImageFile(file)) {
      setErrorMsg('Only image files are accepted');
      return;
    }
    setErrorMsg('');
    const preview = URL.createObjectURL(file);
    setPendingUpload(sectionId, file, preview, 'url');
  }, [sectionId, setPendingUpload]);

  const onDragOver = (e: React.DragEvent) => {
    if (!isEditorMode || previewMode) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    if (!isEditorMode || previewMode) return;
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    e.target.value = '';
  };

  // ── Empty state — shown when no URL is set yet AND no pending file ──────
  if (!activeUrl) {
    return (
      <div id={sectionId} style={outerStyle}>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => isEditorMode && !previewMode && inputRef.current?.click()}
          className={`
            w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed 
            ${isDragging ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-2)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'}
            ${radiusClass} transition-all
            ${isEditorMode && !previewMode ? 'cursor-pointer' : ''}
          `}
          style={{
            aspectRatio: ratioStyle !== 'auto' ? ratioStyle : undefined,
            minHeight: '120px',
          }}
        >
          <ImageIcon size={32} className={isDragging ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-faint)]'} />
          {errorMsg ? (
            <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
          ) : (
            <>
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                Drag &amp; drop an image here
              </p>
              <p className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
                or click to browse
              </p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      </div>
    );
  }

  // ── Image ────────────────────────────────────────────────────────────────
  return (
    <div id={sectionId} className="cms-block-wrapper relative group" style={outerStyle}>
      <div 
        className="w-full flex relative" 
        style={{ justifyContent: JUSTIFY_MAP[alignX] ?? 'center' }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-medium backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
             >
                <Upload size={14} /> Change Image
             </button>
           </div>
        )}

      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
    </div>
  );
};
