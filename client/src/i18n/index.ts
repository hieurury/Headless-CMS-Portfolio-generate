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
      signOut: 'Sign out',
    },
    editor: {
      topbar: {
        edit: 'Edit',
        preview: 'Preview',
        save: 'Save',
        saving: 'Saving...',
        saved: 'Saved!',
        unsaved: 'Save',
        toggleLeftPanel: 'Toggle left panel',
        toggleRightPanel: 'Toggle right panel',
        editModeTitle: 'Edit mode — click elements to edit inline',
        previewModeTitle: 'Preview mode — links and interactions work normally',
        add: 'Add',
        switchToVietnamese: 'Switch to Vietnamese',
        switchToEnglish: 'Switch to English',
        modeEditor: '✏ Editor',
        modePreview: '👁 Preview',
        pageSettings: 'Settings',
      },
      tabs: {
        ai: 'AI',
        layers: 'Layers',
        settings: 'Settings',
      },
      layersPanel: {
        addBlockInside: 'Add block inside',
        remove: 'Remove',
        removeConfirm: 'Remove "{type}"?',
        title: 'Layers',
        add: 'Add',
        emptyState: 'No layers',
      },
      aiPanel: {
        header: 'AI Layout Generator',
        subtitle: 'Powered by AI Layout Engine',
        promptPlaceholder:
          'e.g. Portfolio for a React developer named John with dark theme. Include about, skills section with React and Node.js, 3 projects with GitHub links, and a contact form with social links.',
        promptTooShort: 'Prompt must be at least 10 characters',
        ready: '✓ Ready',
        moreCharsNeeded: 'more chars needed',
        generateLayout: 'Generate Layout',
        generating: 'Generating…',
        intelligenceNote:
          'This will modify or append to your current layout intelligently.',
        generateFailed: 'Generation failed — please try again',
      },
      pageSettings: {
        title: 'Page Settings',
        save: 'Save Settings',
        saving: 'Saving...',
        saved: 'Saved!',
        reset: 'Reset to Default',
        menuGeneral: 'General',
        menuFormat: 'Formatting',
        generalTitle: 'Page Layout',
        generalDesc: 'Configure the page width and margin settings.',
        layoutNormal: 'Normal',
        layoutNormalDesc: 'Page spans the full frame width',
        layoutFluid: 'Fluid',
        layoutFluidDesc: 'Page is constrained with side margins',
        layoutCustom: 'Custom',
        layoutCustomDesc: 'Set custom padding on each side',
        paddingTop: 'Top',
        paddingRight: 'Right',
        paddingBottom: 'Bottom',
        paddingLeft: 'Left',
        formatTitle: 'Formatting',
        formatDesc: 'Define your design system: brand colors and typography.',
        colorsTitle: 'Color Palette',
        colorsLightMode: 'Light Mode',
        colorsDarkMode: 'Dark Mode',
        colorPrimary: 'Primary',
        colorSecondary: 'Secondary',
        colorAccents: 'Accent Colors',
        addAccent: 'Add accent',
        maxAccents: 'Maximum 5 accent colors',
        fontsTitle: 'Typography',
        fontHeading: 'Heading Font',
        fontBody: 'Body Font',
        fontPreview: 'The quick brown fox jumps over the lazy dog.',
      },
      sectionList: {
        header: 'Sections',
        add: 'Add',
        noSections: 'No sections yet',
        emptyHint: 'Use AI Generate or Add to get started',
        dragToReorder: 'Drag to reorder',
        moveUp: 'Move up',
        moveDown: 'Move down',
        deleteSection: 'Delete section',
        deleteConfirm: 'Delete "{type}" section?',
      },
      seoSettingsPanel: {
        title: 'SEO & AI Context',
        globalSeo: 'Global SEO',
        metaTitle: 'Meta Title',
        metaDescription: 'Meta Description',
        ogImage: 'Open Graph Image URL',
        keywords: 'Keywords (comma separated)',
        authorName: 'Author Name',
        jobTitle: 'Job Title / Role',
        shortBio: 'Short Bio',
        placeholderDescription: 'Brief description for search engines...',
        placeholderOgImage: 'https://example.com/image.png',
        placeholderKeywords: 'portfolio, designer, react...',
        placeholderAuthorName: 'John Doe',
        placeholderJobTitle: 'Frontend Developer',
        placeholderShortBio: 'A short factual bio for AI to digest...',
        saveSettings: 'Save Settings',
        saving: 'Saving...',
        saved: 'Saved!',
        helpText:
          'These fields generate JSON-LD schema to help AI engines understand your identity and work.',
      },
      selectionPanel: {
        noSelection: 'No block selected',
        clickToEdit: 'Click any block in the preview to edit',
        clickTextImages: '✏ Click text or images directly in the preview',
        child: 'child',
      },
      propEditor: {
        propsLabel: 'Props —',
        ctrlApply: 'Ctrl+S to apply',
        applyProps: 'Apply Props',
        applied: 'Applied!',
      },
      inlineFieldEditor: {
        openInPanel: 'Open in Properties Panel',
        listFieldHint: 'This list field requires editing in the full panel.',
        confirm: 'Confirm',
        failedImage: 'Unable to load image from this URL',
        linkHint: 'Use #name to scroll, /page for navigation',
        linkPlaceholder: '#section, /page, or https://...',
        imagePlaceholder: 'https://example.com/image.png',
        booleanOn: 'On',
        booleanOff: 'Off',
      },
      smartPropEditor: {
        linkPlaceholder: '#section, /page, or https://...',
        colorPlaceholder: '#000000 or rgba(0,0,0,0.5)',
        clearColor: 'Clear color',
        imagePlaceholder: 'https://example.com/image.png',
        linkHint:
          'Use #name to scroll to a section, /page for navigation, or full URL',
        spacingHint:
          'CSS shorthand — e.g. 8px 16px (T/B · L/R) or 4px 8px 12px 0 (T · R · B · L)',
        addItem: 'Add {item}',
        rawJson: 'Raw JSON',
        tableHint:
          '💡 Edit the table directly in the design canvas to change rows and columns.',
      },
      addSectionPanel: {
        addBlockToContainer: 'Add Block to Container',
        addToPage: 'Add to Page',
        containerHint: 'Block will be placed inside the container',
        searchTemplates: 'Search templates...',
        searchBlocks: 'Search blocks...',
        searchLayout: 'Search layout containers...',
        all: 'All',
        templates: 'Patterns', // sửa
        blocks: 'Blocks',
        layout: 'Layouts',
        templatesHint:
          'Templates are pre-built layout trees — every element inside is directly editable',
        blocksHint:
          'Atomic blocks — combine them inside Layout containers for complex designs',
        containersHint:
          'Containers — hold and arrange blocks. Nest freely: Card inside Columns, Rows of Buttons...',
        containerLabel: 'CONTAINER',
        // Mapping entries for templates (by template id) and components (by entry.type)
        templateEntries: {
          'navbar-default': {
            name: 'Navbar',
            description: 'Sticky navigation bar with logo and links',
          },
          'image-card': {
            name: 'Image Card',
            description: 'A feature card with an image and descriptive content',
          },
        },
        componentEntries: {
          'nav-bar-wrapper': {
            name: 'Navbar Wrapper',
            description:
              'Sticky navbar container. Drop Columns(2) inside → left: Logo. right: NavGroup with Links + Button.',
          },
          columns: {
            name: 'Columns',
            description:
              'Split into N side-by-side columns — each column holds one block directly',
          },
          rows: {
            name: 'Rows',
            description: 'Split into N rows',
          },
          flex: {
            name: 'Flex',
            description:
              'Flexible container — children auto-size to content. Perfect for button groups, icon rows, tags, and any layout where items should not be forced into equal-width cells.',
          },
          container: {
            name: 'Container',
            description:
              'Full-size position wrapper — places one block at any of 9 positions within the cell using separate X/Y controls',
          },
          heading: {
            name: 'Heading',
            description:
              'A title or heading text with size, weight, and color options',
          },
          link: {
            name: 'Link',
            description:
              'A single hyperlink — nav style, inline, underline, or pill. Atomic unit for navigation and text links.',
          },
          button: {
            name: 'Button',
            description: 'A call-to-action button with customizable style',
          },
          icon: {
            name: 'Icon',
            description:
              'A Lucide icon with optional background shape and accent color. Atomic — use inside cards, feature rows, or headings.',
          },
          image: {
            name: 'Image',
            description:
              'An image block with customizable aspect ratio, fit, and rounded corners',
          },
          description: {
            name: 'Description',
            description:
              'A block of text suitable for paragraphs, descriptions, or body copy',
          },
          badge: {
            name: 'Badge',
            description:
              'A small tag or badge used to highlight status, tags, or features',
          },
          table: {
            name: 'Table',
            description: 'A data table with rows and columns',
          },
        },
        noResults: 'No results for "{query}"',
        tryDifferentKeyword: 'Try a different keyword',
      },
      emptyCanvasPrompt: {
        heading: 'Start with AI',
        description:
          'Describe your portfolio and AI will generate a full layout in seconds.',
        addBlocksManually: 'Add blocks manually',
        promptPlaceholder:
          'e.g. Portfolio for a React developer named John with dark theme. Include about, skills (React, Node, Docker), 3 projects with GitHub links, and a contact form.',
        generate: 'Generate',
        generating: 'Generating…',
        orStartBlank: 'or start blank',
        warning: 'AI generation will replace the current layout',
        shortPrompt: 'Please describe the portfolio (at least 10 characters)',
        generateFailed: 'Generation failed — please try again',
      },
    },
    components: {
      common: {
        textColor: 'Text Color',
        backgroundColor: 'Background Color',
        margin: 'Margin',
        padding: 'Padding',
        borderRadius: 'Border Radius',
        alignment: 'Alignment',
        alignmentX: 'Horizontal Align (X)',
        alignmentY: 'Vertical Align (Y)',
        anchorName: 'Section Anchor Name',
      },
      navBarWrapper: {
        textColor: 'Text Color',
        backgroundColor: 'Background Color',
        sticky: 'Sticky on Scroll',
        transparent: 'Transparent at Top',
        background: 'Background Style',
        padding: 'Horizontal Padding',
        maxWidth: 'Content Max Width',
      },
      columns: {
        numColumns: 'Number of Columns',
        columnGap: 'Column Gap',
      },
      rows: {
        numRows: 'Number of Rows',
        rowGap: 'Row Gap',
      },
      heading: {
        text: 'Heading Text',
        level: 'Heading Level',
        align: 'Alignment',
        fontSize: 'Font Size',
        fontWeight: 'Font Weight',
        gradientEffect: 'Gradient Effect',
      },
      link: {
        linkText: 'Link Text',
        url: 'URL / Anchor',
        openInNewTab: 'Open in New Tab',
        underline: 'Underline',
        hoverColor: 'Hover Color',
        style: 'Link Style',
        size: 'Link Size',
        showArrowIcon: 'Show Arrow / External Icon',
      },
      button: {
        buttonText: 'Button Text',
        label: 'Button Label',
        icon: 'Icon (emoji)',
        url: 'URL / Anchor',
        variant: 'Button Style',
        size: 'Button Size',
        shape: 'Button Shape',
        iconPosition: 'Icon Position',
        fullWidth: 'Full Width',
      },
      image: {
        imageUrl: 'Image URL',
        imagePlaceholder: 'https://example.com/image.png',
        altText: 'Alt Text',
        width: 'Width',
        height: 'Height',
        objectFit: 'Object Fit',
        aspectRatio: 'Aspect Ratio',
      },
      description: {
        descriptionText: 'Description Text',
        fontSize: 'Font Size',
      },
      badge: {
        badgeText: 'Badge Text',
        variant: 'Badge Style',
      },
      flex: {
        direction: 'Direction',
        gap: 'Gap',
        justify: 'Justify Content',
        align: 'Align Items',
      },
      table: {
        tableData: 'Table Data (JSON)',
        headerBgColor: 'Header Background Color',
        borderColor: 'Border Color',
        striped: 'Striped Rows',
        bordered: 'Bordered',
      },
      icon: {
        iconName: 'Icon Name',
        size: 'Size',
        color: 'Color',
        bgShape: 'Background Shape',
        accentColor: 'Accent Color',
      },
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
      signOut: 'Đăng xuất',
    },
    editor: {
      topbar: {
        edit: 'Chỉnh sửa',
        preview: 'Xem trước',
        save: 'Lưu',
        saving: 'Đang lưu...',
        saved: 'Đã lưu!',
        unsaved: 'Lưu',
        toggleLeftPanel: 'Chuyển trái',
        toggleRightPanel: 'Chuyển phải',
        editModeTitle:
          'Chế độ chỉnh sửa — nhấp vào phần tử để chỉnh sửa trực tiếp',
        previewModeTitle:
          'Chế độ xem trước — liên kết và tương tác hoạt động bình thường',
        add: 'Thêm',
        switchToVietnamese: 'Chuyển sang Tiếng Việt',
        switchToEnglish: 'Chuyển sang Tiếng Anh',
        modeEditor: '✏ Trình chỉnh sửa',
        modePreview: '👁 Xem trước',
        pageSettings: 'Cài đặt',
      },
      tabs: {
        ai: 'AI',
        layers: 'Lớp',
        settings: 'Cài đặt',
      },
      layersPanel: {
        addBlockInside: 'Thêm block vào trong',
        remove: 'Xoá',
        removeConfirm: 'Xoá "{type}"?',
        title: 'Các lớp',
        add: 'Thêm',
        emptyState: 'Chưa có lớp nào',
      },
      aiPanel: {
        header: 'Trình tạo bố cục AI',
        subtitle: 'Được hỗ trợ bởi AI Layout Engine',
        promptPlaceholder:
          'ví dụ: Portfolio cho một developer React tên John với giao diện tối. Bao gồm about, kỹ năng (React, Node, Docker), 3 dự án có liên kết GitHub, và một form liên hệ.',
        promptTooShort: 'Vui lòng mô tả portfolio (ít nhất 10 ký tự)',
        ready: '✓ Sẵn sàng',
        moreCharsNeeded: 'ký tự nữa',
        generateLayout: 'Tạo bố cục',
        generating: 'Đang tạo…',
        intelligenceNote:
          'Điều này sẽ thay thế hoặc thêm vào bố cục hiện có một cách thông minh.',
        generateFailed: 'Tạo bố cục thất bại — vui lòng thử lại',
      },
      pageSettings: {
        title: 'Cài đặt trang',
        save: 'Lưu cài đặt',
        saving: 'Đang lưu...',
        saved: 'Đã lưu!',
        reset: 'Đặt lại mặc định',
        menuGeneral: 'Tổng quát',
        menuFormat: 'Định dạng',
        generalTitle: 'Bố cục trang',
        generalDesc: 'Cấu hình kích thước và lề trang web.',
        layoutNormal: 'Normal',
        layoutNormalDesc: 'Trang chiếm toàn bộ khung hình',
        layoutFluid: 'Fluid',
        layoutFluidDesc: 'Trang được ép lề 2 bên vào',
        layoutCustom: 'Tùy chỉnh',
        layoutCustomDesc: 'Thiết lập lề riêng cho từng hướng',
        paddingTop: 'Trên',
        paddingRight: 'Phải',
        paddingBottom: 'Dưới',
        paddingLeft: 'Trái',
        formatTitle: 'Định dạng',
        formatDesc: 'Xác định hệ thống thiết kế: màu sắc thương hiệu và phông chữ.',
        colorsTitle: 'Bảng màu sắc',
        colorsLightMode: 'Chế độ sáng',
        colorsDarkMode: 'Chế độ tối',
        colorPrimary: 'Màu chính 1',
        colorSecondary: 'Màu chính 2',
        colorAccents: 'Màu phụ',
        addAccent: 'Thêm màu phụ',
        maxAccents: 'Tối đa 5 màu phụ',
        fontsTitle: 'Phông chữ',
        fontHeading: 'Phông chữ tiêu đề',
        fontBody: 'Phông chữ thân',
        fontPreview: 'Hàng bé cầm bút chì và được xem là vạn năng.',
      },
      sectionList: {
        header: 'Phần',
        add: 'Thêm',
        noSections: 'Chưa có phần nào',
        emptyHint: 'Sử dụng AI Generate hoặc Thêm để bắt đầu',
      },
      seoSettingsPanel: {
        title: 'SEO & Ngữ cảnh AI',
        globalSeo: 'SEO toàn cục',
        metaTitle: 'Tiêu đề Meta',
        metaDescription: 'Mô tả Meta',
        ogImage: 'URL Ảnh Open Graph',
        keywords: 'Từ khóa (ngăn cách bằng dấu phẩy)',
        authorName: 'Tên tác giả',
        jobTitle: 'Chức danh / Vai trò',
        shortBio: 'Tiểu sử ngắn',
        placeholderDescription: 'Mô tả ngắn cho công cụ tìm kiếm...',
        placeholderOgImage: 'https://example.com/image.png',
        placeholderKeywords: 'portfolio, designer, react...',
        placeholderAuthorName: 'John Doe',
        placeholderJobTitle: 'Frontend Developer',
        placeholderShortBio: 'Tiểu sử ngắn gọn để AI hiểu...',
        saveSettings: 'Lưu cài đặt',
        saving: 'Đang lưu...',
        saved: 'Đã lưu!',
        helpText:
          'Những trường này tạo schema JSON-LD để giúp AI và công cụ tìm kiếm hiểu bạn và công việc của bạn.',
      },
      selectionPanel: {
        noSelection: 'Chưa chọn block nào',
        clickToEdit: 'Nhấp vào block bất kỳ trong bản xem trước để chỉnh sửa',
        clickTextImages:
          '✏ Nhấp vào văn bản hoặc hình ảnh trực tiếp trong bản xem trước',
        child: 'phần con',
      },
      propEditor: {
        propsLabel: 'Props —',
        ctrlApply: 'Ctrl+S để áp dụng',
        applyProps: 'Áp dụng Props',
        applied: 'Đã áp dụng!',
      },
      inlineFieldEditor: {
        openInPanel: 'Mở trong Properties Panel',
        listFieldHint: 'Trường danh sách — cần chỉnh sửa trong panel đầy đủ.',
        confirm: 'Xác nhận',
        failedImage: 'Không tải được ảnh từ URL này',
        linkHint: 'Dùng #name để scroll, /page để điều hướng',
        linkPlaceholder: '#section, /page, hoặc https://...',
        imagePlaceholder: 'https://example.com/image.png',
        booleanOn: 'Bật',
        booleanOff: 'Tắt',
      },
      smartPropEditor: {
        linkPlaceholder: '#section, /page, hoặc https://...',
        colorPlaceholder: '#000000 hoặc rgba(0,0,0,0.5)',
        clearColor: 'Xóa màu',
        imagePlaceholder: 'https://example.com/image.png',
        linkHint:
          'Dùng #name để scroll đến phần, /page để điều hướng, hoặc URL đầy đủ',
        spacingHint:
          'CSS shorthand — ví dụ 8px 16px (T/B · L/R) hoặc 4px 8px 12px 0 (T · R · B · L)',
        addItem: 'Thêm {item}',
        rawJson: 'JSON thô',
        tableHint:
          '💡 Chỉnh sửa trực tiếp bảng trên khung thiết kế để thay đổi hàng và cột.',
      },
      addSectionPanel: {
        addBlockToContainer: 'Thêm block vào container',
        addToPage: 'Thêm vào trang',
        containerHint: 'Block sẽ được đặt bên trong container',
        searchTemplates: 'Tìm kiếm mẫu...',
        searchBlocks: 'Tìm kiếm block...',
        searchLayout: 'Tìm kiếm bố cục...',
        all: 'Tất cả',
        templates: 'Mẫu', // sửa
        blocks: 'Block',
        layout: 'Bố cục',
        templatesHint:
          'Mẫu là cây bố cục có sẵn — mọi phần tử bên trong đều có thể chỉnh sửa trực tiếp',
        blocksHint:
          'Block atomic — kết hợp chúng bên trong các container Layout để thiết kế phức tạp',
        containersHint:
          'Container — chứa và sắp xếp block. Lồng tự do: Card trong Columns, Rows của Buttons...',
        containerLabel: 'CONTAINER',
        // Mapping entries for templates (by template id) and components (by entry.type)
        templateEntries: {
          'navbar-default': {
            name: 'Thanh điều hướng',
            description:
              'Thanh điều hướng cố định tích hợp logo và các liên kết',
          },
          'image-card': {
            name: 'Thẻ hình ảnh',
            description:
              'Thẻ tính năng bao gồm một hình ảnh và nội dung mô tả đi kèm',
          },
        },
        componentEntries: {
          'nav-bar-wrapper': {
            name: 'Khung thanh điều hướng',
            description:
              'Khung chứa thanh điều hướng cố định. Thả các Cột (2) vào bên trong, bên trái: Logo....',
          },
          columns: {
            name: 'Chia cột',
            description:
              'Chia thành N cột song song cạnh nhau, mỗi cột chứa một khối block...',
          },
          rows: {
            name: 'Chia hàng',
            description: 'Chia thành N hàng dọc xếp chồng lên nhau',
          },
          flex: {
            name: 'Khung linh hoạt (Flex)',
            description:
              'Khung chứa linh hoạt — các phần tử con tự động điều chỉnh kích thước theo nội dung. Hoàn hảo cho nút bấm...',
          },
          container: {
            name: 'Khung chứa',
            description:
              'Khung bao vị trí kích thước đầy đủ — đặt một khối tại bất kỳ vị trí nào trong 9 vị trí với...',
          },
          heading: {
            name: 'Tiêu đề',
            description:
              'Đoạn văn bản tiêu đề với các tùy chọn về kích thước, độ đậm và màu sắc',
          },
          link: {
            name: 'Liên kết',
            description:
              'Một đường dẫn liên kết đơn lẻ — kiểu điều hướng, nội dòng, gạch chân hoặc dạng hạt đậu. Đơn vị cơ bản cho...',
          },
          button: {
            name: 'Nút bấm',
            description:
              'Nút kêu gọi hành động với phong cách có thể tùy chỉnh linh hoạt',
          },
          icon: {
            name: 'Biểu tượng',
            description:
              'Một biểu tượng Lucide với tùy chọn hình nền và màu sắc điểm nhấn...',
          },
          image: {
            name: 'Hình ảnh',
            description:
              'Khối hình ảnh với các tùy chọn tùy chỉnh tỷ lệ khung hình, chế độ hiển thị và bo góc',
          },
          description: {
            name: 'Đoạn văn mô tả',
            description:
              'Một khối văn bản phù hợp cho các đoạn văn, mô tả hoặc nội dung chính...',
          },
          badge: {
            name: 'Nhãn / Thẻ phụ',
            description:
              'Một thẻ nhỏ hoặc nhãn dùng để làm nổi bật trạng thái, từ khóa hoặc các tính năng',
          },
          table: {
            name: 'Bảng dữ liệu',
            description: 'Bảng dữ liệu cấu trúc dạng các hàng và các cột',
          },
        },
        noResults: 'Không tìm thấy kết quả cho "{query}"',
        tryDifferentKeyword: 'Thử từ khóa khác',
      },
      emptyCanvasPrompt: {
        heading: 'Bắt đầu với AI',
        description:
          'Mô tả portfolio của bạn và AI sẽ tạo bố cục đầy đủ trong vài giây.',
        addBlocksManually: 'Thêm block thủ công',
        promptPlaceholder:
          'ví dụ: Portfolio cho một developer React tên John với giao diện tối. Bao gồm about, kỹ năng (React, Node, Docker), 3 dự án có liên kết GitHub, và một form liên hệ.',
        generate: 'Tạo',
        generating: 'Đang tạo…',
        orStartBlank: 'hoặc bắt đầu trống',
        warning: 'AI sẽ thay thế bố cục hiện tại',
        shortPrompt: 'Vui lòng mô tả portfolio (ít nhất 10 ký tự)',
        generateFailed: 'Tạo không thành công — vui lòng thử lại',
      },
    },
    components: {
      common: {
        textColor: 'Màu chữ',
        backgroundColor: 'Màu nền',
        margin: 'Căn lề ngoài (Margin)',
        padding: 'Khoảng đệm trong (Padding)',
        borderRadius: 'Bán kính bo góc',
        alignment: 'Căn chỉnh',
        alignmentX: 'Căn ngang (X)',
        alignmentY: 'Căn dọc (Y)',
        anchorName: 'Tên Neo vị trí (Anchor)',
      },
      navBarWrapper: {
        textColor: 'Màu chữ',
        backgroundColor: 'Màu nền',
        sticky: 'Cố định khi cuộn trang',
        transparent: 'Trong suốt khi ở trên cùng',
        background: 'Kiểu nền',
        padding: 'Khoảng đệm ngang',
        maxWidth: 'Chiều rộng tối đa nội dung',
      },
      columns: {
        numColumns: 'Số lượng cột',
        columnGap: 'Khoảng cách giữa các cột',
      },
      rows: {
        numRows: 'Số lượng hàng',
        rowGap: 'Khoảng cách giữa các hàng',
      },
      heading: {
        text: 'Văn bản tiêu đề',
        level: 'Cấp độ tiêu đề (H1-H6)',
        align: 'Căn chỉnh chữ',
        fontSize: 'Kích thước chữ',
        fontWeight: 'Độ đậm chữ',
        gradientEffect: 'Hiệu ứng màu Gradient',
      },
      link: {
        linkText: 'Chữ hiển thị liên kết',
        url: 'Đường dẫn / Neo trang',
        openInNewTab: 'Mở trong tab mới',
        underline: 'Gạch chân',
        hoverColor: 'Màu sắc khi di chuột (Hover)',
        style: 'Kiểu dáng liên kết',
        size: 'Kích thước liên kết',
        showArrowIcon: 'Hiển thị mũi tên / Biểu tượng ngoài',
      },
      button: {
        buttonText: 'Chữ trên nút bấm',
        label: 'Nhãn nút bấm',
        icon: 'Biểu tượng (Emoji)',
        url: 'Đường dẫn / Neo trang',
        variant: 'Kiểu dáng nút',
        size: 'Kích thước nút',
        shape: 'Hình dáng nút',
        iconPosition: 'Vị trí biểu tượng',
        fullWidth: 'Chiều rộng tối đa (100%)',
      },
      image: {
        imageUrl: 'Đường dẫn ảnh (URL)',
        imagePlaceholder: 'https://example.com/image.png',
        altText: 'Văn bản thay thế (Alt)',
        width: 'Chiều rộng',
        height: 'Chiều cao',
        objectFit: 'Chế độ thu phóng ảnh (Object Fit)',
        aspectRatio: 'Tỷ lệ khung hình (Aspect Ratio)',
      },
      description: {
        descriptionText: 'Văn bản mô tả',
        fontSize: 'Kích thước chữ',
      },
      badge: {
        badgeText: 'Văn bản huy hiệu',
        variant: 'Kiểu dáng huy hiệu',
      },
      flex: {
        direction: 'Hướng sắp xếp (Direction)',
        gap: 'Khoảng cách phần tử (Gap)',
        justify: 'Căn chỉnh trục chính (Justify)',
        align: 'Căn chỉnh trục phụ (Align)',
      },
      table: {
        tableData: 'Dữ liệu bảng cấu trúc (JSON)',
        headerBgColor: 'Màu nền tiêu đề bảng',
        borderColor: 'Màu sắc đường viền',
        striped: 'Dòng kẻ sọc xen kẽ',
        bordered: 'Hiển thị đầy đủ đường viền',
      },
      icon: {
        iconName: 'Tên biểu tượng',
        size: 'Kích thước',
        color: 'Màu sắc',
        bgShape: 'Hình dáng nền biểu tượng',
        accentColor: 'Màu sắc điểm nhấn',
      },
    },
  },
};

export type Translations = typeof translations.en;

export function t(language: Language): Translations {
  return translations[language] as Translations;
}
