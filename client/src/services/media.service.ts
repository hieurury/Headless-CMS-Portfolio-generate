import api from './api';
import type { MediaItem } from '../core/types/media.types';

export const mediaService = {
  /** Upload an image file to the server. Optional folder name. */
  upload(file: File, folder?: string): Promise<MediaItem> {
    const form = new FormData();
    form.append('file', file);
    if (folder) form.append('folder', folder);
    return api.post<MediaItem>('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  /** List media for the logged-in user. Optional folder filter. */
  getMedia(folder?: string): Promise<MediaItem[]> {
    return api
      .get<MediaItem[]>('/upload', { params: folder ? { folder } : undefined })
      .then((r) => r.data);
  },

  /** List all folder names for the logged-in user. */
  getFolders(): Promise<string[]> {
    return api.get<string[]>('/upload/folders').then((r) => r.data);
  },

  /** Delete a media item by its MongoDB _id. */
  deleteMedia(id: string): Promise<void> {
    return api.delete(`/upload/${id}`).then(() => undefined);
  },
};
