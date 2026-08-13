import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMediaStore } from '../../store/mediaStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useAlertStore } from '../../store/alertStore';
import { t as tStore } from '../../i18n';
import type { MediaItem } from '../../core/types/media.types';
import {
  Upload,
  Trash2,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ImageOff,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

interface MediaCardProps {
  item: MediaItem;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, selected, onSelect, onDelete }) => (
  <div
    onClick={onSelect}
    className={`group relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
      selected ? 'ring-2 ring-[var(--color-text)] scale-[0.97]' : 'hover:scale-[0.98]'
    }`}
    style={{ background: 'var(--color-surface-2)' }}
  >
    <img
      src={item.url}
      alt={item.filename}
      className="w-full h-full object-cover"
      loading="lazy"
    />
    {/* Hover overlay */}
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
      <button
        id={`delete-media-${item._id}`}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="self-end p-1.5 rounded-md bg-red-500/80 hover:bg-red-500 text-white transition-colors"
      >
        <Trash2 size={14} />
      </button>
      <div className="text-xs text-white truncate">{item.filename}</div>
    </div>
    {/* Selected badge */}
    {selected && (
      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[var(--color-text)] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[var(--color-bg)]" />
      </div>
    )}
  </div>
);

// ─── Upload Drop Zone ───────────────────────────────────────────────────────

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  isUploading: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFiles, isUploading }) => {
  const { language } = useUIStore();
  const t = { mediaGallery: tStore(language).mediaGallery };
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 p-8 rounded-md border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-[var(--color-text)] bg-[var(--color-text)]/5'
          : 'border-[var(--color-surface-2)] hover:border-[var(--color-text-muted)]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />
      {isUploading ? (
        <Loader2 size={28} className="animate-spin text-[var(--color-text-muted)]" />
      ) : (
        <Upload size={28} className="text-[var(--color-text-muted)]" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {isUploading ? t.mediaGallery.uploading : t.mediaGallery.dropImages}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {t.mediaGallery.formatLimit}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export const MediaGalleryPage: React.FC = () => {
  const { user } = useAuthStore();
  const { language, theme, toggleTheme } = useUIStore();
  const t = { mediaGallery: tStore(language).mediaGallery };
  const {
    items,
    folders,
    activeFolder,
    isLoading,
    isUploading,
    error,
    fetchMedia,
    fetchFolders,
    uploadFile,
    deleteMedia,
    setActiveFolder,
    clearError,
  } = useMediaStore();

  const { showAlert } = useAlertStore();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);

  useEffect(() => {
    fetchFolders();
    fetchMedia();
  }, []);

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return;
    showAlert(error, 'error');
    const t = setTimeout(clearError, 4000);
    return () => clearTimeout(t);
  }, [error, clearError, showAlert]);

  // Filter by search term
  const filtered = items.filter((i) =>
    i.filename.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadFile(file, activeFolder ?? 'Uncategorized');
    }
    await fetchFolders();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteMedia(confirmDelete._id);
    setConfirmDelete(null);
    if (selectedId === confirmDelete._id) setSelectedId(null);
  };

  const handleFolderCreate = () => {
    const name = newFolderName.trim();
    if (!name) return;
    setActiveFolder(name);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* ── Top nav ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-surface-2)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            to={`/${user?.username}/dashboard`}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ChevronLeft size={16} />
            Dashboard
          </Link>
          <span className="text-[var(--color-surface-2)]">/</span>
          <span className="text-sm font-semibold flex items-center gap-1.5">
            <ImageIcon size={16} />
            {t.mediaGallery.title}
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-text-muted)]"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>


      {/* ── Body ── */}
      <div className="flex h-[calc(100vh-53px)]">
        {/* ── Sidebar: Folders ── */}
        <aside
          className="w-56 shrink-0 flex flex-col gap-1 p-3 border-r overflow-y-auto"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-surface-2)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-2 mb-1">
            {t.mediaGallery.folders}
          </p>

          {/* All */}
          <button
            onClick={() => setActiveFolder(null)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition-colors ${
              activeFolder === null
                ? 'bg-[var(--color-text)] text-[var(--color-bg)] font-semibold'
                : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
            }`}
          >
            <ImageIcon size={15} />
            {t.mediaGallery.allFiles}
          </button>

          {folders
            .filter((f) => f && f.toLowerCase() !== 'uncategorized')
            .map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition-colors ${
                activeFolder === f
                  ? 'bg-[var(--color-text)] text-[var(--color-bg)] font-semibold'
                  : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
              }`}
            >
              {activeFolder === f ? <FolderOpen size={15} /> : <Folder size={15} />}
              <span className="truncate">{f}</span>
            </button>
          ))}

          {/* New folder */}
          {showNewFolder ? (
            <div className="mt-1 flex flex-col gap-1 px-2">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFolderCreate()}
                placeholder={t.mediaGallery.folderName}
                className="w-full px-2 py-1.5 rounded text-sm bg-[var(--color-surface-2)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text)]"
              />
              <div className="flex gap-1">
                <button
                  onClick={handleFolderCreate}
                  className="flex-1 py-1 rounded bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-semibold"
                >
                  {t.mediaGallery.create}
                </button>
                <button
                  onClick={() => setShowNewFolder(false)}
                  className="flex-1 py-1 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] text-xs"
                >
                  {t.mediaGallery.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors mt-1"
            >
              <Plus size={14} />
              {t.mediaGallery.newFolder}
            </button>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--color-surface-2)' }}
          >
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                id="media-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.mediaGallery.searchFiles}
                className="w-full pl-9 pr-3 py-2 rounded bg-[var(--color-surface-2)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] placeholder-[var(--color-text-muted)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <span className="text-xs text-[var(--color-text-muted)] ml-auto">
              {filtered.length} {filtered.length !== 1 ? t.mediaGallery.files : t.mediaGallery.file}
              {activeFolder ? ` ${t.mediaGallery.in} "${activeFolder}"` : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Drop zone */}
            <DropZone onFiles={handleUpload} isUploading={isUploading} />

            {/* Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[var(--color-text-muted)]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-muted)]">
                <ImageOff size={36} />
                <p className="text-sm">{t.mediaGallery.noImages}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map((item) => (
                  <MediaCard
                    key={item._id}
                    item={item}
                    selected={selectedId === item._id}
                    onSelect={() =>
                      setSelectedId((prev) => (prev === item._id ? null : item._id))
                    }
                    onDelete={() => setConfirmDelete(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ── Detail panel ── */}
        {selectedId && (() => {
          const item = items.find((i) => i._id === selectedId);
          if (!item) return null;
          return (
            <aside
              className="w-60 shrink-0 flex flex-col gap-4 p-4 border-l overflow-y-auto"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-surface-2)' }}
            >
              <img
                src={item.url}
                alt={item.filename}
                className="w-full aspect-square object-cover rounded-md"
              />
              <div className="space-y-2 text-sm">
                <DetailRow label={t.mediaGallery.name} value={item.filename} />
                <DetailRow label={t.mediaGallery.folder} value={item.folder} />
                <DetailRow label={t.mediaGallery.size} value={formatBytes(item.size)} />
                <DetailRow label={t.mediaGallery.type} value={item.mimeType} />
                <DetailRow label={t.mediaGallery.uploaded} value={new Date(item.createdAt).toLocaleDateString()} />
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(item.url); }}
                className="w-full py-2 rounded text-sm font-semibold bg-[var(--color-surface-2)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-all"
              >
                {t.mediaGallery.copyUrl}
              </button>
              <button
                onClick={() => setConfirmDelete(item)}
                className="w-full py-2 rounded text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                {t.mediaGallery.delete}
              </button>
            </aside>
          );
        })()}
      </div>

      {/* ── Delete confirm modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-sm mx-4 p-6 rounded-md shadow-2xl space-y-4"
            style={{ background: 'var(--color-surface)' }}
          >
            <h2 className="text-lg font-bold">{t.mediaGallery.deleteImage}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text)]">
                {confirmDelete.filename}
              </span>{' '}
              {t.mediaGallery.deleteConfirm1}
            </p>
            <div className="flex gap-3">
              <button
                id="confirm-delete-media"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                {t.mediaGallery.delete}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded bg-[var(--color-surface-2)] text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                {t.mediaGallery.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper component ────────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
    <p className="text-[var(--color-text)] break-all text-xs mt-0.5">{value}</p>
  </div>
);
