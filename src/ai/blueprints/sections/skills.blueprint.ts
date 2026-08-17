import type { SectionBlueprint } from '../types';

export const skillsBlueprint: SectionBlueprint = {
  id: 'skills',
  naturalAliases: [
    'kỹ năng', 'skills', 'thế mạnh', 'chuyên môn', 'năng lực',
    'công cụ', 'tools', 'tech stack', 'stack', 'technology',
    'chuyên sâu', 'expertise', 'specialties', 'specialization',
    'tôi giỏi gì', 'điểm mạnh', 'khả năng', 'what i do',
    'ngôn ngữ lập trình', 'framework', 'phần mềm sử dụng',
    'trang thiết bị', 'dụng cụ nghề nghiệp',
  ],
  purpose: `Section thể hiện những gì chủ nhân giỏi và có thể làm được.
    Giúp visitor nhanh chóng đánh giá xem chủ nhân có phù hợp nhu cầu không.
    Cần rõ ràng, dễ scan, và credible.`,
  designPrinciples: [
    'Dễ scan — visitor nhìn 5 giây phải biết ngay bạn giỏi gì',
    'Nhóm kỹ năng theo category giúp dễ hiểu hơn danh sách flat',
    'Icon + tên combo tạo visual interest hơn là chỉ text',
    'Badge/tag approach phù hợp khi có nhiều skills nhỏ lẻ (tech stack)',
    'Card approach phù hợp khi muốn mô tả sâu hơn từng skill/category',
    'Không cần percentage bar — trông giả tạo và không có giá trị thực',
  ],
  variations: [
    {
      name: 'Icon Grid — Thẻ kỹ năng với icon',
      whenToUse: `Khi muốn visual hấp dẫn với từng kỹ năng có icon đại diện.
        Phù hợp developer, designer, marketer. Tạo cảm giác professional.`,
      keyCharacteristics: [
        'columns(3) với mỗi cell là container(style:glass hoặc card, borderRadius:xl)',
        'Bên trong mỗi card: rows(3) → icon(shape:rounded, accent:violet/indigo) → heading(h4) → description(sm)',
        'Các icon accent color nên đa dạng — dùng violet, indigo, emerald, amber, rose xen kẽ',
        'Padding card: 1.5rem–2rem',
      ],
    },
    {
      name: 'Badge Cloud — Tag dạng pill',
      whenToUse: `Khi có nhiều skills nhỏ lẻ (10+), không cần mô tả từng cái.
        Phù hợp tech stack, ngôn ngữ lập trình, tools, phần mềm.`,
      keyCharacteristics: [
        'flex(direction:row, wrap:wrap, gap:sm, justify:start)',
        'Mỗi badge: variant:subtle hoặc outline, shape:pill, color đa dạng',
        'Có thể nhóm thành rows(N) với từng row là 1 category + badge cloud',
        'Badge size:sm hoặc md là phù hợp nhất',
      ],
    },
    {
      name: 'Category Groups — Nhóm theo lĩnh vực',
      whenToUse: `Khi kỹ năng có thể phân nhóm rõ ràng (Frontend / Backend / DevOps,
        hoặc Nấu ăn / Trang trí / Quản lý). Tạo cấu trúc logic hơn danh sách flat.`,
      keyCharacteristics: [
        'rows(N) với mỗi row là 1 category: heading(h3, category name) + flex badges',
        'Hoặc columns(2/3) với mỗi column là 1 nhóm skills',
        'Heading category ngắn gọn (Frontend, Backend, Design...)',
      ],
    },
    {
      name: 'Highlight với mô tả — Ít kỹ năng, nhiều depth',
      whenToUse: `Khi muốn showcase 3–6 core competencies với mô tả chi tiết.
        Phù hợp senior professional, consultant, specialist.`,
      keyCharacteristics: [
        'columns(2) hoặc columns(3) với cards to',
        'Mỗi card: icon lớn + heading + description 2–3 câu',
        'Ít items nhưng mỗi item thuyết phục hơn',
      ],
    },
  ],
  antiPatterns: [
    'Không dùng progress bar/percentage cho skills — trông giả và vô nghĩa',
    'Không liệt kê quá 20 items flat mà không có grouping — gây overwhelm',
    'Không để tất cả badges cùng màu — đơn điệu và kém visual',
    'Không dùng icon quá nhiều size khác nhau trong cùng grid — mất đồng đều',
  ],
  recommendedProps: {
    iconShape: '"rounded" hoặc "circle" — tạo visual consistency',
    iconAccent: 'Đa dạng: violet, indigo, emerald, amber, rose, sky — không đồng màu',
    badgeVariant: '"subtle" hoặc "outline" — không solid vì quá nặng',
    cardStyle: '"glass" trên dark bg, "card" trên light bg',
  },
  typicalPosition: 'middle',
};
