export interface MediaItem {
  _id: string;
  userId: string;
  folder: string;
  filename: string;
  publicId: string;
  url: string;
  mimeType: string;
  type: 'image' | 'video' | 'documents';
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}
