import { create } from 'zustand';
import { mediaService } from '../services/media.service';
import type { MediaItem } from '../core/types/media.types';

interface MediaState {
  items: MediaItem[];
  folders: string[];
  activeFolder: string | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number; // 0-100
  error: string | null;

  fetchMedia: (folder?: string) => Promise<void>;
  fetchFolders: () => Promise<void>;
  uploadFile: (file: File, folder?: string) => Promise<MediaItem | null>;
  deleteMedia: (id: string) => Promise<void>;
  setActiveFolder: (folder: string | null) => void;
  clearError: () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  items: [],
  folders: [],
  activeFolder: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  fetchMedia: async (folder) => {
    set({ isLoading: true, error: null });
    try {
      const items = await mediaService.getMedia(folder);
      set({ items, isLoading: false });
    } catch {
      set({ error: 'Failed to load media', isLoading: false });
    }
  },

  fetchFolders: async () => {
    try {
      const folders = await mediaService.getFolders();
      set({ folders });
    } catch {
      // non-critical — silently ignore
    }
  },

  uploadFile: async (file, folder) => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    try {
      const item = await mediaService.upload(file, folder);
      set((s) => ({
        items: [item, ...s.items],
        // Add folder to list if new
        folders: s.folders.includes(item.folder)
          ? s.folders
          : [...s.folders, item.folder],
        isUploading: false,
        uploadProgress: 100,
      }));
      return item;
    } catch {
      set({ error: 'Upload failed', isUploading: false });
      return null;
    }
  },

  deleteMedia: async (id) => {
    try {
      await mediaService.deleteMedia(id);
      set((s) => ({ items: s.items.filter((i) => i._id !== id) }));
    } catch {
      set({ error: 'Delete failed' });
    }
  },

  setActiveFolder: (folder) => {
    set({ activeFolder: folder });
    get().fetchMedia(folder ?? undefined);
  },

  clearError: () => set({ error: null }),
}));
