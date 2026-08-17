import type { SectionBlueprint } from '../types';

export const navBlueprint: SectionBlueprint = {
  id: 'nav',
  naturalAliases: [
    'menu', 'navigation', 'nav', 'thanh menu', 'điều hướng',
    'header', 'đầu trang', 'navbar', 'top bar', 'thanh điều hướng',
  ],
  purpose: `Thanh điều hướng cố định ở đầu trang. Luôn là block đầu tiên
    trong mọi layout. Giúp visitor tìm nhanh các phần của trang
    và thể hiện thương hiệu cá nhân của chủ trang.`,
  designPrinciples: [
    'Luôn là top-level block đầu tiên — không bao giờ đặt sau section khác',
    'Logo/tên ở bên trái, links + CTA ở bên phải là pattern chuẩn phổ biến nhất',
    'Nên sticky: true để theo người dùng khi scroll',
    'Background glass hoặc dark để tạo depth, không để background trong suốt hoàn toàn',
    'Giới hạn tối đa 4–5 navigation links để không gây rối mắt',
    'CTA button trên nav nên là "Liên hệ" hoặc "Thuê tôi" — action rõ ràng nhất',
  ],
  variations: [
    {
      name: 'Logo trái + Links phải + CTA button',
      whenToUse: 'Pattern phổ biến nhất. Dùng khi cần balance giữa brand và navigation.',
      keyCharacteristics: [
        'columns(2) bên trong nav-bar-wrapper',
        'Cột trái: heading nhỏ (logo/tên, size:lg hoặc xl)',
        'Cột phải: flex(row, justify:end, gap:lg) chứa links + 1 button (size:sm, variant:primary)',
        'alignX:right cho cột phải',
      ],
    },
    {
      name: 'Centered Brand',
      whenToUse: 'Khi muốn brand name nổi bật hơn. Phù hợp với creative, artist.',
      keyCharacteristics: [
        'columns(3) với colSpans [1,2,1]',
        'Cột giữa: tên/logo căn giữa',
        'Cột trái và phải: links + button',
      ],
    },
    {
      name: 'Minimal — tên + 2–3 links',
      whenToUse: 'Khi trang đơn giản, không nhiều sections. Phù hợp minimalist design.',
      keyCharacteristics: [
        'flex(row, justify:between, align:center)',
        'Heading nhỏ bên trái + flex links bên phải',
        'Không cần CTA button nếu contact section ở cuối trang',
      ],
    },
  ],
  antiPatterns: [
    'Không nhét quá 6 links vào nav — gây rối và thiếu chuyên nghiệp',
    'Không để nav transparent hoàn toàn khi có content bên dưới — mất readability',
    'Không đặt nav bên trong section khác — nó phải là top-level block',
  ],
  recommendedProps: {
    background: '"glass" cho dark theme, "light" cho light theme',
    sticky: 'true — luôn để true',
    padding: '"lg" — đủ breathing space',
    maxWidth: '"xl" hoặc "2xl" — tùy layout tổng thể trang',
  },
};
