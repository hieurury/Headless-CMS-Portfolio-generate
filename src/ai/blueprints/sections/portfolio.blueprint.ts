import type { SectionBlueprint } from '../types';

export const portfolioBlueprint: SectionBlueprint = {
  id: 'portfolio',
  naturalAliases: [
    'portfolio', 'dự án', 'công việc', 'work', 'projects', 'project',
    'showcase', 'thành phẩm', 'tác phẩm', 'sản phẩm', 'bộ sưu tập',
    'gallery', 'triển lãm', 'case study', 'examples', 'ví dụ công việc',
    'chứng minh năng lực', 'thành tích', 'show work', 'các dự án',
    'món ăn', 'thiết kế đã làm', 'ảnh chụp', 'công trình',
  ],
  purpose: `Section thể hiện bằng chứng thực tế về năng lực và phong cách làm việc.
    Đây là nơi visitor đánh giá xem chủ nhân có phù hợp với nhu cầu của họ không.
    Cần vừa visual hấp dẫn vừa cung cấp đủ context để hiểu từng item.`,
  designPrinciples: [
    'Mỗi item cần ít nhất: ảnh/visual + tên + mô tả ngắn',
    'Grid layout (columns 2–3) thường hiệu quả hơn list dọc đơn thuần',
    'Ảnh preview quan trọng — dùng Unsplash photos phù hợp với lĩnh vực',
    'Tags/badges cho tech stack hoặc category giúp visitor lọc nhanh',
    'Padding nội tại của từng card: ≥1.5rem để text không sát viền',
    'Heading section rõ ràng ở đầu, có thể kèm badge "Featured Work" hoặc số lượng',
    'Nên có link hoặc button "Xem thêm" nếu có nhiều dự án',
  ],
  variations: [
    {
      name: 'Grid Cards — 3 cột',
      whenToUse: `Khi có nhiều items (3–6+). Layout grid đều nhau, dễ scan.
        Phù hợp nhất cho developer, designer, photographer.`,
      keyCharacteristics: [
        'container(section wrapper) → rows(2): heading section + columns(3, gap:lg)',
        'Mỗi card: container(style:card hoặc glass, borderRadius:xl, padding:1.5rem)',
        'Bên trong card: rows → image(16/9) → heading(h3) → description(sm) → flex badges',
        'Cân nhắc giảm xuống columns(2) nếu content card nhiều chữ',
      ],
    },
    {
      name: 'Featured + Grid — 1 lớn + nhiều nhỏ',
      whenToUse: `Khi muốn highlight 1 dự án nổi bật nhất. Tạo visual hierarchy rõ ràng.
        Phù hợp khi có 1 "best work" muốn visitor chú ý đầu tiên.`,
      keyCharacteristics: [
        'rows(2): hàng trên = featured item to (columns(2) với image lớn bên trái)',
        'Hàng dưới = columns(2 hoặc 3) cho các dự án phụ nhỏ hơn',
        'Featured card dùng image(16/9 hoặc 4/3) kích thước lớn',
      ],
    },
    {
      name: 'List với Visual — Ngang từng hàng',
      whenToUse: `Khi muốn mỗi item có description dài hơn. Phù hợp case studies,
        công trình kiến trúc, hoặc khi visual và text cần cùng trọng lượng.`,
      keyCharacteristics: [
        'rows(N) với mỗi row là columns(2): ảnh trái + content phải (hoặc ngược lại xen kẽ)',
        'Content phía text: rows → heading → description → badges → link button',
        'Có thể xen kẽ ảnh trái/phải giữa các items để tạo nhịp động',
      ],
    },
    {
      name: 'Gallery / Masonry-like',
      whenToUse: `Khi visual là thứ quan trọng nhất (photographer, artist, food stylist).
        Ít text, nhiều ảnh.`,
      keyCharacteristics: [
        'columns(3, gap:sm hoặc md) với ảnh là main content',
        'Image(1/1 hoặc 4/3, objectFit:cover) là primary block trong mỗi cell',
        'Caption ngắn (description, size:sm) phía dưới mỗi ảnh nếu cần',
      ],
    },
  ],
  antiPatterns: [
    'Không để portfolio section không có ảnh — thiếu visual = thiếu impact',
    'Không dùng quá 6 columns trong 1 row — quá nhỏ, không đọc được',
    'Không để description quá dài trong card — 2-3 câu là tối đa',
    'Không bỏ qua badges/tags — chúng giúp visitor hiểu context nhanh',
  ],
  recommendedProps: {
    sectionContainerPadding: '"4rem 2rem" — đủ space mà không quá rộng',
    cardStyle: '"card" hoặc "glass" — tạo visual separation rõ ràng',
    cardBorderRadius: '"xl" hoặc "2xl" — modern và clean',
    imageAspectRatio: '"16/9" cho ảnh ngang, "1/1" cho ảnh vuông portfolio',
  },
};
