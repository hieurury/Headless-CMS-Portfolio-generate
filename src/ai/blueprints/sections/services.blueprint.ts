import type { SectionBlueprint } from '../types';

export const servicesBlueprint: SectionBlueprint = {
  id: 'services',
  naturalAliases: [
    'dịch vụ', 'services', 'tôi có thể làm gì', 'what i offer',
    'offerings', 'tôi cung cấp', 'gói dịch vụ', 'packages',
    'tôi làm được gì', 'dịch vụ cung cấp', 'bảng giá',
    'pricing', 'giá cả', 'báo giá', 'hire me',
    'thuê tôi để', 'tôi nhận làm', 'freelance services',
    'tôi có thể giúp gì', 'i can help with',
  ],
  purpose: `Section thể hiện cụ thể chủ nhân có thể làm gì cho khách hàng/visitor.
    Chuyển từ "tôi là ai" sang "tôi có thể giúp bạn như thế nào".
    Cần rõ ràng, actionable, và thuyết phục.`,
  designPrinciples: [
    'Mỗi service cần: tên rõ ràng + mô tả value (không phải process) + icon đại diện',
    'Nhấn mạnh lợi ích cho khách hàng, không phải danh sách tính năng kỹ thuật',
    'Nếu có giá, hiển thị rõ ràng — không bắt visitor phải liên hệ mới biết',
    '3–6 services là optimal — quá nhiều gây overwhelm',
    'CTA button ở cuối section: "Liên hệ ngay" hoặc "Nhận báo giá"',
    'Style nhất quán giữa các service cards tạo trust',
  ],
  variations: [
    {
      name: 'Icon Feature Cards — 3 cột',
      whenToUse: `Pattern phổ biến nhất cho services. Clean, dễ scan, professional.
        Phù hợp hầu hết ngành — developer, designer, consultant, coach.`,
      keyCharacteristics: [
        'columns(3, gap:lg) với mỗi cell là container(style:glass hoặc card)',
        'Bên trong: rows → icon(size:lg, shape:rounded, accent đa dạng) → heading(h3) → description → optional button',
        'Optional: badge "Popular" hoặc badge giá ở đầu card',
        'CTA button toàn section ở cuối (container căn giữa với button primary)',
      ],
    },
    {
      name: 'Pricing Cards — Với mức giá',
      whenToUse: `Khi dịch vụ có package rõ ràng và muốn show giá.
        Phù hợp freelancer, designer, photographer.`,
      keyCharacteristics: [
        'columns(2 hoặc 3) với mỗi card là 1 package',
        'Mỗi card: rows → badge(tier name) → heading(price) → description → list features (description items) → button',
        'Highlight 1 card "Recommended" với container style:filled hoặc màu khác biệt',
        'Buttons: primary cho recommended, outline cho các package khác',
      ],
    },
    {
      name: 'List with Icons — Dạng list dọc',
      whenToUse: `Khi services cần description dài hơn hoặc có bullet points.
        Phù hợp consultant, coach, trainer.`,
      keyCharacteristics: [
        'rows(N) với mỗi row là columns(2, gap:xl): icon/visual trái + content phải',
        'Content: heading(h3) + description + optional badges',
        'Compact và readable, phù hợp services phức tạp cần giải thích',
      ],
    },
    {
      name: 'Minimal CTA List',
      whenToUse: `Khi services đơn giản và muốn focus vào CTA.
        Trang nhẹ, không muốn quá nhiều section.`,
      keyCharacteristics: [
        'rows(N) với mỗi service là flex(justify:between, align:center)',
        'Tên service bên trái + link/button nhỏ bên phải',
        'Divider giữa các items bằng spacing/border',
      ],
    },
  ],
  antiPatterns: [
    'Không dùng jargon kỹ thuật trong tên service — viết cho khách hàng hiểu',
    'Không để service không có CTA — mỗi service nên có action tiếp theo',
    'Không list 10+ services — gây overwhelm, chọn core services',
    'Không để tất cả services cùng icon shape/accent — thiếu variety',
  ],
  recommendedProps: {
    cardStyle: '"glass" trên dark bg — premium feel',
    iconAccent: 'Mỗi service icon một màu accent khác nhau',
    ctaButtonVariant: '"primary" hoặc "success" — action mạnh',
    ctaButtonShape: '"pill" — modern và inviting',
  },
  typicalPosition: 'middle',
};
