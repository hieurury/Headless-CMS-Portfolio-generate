import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useUIStore } from '../../store/uiStore';
import { postService, type Post } from '../../services/post.service';
import { mediaService } from '../../services/media.service';
import { authService } from '../../services/auth.service';
import { publicService, type UserPublicProfile } from '../../services/public.service';
import { UserNavMenu } from '../../components/common/UserNavMenu';
import {
  Globe,
  FileText,
  Edit3,
  Camera,
  ExternalLink,
  Loader2,
  Check,
  X,
  Plus,
  Briefcase,
  Calendar,
  Eye,
  Clock,
  ArrowLeft,
  Sun,
  Moon,
  Image as ImageIcon,
  CheckCircle2,
  Folder,
  Tag,
  Search,
  Sparkles,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Công nghệ thông tin',
  'Phát triển phần mềm',
  'Thiết kế UI/UX',
  'Thiết kế đồ họa',
  'Marketing & Truyền thông',
  'Sáng tạo nội dung',
  'Kinh doanh & Khởi nghiệp',
  'Nhiếp ảnh & Quay phim',
  'Trí tuệ nhân tạo (AI)',
  'Khoa học dữ liệu',
  'Giáo dục & Đào tạo',
  'Nghệ thuật & Âm nhạc',
  'Viết lách & Dịch thuật',
  'Thương mại điện tử',
  'Quản trị sản phẩm (PM)',
  'Tài chính & Đầu tư',
];

// Helper to remove Vietnamese diacritics for smart search
const normalizeVietnamese = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
};

