import type { SectionBlueprint } from '../types';

export const contactBlueprint: SectionBlueprint = {
  id: 'contact',
  naturalAliases: [
    'liên hệ', 'contact', 'kết nối', 'get in touch', 'reach out',
    'nhắn tin', 'email', 'liên lạc', 'thuê tôi', 'hire me',
    'làm việc cùng', 'work with me', 'gặp gỡ', 'nói chuyện',
    'bắt đầu dự án', 'start a project', 'cộng tác', 'collaborate',
    'tìm tôi ở đâu', 'mạng xã hội', 'social', 'links',
  ],
  purpose: `Section cuối cùng — đây là nơi visitor chuyển thành lead hoặc connection.
    Phải dễ dàng và không tạo friction. Một CTA rõ ràng và các kênh liên lạc
    là tất cả những gì cần thiết.`,
  designPrinciples: [
    'Đơn giản là vàng — quá nhiều options làm visitor không biết làm gì',
    'Email và/hoặc social links là minimum cần thiết',
    'CTA text nên conversational và friendly, không phải formal',
    'Background khác biệt (dark hoặc accent color) để tạo section break rõ ràng',
    'Heading section cần warm và inviting — "Cùng nhau làm điều gì đó?" tốt hơn "Liên hệ"',
    'Vị trí: luôn là section cuối của trang',
  ],
  variations: [
    {
      name: 'CTA + Social Links',
      whenToUse: `Pattern phổ biến nhất và hiệu quả nhất. Heading kêu gọi + email/links.
        Không cần form — đơn giản, clean, dễ scan.`,
      keyCharacteristics: [
        'container(alignX:center, padding:5rem 2rem, backgroundColor đậm hoặc accent)',
        'rows: heading(h2, center) → description(center, tone inviting) → flex(justify:center, gap:lg)',
        'flex chứa: button email/primary + buttons social với icon',
        'Social links: variant outline hoặc ghost, shape:pill',
      ],
    },
    {
      name: 'Split — Text trái + Links phải',
      whenToUse: `Khi muốn balance text content với contact options. Phù hợp khi
        muốn viết message dài hơn về cách làm việc.`,
      keyCharacteristics: [
        'columns(2, gap:xl)',
        'Cột trái: rows → heading + description (mô tả process hoặc lời kêu gọi)',
        'Cột phải: rows → rows link items (icon + label cho từng contact channel)',
      ],
    },
    {
      name: 'Icon Cards — Các kênh liên hệ dạng card',
      whenToUse: `Khi có nhiều kênh liên hệ muốn hiển thị rõ ràng (email, phone, LinkedIn, GitHub...).`,
      keyCharacteristics: [
        'columns(2 hoặc 3) với mỗi card là 1 contact channel',
        'Card: icon(channel icon) + heading(channel name) + description(handle/address) + button link',
        'Minimal card style — outlined hoặc glass',
      ],
    },
  ],
  antiPatterns: [
    'Không để section contact trống hoặc chỉ có "Contact Me" không có link/email',
    'Không dùng form phức tạp — ngoài khả năng block system hiện tại',
    'Không đặt contact ở giữa trang — luôn là section cuối',
    'Không viết CTA dạng yêu cầu ("Điền form dưới đây") — dùng inviting tone',
  ],
  recommendedProps: {
    sectionBackgroundColor: 'Màu đậm hoặc khác với sections trên — "#0a0a0f", "#111827"',
    headingSize: '"3xl" hoặc "4xl" — prominent nhưng không át intro section',
    buttonVariant: '"primary" cho email/main CTA, "ghost" hoặc "outline" cho social',
    ctaButtonShape: '"pill" — friendly và approachable',
  },
  typicalPosition: 'last',
};
