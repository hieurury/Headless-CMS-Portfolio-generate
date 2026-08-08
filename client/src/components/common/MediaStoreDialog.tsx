import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMediaStore } from '../../store/mediaStore';
import type { MediaItem } from '../../core/types/media.types';
import {
    X,
    Folder,
    FolderOpen,
    Upload,
    Image as ImageIcon,
    Check,
    Search,
    Loader2,
} from 'lucide-react';

interface MediaStoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (url: string) => void;
    currentUrl?: string;
}

export const MediaStoreDialog: React.FC<MediaStoreDialogProps> = ({
    isOpen,
    onClose,
    onSelectImage,
    currentUrl,
}) => {
    const {
        items,
        folders,
        activeFolder,
        isLoading,
        isUploading,
        fetchFolders,
        fetchMedia,
        uploadFile,
        setActiveFolder,
    } = useMediaStore();

    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Tải folders và media khi mở dialog
    useEffect(() => {
        if (isOpen) {
            fetchFolders();
            fetchMedia(activeFolder ?? undefined);
            setSelectedItem(null);
            setSearchTerm('');
        }
    }, [isOpen, activeFolder]);

    if (!isOpen) return null;

    // 2. Xử lý Upload file vào thư mục đang chọn
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const uploaded = await uploadFile(file, activeFolder ?? undefined);
        if (uploaded) {
            setSelectedItem(uploaded);
        }
        e.target.value = '';
    };

    // 3. Lọc ảnh theo từ khóa tìm kiếm
    const filteredItems = items.filter((item) =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 4. Xác nhận chọn ảnh
    const handleConfirmSelect = () => {
        if (selectedItem) {
            onSelectImage(selectedItem.url);
            onClose();
        }
    };

    const dialogContent = (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
            style={{ width: '100vw', height: '100vh' }}
        >
            <div
                className="relative w-full max-w-5xl h-[85vh] rounded-2xl border border-[var(--color-border)] flex flex-col overflow-hidden shadow-2xl"
                style={{ background: 'var(--color-bg, #0f1117)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="text-indigo-400" size={22} />
                        <h2 className="text-lg font-bold text-[var(--color-text)]">
                            Kho Media &amp; Assets
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body (2 Cột) */}
                <div className="flex-1 flex overflow-hidden">
                    {/* CỘT TRÁI: DANH SÁCH FOLDER */}
                    <aside className="w-64 border-r border-[var(--color-border)] p-4 flex flex-col gap-3 bg-[var(--color-surface, #161822)]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Thư mục
                            </span>
                        </div>

                        {/* List folders */}
                        <div className="flex-1 overflow-y-auto space-y-1">
                            <button
                                type="button"
                                onClick={() => setActiveFolder(null)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${activeFolder === null
                                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
                                    }`}
                            >
                                {activeFolder === null ? (
                                    <FolderOpen size={18} className="text-indigo-400" />
                                ) : (
                                    <Folder size={18} />
                                )}
                                <span>Tất cả ảnh</span>
                            </button>

                            {folders.map((folder) => {
                                const isActive = activeFolder === folder;
                                return (
                                    <button
                                        key={folder}
                                        type="button"
                                        onClick={() => setActiveFolder(folder)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                                            ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
                                            }`}
                                    >
                                        {isActive ? (
                                            <FolderOpen size={18} className="text-indigo-400" />
                                        ) : (
                                            <Folder size={18} />
                                        )}
                                        <span className="truncate">{folder}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* CỘT PHẢI: DANH SÁCH ẢNH & UPLOAD */}
                    <main className="flex-1 flex flex-col bg-[var(--color-bg, #0b0d13)]">
                        {/* Action Bar: Tìm kiếm & Upload */}
                        <div className="flex items-center justify-between gap-4 p-4 border-b border-[var(--color-border)]">
                            <div className="relative flex-1 max-w-sm">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                                />
                                <input
                                    type="text"
                                    placeholder="Tìm ảnh theo tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface, #161822)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[var(--color-text-muted)]/50"
                                />
                            </div>

                            {/* Nút Upload */}
                            <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm">
                                {isUploading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Upload size={16} />
                                )}
                                <span>{isUploading ? 'Đang tải lên...' : 'Tải ảnh lên'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Grid ảnh */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 size={28} className="animate-spin text-indigo-400" />
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)]">
                                    <ImageIcon size={44} className="mb-2 opacity-30 text-indigo-400" />
                                    <p className="text-sm font-medium">Chưa có hình ảnh nào</p>
                                    <p className="text-xs text-[var(--color-text-muted)]/70 mt-1">
                                        Hãy bấm &quot;Tải ảnh lên&quot; để thêm ảnh vào kho của bạn
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {filteredItems.map((item) => {
                                        const isSelected = selectedItem?._id === item._id;
                                        const isCurrent = currentUrl === item.url;
                                        return (
                                            <div
                                                key={item._id}
                                                onClick={() => setSelectedItem(item)}
                                                onDoubleClick={() => {
                                                    onSelectImage(item.url);
                                                    onClose();
                                                }}
                                                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected
                                                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-[0.98]'
                                                    : isCurrent
                                                        ? 'border-emerald-500/60 hover:border-emerald-400'
                                                        : 'border-transparent hover:border-[var(--color-border-hover)]'
                                                    }`}
                                                style={{ background: 'var(--color-surface-2)' }}
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={item.filename}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {/* Overlay info */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                    <span className="text-[11px] text-white truncate font-medium">
                                                        {item.filename}
                                                    </span>
                                                </div>
                                                {/* Checkmark icon */}
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                                        <Check size={14} />
                                                    </div>
                                                )}
                                                {isCurrent && !isSelected && (
                                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-600/90 text-white font-medium">
                                                        Đang dùng
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface, #161822)]">
                    <div className="text-xs text-[var(--color-text-muted)] truncate max-w-md">
                        {selectedItem ? (
                            <span>
                                Đang chọn:{' '}
                                <strong className="text-white">{selectedItem.filename}</strong> (
                                {selectedItem.folder || 'Gốc'})
                            </span>
                        ) : (
                            'Hãy chọn 1 ảnh để hiển thị (hoặc nhấp đúp vào ảnh)'
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-white/5 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmSelect}
                            disabled={!selectedItem}
                            className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
                        >
                            Chọn ảnh này
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(dialogContent, document.body);
};