export const ProfilePage: React.FC = () => {
  const { user: authUser, updateProfile, isAuthenticated } = useAuthStore();
  const { username } = useParams<{ username: string }>();
  
  const isOwner = isAuthenticated && authUser?.username === username;
  
  const [publicUser, setPublicUser] = useState<UserPublicProfile | null>(null);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  
  const user = isOwner ? authUser : publicUser;

  const { portfolios, fetchAll: fetchPortfolios, isLoading: loadingPortfolios } = usePortfolioStore();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();

  const [activeTab, setActiveTab] = useState<'websites' | 'posts'>('websites');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // File upload refs & states
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  // Inline editing states
  const [editingField, setEditingField] = useState<'fullName' | 'slogan' | 'occupation' | 'age' | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isSavingField, setIsSavingField] = useState(false);

  // Category Popover & DB State
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const categoryPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) return;
    if (!isOwner) {
      setIsLoadingPublic(true);
      publicService
        .getUserProfile(username)
        .then((data) => setPublicUser(data))
        .catch(() => setPublicError('Người dùng không tồn tại hoặc chưa xuất bản.'))
        .finally(() => setIsLoadingPublic(false));
    }
  }, [username, isOwner]);

  useEffect(() => {
    if (isOwner) fetchPortfolios();
  }, [fetchPortfolios, isOwner]);

  // Load categories from database
  useEffect(() => {
    const fetchDbCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await authService.getCategories();
        if (Array.isArray(data) && data.length > 0) {
          const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...data]));
          setAvailableCategories(merged);
        }
      } catch (err) {
        console.error('Failed to load categories from DB', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchDbCategories();
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      try {
        const data = await postService.getAll();
        setPosts(data);
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchUserPosts();
  }, [isOwner]);

  // Click outside category popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryPopoverRef.current &&
        !categoryPopoverRef.current.contains(e.target as Node)
      ) {
        setIsCategoryPopoverOpen(false);
      }
    };
    if (isCategoryPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryPopoverOpen]);

  const publishedPortfolios = useMemo(() => {
    if (!isOwner && publicUser) return publicUser.portfolios;
    return portfolios.filter((p) => p.isPublished);
  }, [portfolios, isOwner, publicUser]);

  const publishedPosts = useMemo(() => {
    if (!isOwner) return []; // In the original public view, posts weren't shown directly on profile. Let's just return empty for now.
    return posts.filter((p) => p.status === 'published');
  }, [posts, isOwner]);

  // Top 3 default suggested categories
  const sampleSuggestedCategories = useMemo(() => {
    return availableCategories.slice(0, 3);
  }, [availableCategories]);

  // Filtered categories based on search input
  const filteredCategories = useMemo(() => {
    const query = normalizeVietnamese(categorySearchQuery.trim());
    if (!query) return availableCategories;
    return availableCategories.filter((cat) =>
      normalizeVietnamese(cat).includes(query)
    );
  }, [categorySearchQuery, availableCategories]);

  // ─── File Upload Handlers (Multer via mediaService) ───────────────────────

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const media = await mediaService.upload(file, 'Avatar');
      await updateProfile({ avatar: media.url });
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleBgFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBg(true);
      const media = await mediaService.upload(file, 'Background');
      await updateProfile({ background: media.url });
    } catch (err) {
      console.error('Failed to upload cover background', err);
    } finally {
      setIsUploadingBg(false);
      if (e.target) e.target.value = '';
    }
  };

  // ─── Inline Edit Handlers ──────────────────────────────────────────────────

  const startEdit = (field: 'fullName' | 'slogan' | 'occupation' | 'age') => {
    if (!isOwner) return;
    setEditingField(field);
    if (field === 'fullName') setTempValue(user?.fullName || '');
    else if (field === 'slogan') setTempValue(user?.slogan || '');
    else if (field === 'occupation') setTempValue(user?.occupation || '');
    else if (field === 'age') setTempValue(user?.age ? String(user.age) : '');
  };

  const saveField = async (field: 'fullName' | 'slogan' | 'occupation' | 'age') => {
    if (isSavingField) return;
    const trimmed = tempValue.trim();
    setIsSavingField(true);
    try {
      if (field === 'fullName') {
        if (trimmed && trimmed !== user?.fullName) {
          await updateProfile({ fullName: trimmed });
        }
      } else if (field === 'slogan') {
        if (trimmed !== (user?.slogan || '')) {
          await updateProfile({ slogan: trimmed || undefined });
        }
      } else if (field === 'occupation') {
        if (trimmed !== (user?.occupation || '')) {
          await updateProfile({ occupation: trimmed || undefined });
        }
      } else if (field === 'age') {
        const numAge = trimmed ? Number(trimmed) : undefined;
        if (numAge !== user?.age) {
          await updateProfile({ age: numAge });
        }
      }
    } catch (err) {
      console.error(`Failed to save ${field}`, err);
    } finally {
      setIsSavingField(false);
      setEditingField(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    field: 'fullName' | 'slogan' | 'occupation' | 'age'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveField(field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  // ─── Category / Interests Handlers ─────────────────────────────────────────

  const handleToggleInterest = async (interest: string) => {
    const currentInterests = user?.interests || [];
    const updated = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];
    try {
      await updateProfile({ interests: updated });
    } catch (err) {
      console.error('Failed to update categories', err);
    }
  };

  const handleAddNewCustomCategory = async () => {
    const trimmed = categorySearchQuery.trim();
    if (!trimmed) return;
    if (!availableCategories.includes(trimmed)) {
      setAvailableCategories((prev) => [trimmed, ...prev]);
    }
    const currentInterests = user?.interests || [];
    if (!currentInterests.includes(trimmed)) {
      try {
        await updateProfile({ interests: [...currentInterests, trimmed] });
      } catch (err) {
        console.error('Failed to add custom category', err);
      }
    }
    setCategorySearchQuery('');
  };

  const handleRemoveInterest = async (interest: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentInterests = user?.interests || [];
    const updated = currentInterests.filter((i) => i !== interest);
    try {
      await updateProfile({ interests: updated });
    } catch (err) {
      console.error('Failed to remove category', err);
    }
  };

  if (isLoadingPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 size={36} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (!isOwner && publicError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Người dùng không tìm thấy</h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">{publicError}</p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm"
          >
            ← Khám phá
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />
      <input
        type="file"
        ref={bgInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleBgFileSelect}
      />

      {/* Top Navbar */}
      <nav className="home-navbar home-navbar--scrolled">
        <div className="home-navbar__inner container-max px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </Link>
            <div style={{ width: 1, height: 18, background: 'var(--color-border)' }} />
            <Link to="/" className="home-navbar__logo">
              <img
                src="https://cms.hieurury.id.vn/icons.svg"
                alt="CMS Portfolio Logo"
                className="home-navbar__logo-mark"
              />
              <span className="home-navbar__logo-text">Ruryfo CMS</span>
            </Link>
          </div>

          <div className="home-navbar__right">
            <div className="home-navbar__links">
              <Link to="/explore" className="home-navbar__link">
                Community
              </Link>
              <Link to="/dashboard/media" className="home-navbar__link flex items-center gap-1.5">
                <ImageIcon size={14} />
                Media
              </Link>
            </div>

            <div className="home-navbar__controls">
              <button
                className="home-navbar__icon-btn"
                onClick={toggleLanguage}
                title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
              >
                <span className="home-navbar__lang-label">{language.toUpperCase()}</span>
              </button>

              <button
                className="home-navbar__icon-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            {/* Separator and User Dropdown Menu */}
            <div style={{ width: 1, height: 22, background: 'var(--color-border)', margin: '0 4px' }} />
            <UserNavMenu />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-max mx-auto px-6 pt-24 pb-16 max-w-5xl">
        {/* Profile Card Container (Notice: no overflow-hidden so popovers display cleanly!) */}
        <div
          className="group relative mb-8"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Cover Background (Only cover has overflow-hidden and top rounded corners) */}
          <div
            className="relative w-full h-52 md:h-64 overflow-hidden"
            style={{
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              background: user?.background
                ? `url("${user.background}") center/cover no-repeat`
                : 'linear-gradient(135deg, var(--color-surface-2) 0%, var(--color-surface-3) 100%)',
            }}
          >
            {!user?.background && (
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, var(--color-text) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
            )}

            {/* Button Upload Cover Image */}
            {isOwner && (
              <button
                onClick={() => bgInputRef.current?.click()}
                disabled={isUploadingBg}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-colors duration-150 cursor-pointer shadow-md"
                style={{ border: 'none' }}
                title="Đổi ảnh bìa"
              >
                {isUploadingBg ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <Camera size={13} />
                    <span>Đổi ảnh bìa</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Profile Header & Info Area */}
          <div className="px-6 md:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 gap-4 mb-5">
              {/* Avatar & Name & Email */}
              <div className="flex items-end gap-5">
                {/* Circular Avatar with Hover Upload */}
                <div
                  className="relative group/avatar"
                  style={{
                    width: 108,
                    height: 108,
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-xl)',
                    padding: 3,
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-surface-3)',
                      fontSize: 32,
                      fontWeight: 800,
                      color: 'var(--color-text)',
                    }}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 size={28} className="animate-spin text-white" />
                    ) : user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName ?? user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user?.fullName || user?.username || 'U').charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Hover Overlay Button to Upload Avatar */}
                  {isOwner && (
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 text-white cursor-pointer"
                      title="Nhấp để tải ảnh đại diện mới"
                    >
                      <Camera size={22} />
                      <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>Đổi ảnh</span>
                    </button>
                  )}
                </div>

                {/* Name (Inline Editable) & Email */}
                <div className="pt-3">
                  <div className="flex items-center gap-3">
                    {editingField === 'fullName' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => saveField('fullName')}
                          onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                          disabled={isSavingField}
                          className="px-2.5 py-1 text-xl font-bold rounded"
                          style={{
                            background: 'var(--color-surface-2)',
                            color: 'var(--color-text)',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'var(--shadow-sm)',
                            maxWidth: 260,
                          }}
                        />
                        <button
                          onClick={() => saveField('fullName')}
                          className="p-1.5 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
                          style={{ border: 'none', cursor: 'pointer' }}
                          title="Lưu tên"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-1.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                          style={{ border: 'none', cursor: 'pointer' }}
                          title="Hủy"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEdit('fullName')}
                        className={`group/name flex items-center gap-2 py-0.5 px-1.5 rounded transition-colors duration-150 ${isOwner ? 'cursor-pointer hover:bg-[var(--color-surface-2)]' : ''}`}
                        title={isOwner ? "Nhấp để chỉnh sửa họ tên" : ""}
                      >
                        <h1
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            letterSpacing: '-0.4px',
                            color: 'var(--color-text)',
                            margin: 0,
                          }}
                        >
                          {user?.username}{user?.fullName ? ` (${user.fullName})` : ''}
                        </h1>
                        {isOwner && (
                          <Edit3
                            size={15}
                            className="opacity-0 group-hover/name:opacity-100 transition-opacity"
                            style={{ color: 'var(--color-text-muted)' }}
                          />
                        )}
                      </div>
                    )}

                    {user && 'isEmailVerified' in user && user.isEmailVerified && (
                      <span
                        title="Tài khoản đã xác thực"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Slogan (Inline Editable) */}
            <div className="mb-4">
              {editingField === 'slogan' ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={tempValue}
                    placeholder="Nhập slogan hoặc câu châm ngôn..."
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => saveField('slogan')}
                    onKeyDown={(e) => handleKeyDown(e, 'slogan')}
                    disabled={isSavingField}
                    maxLength={160}
                    className="w-full px-3 py-1.5 text-sm italic rounded"
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text)',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                  <button
                    onClick={() => saveField('slogan')}
                    className="p-2 rounded flex-shrink-0 bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
                    style={{ border: 'none', cursor: 'pointer' }}
                    title="Lưu slogan"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="p-2 rounded flex-shrink-0 bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    style={{ border: 'none', cursor: 'pointer' }}
                    title="Hủy"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit('slogan')}
                  className={`group/slogan inline-flex items-center gap-2 py-1 px-2 rounded transition-colors duration-150 ${isOwner ? 'cursor-pointer hover:bg-[var(--color-surface-2)]' : ''}`}
                  title={isOwner ? "Nhấp để chỉnh sửa slogan" : ""}
                >
                  {user?.slogan ? (
                    <p
                      style={{
                        fontSize: 14,
                        fontStyle: 'italic',
                        color: 'var(--color-text)',
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      "{user.slogan}"
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        fontStyle: 'italic',
                        color: 'var(--color-text-faint)',
                        margin: 0,
                      }}
                    >
                      + Thêm câu slogan của bạn...
                    </p>
                  )}
                  {isOwner && (
                    <Edit3
                      size={14}
                      className="opacity-0 group-hover/slogan:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Categories / Interests Section with Popover (Placed directly below Slogan) */}
            <div className="mb-4 pt-1">
              <div className="flex flex-wrap items-center gap-2 relative">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'var(--color-text-muted)',
                    marginRight: 4,
                  }}
                >
                  Danh mục:
                </span>

                {/* Selected Category Tags */}
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map((tag) => (
                    <span
                      key={tag}
                      className="group/tag inline-flex items-center gap-1.5 transition-all"
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '3px 8px 3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <span>#{tag}</span>
                      {isOwner && (
                        <button
                          onClick={(e) => handleRemoveInterest(tag, e)}
                          className="opacity-40 hover:opacity-100 hover:text-red-400 transition-opacity p-0.5 rounded"
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                          title={`Bỏ danh mục ${tag}`}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
                    Chưa chọn danh mục nào
                  </span>
                )}

                {/* Button Open Category Popover */}
                {isOwner && (
                  <div className="relative" ref={categoryPopoverRef}>
                    <button
                      onClick={() => {
                      setIsCategoryPopoverOpen(!isCategoryPopoverOpen);
                      setCategorySearchQuery('');
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors duration-150 ${
                      isCategoryPopoverOpen
                        ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                    }`}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    title="Chọn thêm danh mục quan tâm"
                  >
                    <Plus size={13} />
                    <span>Thêm danh mục</span>
                  </button>

                  {/* Category Selection Popover with Search (z-50 + border + dark shadow) */}
                  {isCategoryPopoverOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 p-3.5 rounded z-50 animate-fade-in"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                        borderRadius: 'var(--radius-md)',
                        width: 360,
                        maxWidth: '90vw',
                      }}
                    >
                      {/* Popover Header */}
                      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <Tag size={14} style={{ color: 'var(--color-text)' }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                            Danh mục quan tâm
                          </span>
                          {loadingCategories && (
                            <Loader2 size={12} className="animate-spin text-[var(--color-text-muted)]" />
                          )}
                          {user?.interests && user.interests.length > 0 && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text)',
                              }}
                            >
                              Đã chọn: {user.interests.length}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setIsCategoryPopoverOpen(false)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5 rounded transition-colors"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Search Box inside Popover */}
                      <div className="relative mb-3">
                        <Search
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Tìm kiếm hoặc thêm danh mục mới..."
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && categorySearchQuery.trim()) {
                              e.preventDefault();
                              handleAddNewCustomCategory();
                            }
                          }}
                          className="w-full pl-8 pr-7 py-1.5 text-xs rounded bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border)]"
                          style={{ border: 'none' }}
                        />
                        {categorySearchQuery && (
                          <button
                            onClick={() => setCategorySearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Content: When NOT searching -> Only show 3 Sample Suggested Categories */}
                      {!categorySearchQuery.trim() ? (
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                            <Sparkles size={11} />
                            <span>Gợi ý tiêu biểu</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sampleSuggestedCategories.map((cat) => {
                              const isSelected = user?.interests?.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  onClick={() => handleToggleInterest(cat)}
                                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                                    isSelected
                                      ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                                  }`}
                                  style={{
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)',
                                  }}
                                >
                                  {isSelected ? <Check size={12} /> : <Plus size={12} />}
                                  <span>{cat}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Content: When Searching -> Show Filtered Results + Option to Add Custom Category */
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                            Kết quả tìm kiếm ({filteredCategories.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pt-0.5 pr-0.5">
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((cat) => {
                                const isSelected = user?.interests?.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => handleToggleInterest(cat)}
                                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                                      isSelected
                                        ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                                    }`}
                                    style={{
                                      border: 'none',
                                      cursor: 'pointer',
                                      boxShadow: 'var(--shadow-sm)',
                                    }}
                                  >
                                    {isSelected ? <Check size={12} /> : <Plus size={12} />}
                                    <span>{cat}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="w-full py-2 text-center text-xs text-[var(--color-text-muted)]">
                                Không tìm thấy danh mục sẵn có
                              </div>
                            )}
                          </div>

                          {/* Quick Add Custom Category Button */}
                          {categorySearchQuery.trim() &&
                            !availableCategories.some(
                              (c) => normalizeVietnamese(c) === normalizeVietnamese(categorySearchQuery.trim())
                            ) && (
                              <button
                                onClick={handleAddNewCustomCategory}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors mt-2"
                                style={{ border: 'none', cursor: 'pointer' }}
                              >
                                <Plus size={13} />
                                <span>Thêm mới danh mục: "{categorySearchQuery.trim()}"</span>
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Metadata / Badges (Occupation, Age, Stats) */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2" style={{ color: 'var(--color-text-muted)' }}>
              {/* Occupation Inline Edit */}
              {editingField === 'occupation' ? (
                <div className="flex items-center gap-1">
                  <Briefcase size={14} />
                  <input
                    autoFocus
                    type="text"
                    value={tempValue}
                    placeholder="Nghề nghiệp..."
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => saveField('occupation')}
                    onKeyDown={(e) => handleKeyDown(e, 'occupation')}
                    className="px-2 py-0.5 text-xs rounded"
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text)',
                      border: 'none',
                      outline: 'none',
                    }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => startEdit('occupation')}
                  className={`group/occ flex items-center gap-1.5 py-1 px-2 rounded transition-colors duration-150 ${isOwner ? 'cursor-pointer hover:bg-[var(--color-surface-2)]' : ''}`}
                  title={isOwner ? "Nhấp để chỉnh sửa nghề nghiệp" : ""}
                >
                  <Briefcase size={14} />
                  <span>{user?.occupation || 'Thêm nghề nghiệp'}</span>
                  {isOwner && (
                    <Edit3
                      size={12}
                      className="opacity-0 group-hover/occ:opacity-100 transition-opacity"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  )}
                </div>
              )}

              {/* Age Inline Edit */}
              {editingField === 'age' ? (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <input
                    autoFocus
                    type="number"
                    value={tempValue}
                    placeholder="Tuổi..."
                    min={13}
                    max={120}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => saveField('age')}
                    onKeyDown={(e) => handleKeyDown(e, 'age')}
                    className="px-2 py-0.5 text-xs rounded w-16"
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text)',
                      border: 'none',
                      outline: 'none',
                    }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => startEdit('age')}
                  className={`group/age flex items-center gap-1.5 py-1 px-2 rounded transition-colors duration-150 ${isOwner ? 'cursor-pointer hover:bg-[var(--color-surface-2)]' : ''}`}
                  title={isOwner ? "Nhấp để chỉnh sửa tuổi" : ""}
                >
                  <Calendar size={14} />
                  <span>{user?.age ? `${user.age} tuổi` : 'Thêm tuổi'}</span>
                  {isOwner && (
                    <Edit3
                      size={12}
                      className="opacity-0 group-hover/age:opacity-100 transition-opacity"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  )}
                </div>
              )}

              {/* Website count */}
              <div className="flex items-center gap-1.5">
                <Globe size={14} />
                <span>{publishedPortfolios.length} website public</span>
              </div>

              {/* Post count */}
              <div className="flex items-center gap-1.5">
                <FileText size={14} />
                <span>{publishedPosts.length} bài viết</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('websites')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded transition-all duration-200"
            style={{
              background: activeTab === 'websites' ? 'var(--color-text)' : 'var(--color-surface)',
              color: activeTab === 'websites' ? 'var(--color-bg)' : 'var(--color-text-muted)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Globe size={16} />
            <span>Trang web công khai</span>
            <span
              style={{
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'websites' ? 'var(--color-bg)' : 'var(--color-surface-2)',
                color: activeTab === 'websites' ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}
            >
              {publishedPortfolios.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded transition-all duration-200"
            style={{
              background: activeTab === 'posts' ? 'var(--color-text)' : 'var(--color-surface)',
              color: activeTab === 'posts' ? 'var(--color-bg)' : 'var(--color-text-muted)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <FileText size={16} />
            <span>Bài viết công khai</span>
            <span
              style={{
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'posts' ? 'var(--color-bg)' : 'var(--color-surface-2)',
                color: activeTab === 'posts' ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}
            >
              {publishedPosts.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Websites */}
        {activeTab === 'websites' && (
          <div>
            {loadingPortfolios ? (
              <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                Đang tải danh sách trang web...
              </div>
            ) : publishedPortfolios.length === 0 ? (
              <div
                className="py-16 px-6 text-center rounded"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <Globe size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-faint)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                  Chưa có trang web nào được xuất bản
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 420, margin: '0 auto 16px' }}>
                  Hãy vào Dashboard và bật chế độ xuất bản (Publish) cho Portfolio của bạn để hiển thị tại đây.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded"
                  style={{
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Folder size={14} /> Về Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {publishedPortfolios.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded transition-all duration-200 group"
                    style={{
                      background: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            margin: '0 0 4px 0',
                          }}
                        >
                          {item.title}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                          /{user?.username}/{item.slug}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        Public
                      </span>
                    </div>

                    {item.description && (
                      <p
                        className="line-clamp-2 text-xs mb-4"
                        style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}
                      >
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span>
                        {'pageCount' in item ? item.pageCount : ((item as any).pages?.length || 0)} trang con
                      </span>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/dashboard/portfolios/${item._id}`}
                          className="hover:underline"
                          style={{ color: 'var(--color-text)' }}
                        >
                          Quản lý
                        </Link>
                        <a
                          href={`/${user?.username ?? ''}/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline"
                          style={{ color: 'var(--color-text)' }}
                        >
                          <span>Xem trực tiếp</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Posts */}
        {activeTab === 'posts' && (
          <div>
            {loadingPosts ? (
              <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                Đang tải danh sách bài viết...
              </div>
            ) : publishedPosts.length === 0 ? (
              <div
                className="py-16 px-6 text-center rounded"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <FileText size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-faint)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                  Chưa có bài viết nào được xuất bản
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 420, margin: '0 auto 16px' }}>
                  Xuất bản bài viết trong các Portfolio để bài viết hiển thị trên trang hồ sơ cá nhân của bạn.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded"
                  style={{
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Folder size={14} /> Về Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {publishedPosts.map((post) => (
                  <div
                    key={post._id}
                    className="p-5 rounded transition-all duration-200 group"
                    style={{
                      background: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'var(--color-text)',
                          margin: 0,
                        }}
                      >
                        {post.title}
                      </h4>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        Published
                      </span>
                    </div>

                    {post.excerpt && (
                      <p
                        className="line-clamp-2 text-xs mb-4"
                        style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}
                      >
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="flex items-center gap-3">
                        {post.readingTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {post.readingTime} min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {post.viewCount || 0} views
                        </span>
                      </div>

                      {post.createdAt && (
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
