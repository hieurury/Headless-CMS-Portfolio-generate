import { create } from 'zustand';
import { postService, postTypeService } from '../services/post.service';
import type { Post, PostType, CreatePostPayload, CreatePostTypePayload } from '../services/post.service';

interface PostStore {
  posts: Post[];
  postTypes: PostType[];
  currentPostType: PostType | null;
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;

  // Posts
  fetchPosts: (postTypeId?: string) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  createPost: (data: CreatePostPayload) => Promise<Post>;
  updatePost: (id: string, data: Partial<CreatePostPayload>) => Promise<void>;
  removePost: (id: string) => Promise<void>;

  // PostTypes
  fetchPostTypes: () => Promise<void>;
  fetchPostTypeById: (id: string) => Promise<void>;
  createPostType: (data: CreatePostTypePayload) => Promise<PostType>;
  removePostType: (id: string) => Promise<void>;
  setCurrentPostType: (pt: PostType | null) => void;

  reset: () => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  postTypes: [],
  currentPostType: null,
  currentPost: null,
  isLoading: false,
  error: null,

  // ── Posts ──────────────────────────────────────────────────────────────────

  fetchPosts: async (postTypeId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const posts = await postService.getAll(postTypeId);
      set({ posts, isLoading: false });
    } catch {
      set({ error: 'Failed to load posts', isLoading: false });
    }
  },

  fetchPostById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const post = await postService.getById(id);
      set({ currentPost: post, isLoading: false });
    } catch {
      set({ error: 'Failed to load post', isLoading: false });
    }
  },

  createPost: async (data) => {
    const post = await postService.create(data);
    set((state) => ({ posts: [post, ...state.posts] }));
    return post;
  },

  updatePost: async (id, data) => {
    const updated = await postService.update(id, data);
    set((state) => ({
      posts: state.posts.map((p) => (p._id === id ? updated : p)),
    }));
  },

  removePost: async (id) => {
    await postService.remove(id);
    set((state) => ({ posts: state.posts.filter((p) => p._id !== id) }));
  },

  // ── PostTypes ──────────────────────────────────────────────────────────────

  fetchPostTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const postTypes = await postTypeService.getAll();
      set({ postTypes, isLoading: false });
    } catch {
      set({ error: 'Failed to load post types', isLoading: false });
    }
  },

  fetchPostTypeById: async (id) => {
    try {
      const pt = await postTypeService.getById(id);
      set({ currentPostType: pt });
    } catch {
      set({ error: 'Failed to load post type' });
    }
  },

  setCurrentPostType: (pt) => set({ currentPostType: pt }),

  createPostType: async (data) => {
    const pt = await postTypeService.create(data);
    set((state) => ({ postTypes: [pt, ...state.postTypes] }));
    return pt;
  },

  removePostType: async (id) => {
    await postTypeService.remove(id);
    set((state) => ({ postTypes: state.postTypes.filter((p) => p._id !== id) }));
  },

  reset: () =>
    set({
      posts: [],
      postTypes: [],
      currentPostType: null,
      currentPost: null,
      isLoading: false,
      error: null,
    }),
}));
