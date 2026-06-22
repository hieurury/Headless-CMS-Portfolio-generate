export type Language = 'en' | 'vi';

export const translations = {
  en: {
    nav: {
      docs: 'Documents',
      community: 'Community',
      login: 'Sign In',
    },
    auth: {
      loginTitle: 'Welcome back',
      loginSubtitle: 'Sign in to your CMS account',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      signInBtn: 'Sign In',
      signingInBtn: 'Signing in...',
      noAccount: "Don't have an account?",
      createOne: 'Create one',
      registerTitle: 'Create account',
      registerSubtitle: 'Start building your portfolio',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'John Doe',
      createAccountBtn: 'Create Account',
      creatingBtn: 'Creating...',
      alreadyHaveAccount: 'Already have an account?',
      signInLink: 'Sign in',
    },
    hero: {
      badge: 'Open Source CMS Platform',
      title: 'Build Your Portfolio,',
      titleAccent: 'Your Way.',
      description:
        'A headless CMS that empowers creators to design, publish, and share stunning portfolio websites — without limits.',
      btnSource: 'View Source',
      btnStart: 'Get Started',
    },
    features: {
      sectionLabel: 'Features',
      title: 'Everything you need',
      subtitle: 'Powerful tools designed for creators',
      items: [
        {
          name: 'Drag & Drop Editor',
          description:
            'Build pages visually with an intuitive drag-and-drop interface. No code required — just creativity.',
          badges: ['Visual Builder', 'No Code', 'Real-time Preview'],
        },
        {
          name: 'Headless API',
          description:
            'Access your content via a fully-featured REST API. Integrate with any frontend framework or platform.',
          badges: ['REST API', 'JWT Auth', 'JSON'],
        },
        {
          name: 'Multi-language Support',
          description:
            'Reach a global audience by building multilingual portfolios. Seamlessly switch between languages.',
          badges: ['i18n Ready', 'RTL Support', 'Auto Detect'],
        },
        {
          name: 'Community Showcase',
          description:
            'Discover and share portfolios with a growing community of creators. Get inspired or inspire others.',
          badges: ['Public Gallery', 'Share Links', 'Community'],
        },
      ],
    },
    community: {
      sectionLabel: 'Community',
      title: 'Built by creators,',
      titleAccent: 'for creators.',
      subtitle: 'Explore portfolios made with our platform',
      visitBtn: 'Visit',
    },
    footer: {
      tagline: 'Build, publish and share your portfolio with the world.',
      nav: 'Navigation',
      links: {
        docs: 'Documents',
        community: 'Community',
        login: 'Sign In',
        register: 'Register',
      },
      social: 'Connect',
      legal: 'Legal',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      copyright: '© 2025 CMS Portfolio. All rights reserved.',
    },
    dashboard: {
      myPortfolios: 'My Portfolios',
      noPortfolios: 'No portfolios yet',
      createPortfolio: 'Create Portfolio',
      newPortfolio: 'New Portfolio',
      portfoliosCount: 'portfolio',
      portfoliosCountPlural: 'portfolios',
      private: 'Private',
      public: 'Public',
      manage: 'Manage',
      delete: 'Delete portfolio',
      pages: 'Pages',
      noPages: 'No pages yet',
      createPage: 'Create Page',
      newPage: 'New Page',
      sections: 'section',
      sectionsPlural: 'sections',
      dashboard: 'Dashboard',
      community: 'Community',
      signOut: 'Sign out'
    },
  },
  vi: {
    nav: {
      docs: 'Tài liệu',
      community: 'Cộng đồng',
      login: 'Đăng nhập',
    },
    auth: {
      loginTitle: 'Chào mừng trở lại',
      loginSubtitle: 'Đăng nhập vào tài khoản CMS của bạn',
      emailLabel: 'Email',
      emailPlaceholder: 'ban@vidu.com',
      passwordLabel: 'Mật khẩu',
      passwordPlaceholder: '••••••••',
      signInBtn: 'Đăng nhập',
      signingInBtn: 'Đang đăng nhập...',
      noAccount: 'Chưa có tài khoản?',
      createOne: 'Tạo tài khoản',
      registerTitle: 'Tạo tài khoản',
      registerSubtitle: 'Bắt đầu xây dựng portfolio của bạn',
      fullNameLabel: 'Họ và tên',
      fullNamePlaceholder: 'Nguyễn Văn A',
      createAccountBtn: 'Tạo tài khoản',
      creatingBtn: 'Đang tạo...',
      alreadyHaveAccount: 'Đã có tài khoản?',
      signInLink: 'Đăng nhập',
    },
    hero: {
      badge: 'Nền tảng CMS mã nguồn mở',
      title: 'Xây dựng Portfolio,',
      titleAccent: 'Theo cách của bạn.',
      description:
        'Một headless CMS giúp người sáng tạo thiết kế, xuất bản và chia sẻ website portfolio ấn tượng — không giới hạn.',
      btnSource: 'Mã nguồn',
      btnStart: 'Bắt đầu',
    },
    features: {
      sectionLabel: 'Tính năng',
      title: 'Mọi thứ bạn cần',
      subtitle: 'Công cụ mạnh mẽ được thiết kế cho người sáng tạo',
      items: [
        {
          name: 'Trình chỉnh sửa Kéo & Thả',
          description:
            'Xây dựng trang trực quan với giao diện kéo thả. Không cần code — chỉ cần sáng tạo.',
          badges: ['Visual Builder', 'No Code', 'Xem trước thực tế'],
        },
        {
          name: 'API Headless',
          description:
            'Truy cập nội dung qua REST API đầy đủ tính năng. Tích hợp với bất kỳ frontend hay nền tảng nào.',
          badges: ['REST API', 'JWT Auth', 'JSON'],
        },
        {
          name: 'Hỗ trợ Đa ngôn ngữ',
          description:
            'Tiếp cận khán giả toàn cầu bằng cách xây dựng portfolio đa ngôn ngữ. Chuyển đổi ngôn ngữ liền mạch.',
          badges: ['i18n Ready', 'RTL Support', 'Tự động phát hiện'],
        },
        {
          name: 'Showcase Cộng đồng',
          description:
            'Khám phá và chia sẻ portfolio với cộng đồng sáng tạo ngày càng lớn. Truyền cảm hứng hoặc được truyền cảm hứng.',
          badges: ['Thư viện công khai', 'Chia sẻ link', 'Cộng đồng'],
        },
      ],
    },
    community: {
      sectionLabel: 'Cộng đồng',
      title: 'Được tạo bởi những người sáng tạo,',
      titleAccent: 'cho những người sáng tạo.',
      subtitle: 'Khám phá các portfolio được tạo trên nền tảng của chúng tôi',
      visitBtn: 'Xem',
    },
    footer: {
      tagline: 'Xây dựng, xuất bản và chia sẻ portfolio của bạn với thế giới.',
      nav: 'Điều hướng',
      links: {
        docs: 'Tài liệu',
        community: 'Cộng đồng',
        login: 'Đăng nhập',
        register: 'Đăng ký',
      },
      social: 'Kết nối',
      legal: 'Pháp lý',
      terms: 'Điều khoản dịch vụ',
      privacy: 'Chính sách bảo mật',
      copyright: '© 2025 CMS Portfolio. Bảo lưu mọi quyền.',
    },
    dashboard: {
      myPortfolios: 'Portfolio của tôi',
      noPortfolios: 'Chưa có portfolio nào',
      createPortfolio: 'Tạo Portfolio',
      newPortfolio: 'Portfolio mới',
      portfoliosCount: 'portfolio',
      portfoliosCountPlural: 'portfolio',
      private: 'Riêng tư',
      public: 'Công khai',
      manage: 'Quản lý',
      delete: 'Xóa portfolio',
      pages: 'Trang',
      noPages: 'Chưa có trang nào',
      createPage: 'Tạo Trang',
      newPage: 'Trang mới',
      sections: 'phần',
      sectionsPlural: 'phần',
      dashboard: 'Bảng điều khiển',
      community: 'Cộng đồng',
      signOut: 'Đăng xuất'
    },
  },
};

export type Translations = typeof translations.en;

export function t(language: Language): Translations {
  return translations[language] as Translations;
}
