import api from './api';

export interface FieldDefinition {
  _id: string;
  name: string;
  type: string;
  label: string;
  options?: string[];
}

export interface PostType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  customFieldsSchema: FieldDefinition[];
  createdAt?: string;
}

export type PostStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface Post {
  _id: string;
  title: string;
  slug: string;
  postTypeId: string;
  authorId: string;
  coverImage?: string;
  status: PostStatus;
  customFieldsData?: Record<string, any>;
  tags?: string[];
  // --- Advanced Fields ---
  excerpt?: string;
  publishedAt?: string;
  isFeatured?: boolean;
  viewCount?: number;
  readingTime?: number;
  // -----------------------
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostPayload {
  title: string;
  postTypeId: string;
  coverImage?: string;
  customFieldsData?: Record<string, any>;
  tags?: string[];
  status?: PostStatus;
  // --- Advanced Fields ---
  excerpt?: string;
  publishedAt?: string;
  isFeatured?: boolean;
  readingTime?: number;
}

// ─── Upload API ───────────────────────────────────────────────────────────────

export const uploadService = {
  uploadImage: async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ url: string; publicId: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// ─── Post API ─────────────────────────────────────────────────────────────────

export const postService = {
  getAll: async (postTypeId?: string): Promise<Post[]> => {
    const params = postTypeId ? { postTypeId } : {};
    const res = await api.get<Post[]>('/posts', { params });
    return res.data;
  },

  getById: async (id: string): Promise<Post> => {
    const res = await api.get<Post>(`/posts/${id}`);
    return res.data;
  },

  create: async (data: CreatePostPayload): Promise<Post> => {
    const res = await api.post<Post>('/posts', data);
    return res.data;
  },

  update: async (id: string, data: Partial<CreatePostPayload>): Promise<Post> => {
    const res = await api.patch<Post>(`/posts/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  /** Tăng viewCount khi người dùng mở bài viết */
  incrementView: async (id: string): Promise<void> => {
    await api.post(`/posts/${id}/view`);
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Tính toán thời gian đọc (phút) từ nội dung BlockNote JSON.
 * Sử dụng tốc độ đọc trung bình: 200 từ/phút.
 */
export function calculateReadingTime(blockNoteContent: any): number {
  if (!blockNoteContent) return 0;

  const extractText = (blocks: any[]): string => {
    if (!Array.isArray(blocks)) return '';
    return blocks
      .map((block) => {
        const inlineText = Array.isArray(block.content)
          ? block.content.map((c: any) => c.text ?? '').join('')
          : '';
        const childText = block.children ? extractText(block.children) : '';
        return `${inlineText} ${childText}`;
      })
      .join(' ');
  };

  // BlockNote lưu dạng mảng block ở root hoặc trong layout.sections
  const blocks =
    Array.isArray(blockNoteContent)
      ? blockNoteContent
      : blockNoteContent?.sections ?? [];

  const fullText = extractText(blocks).trim();
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return minutes > 0 ? minutes : 1;
}

export interface CreatePostTypePayload {
  name: string;
  description?: string;
  customFieldsSchema: Omit<FieldDefinition, '_id'>[];
}

// ─── PostType API ─────────────────────────────────────────────────────────────

export const postTypeService = {
  getAll: async (): Promise<PostType[]> => {
    const res = await api.get<PostType[]>('/posttype');
    return res.data;
  },

  getById: async (id: string): Promise<PostType> => {
    const res = await api.get<PostType>(`/posttype/${id}`);
    return res.data;
  },

  create: async (data: CreatePostTypePayload): Promise<PostType> => {
    const res = await api.post<PostType>('/posttype', data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/posttype/${id}`);
  },
};
