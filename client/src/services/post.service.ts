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

export interface Post {
  _id: string;
  title: string;
  slug: string;
  postTypeId: string;
  authorId: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  customFieldsData?: Record<string, any>;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostPayload {
  title: string;
  postTypeId: string;
  coverImage?: string;
  customFieldsData?: Record<string, any>;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
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
};

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
