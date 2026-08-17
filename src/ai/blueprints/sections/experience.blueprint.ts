import type { SectionBlueprint } from '../types';

export const experienceBlueprint: SectionBlueprint = {
  id: 'experience',
  naturalAliases: [
    'kinh nghiệm', 'experience', 'quá trình', 'lịch sử làm việc',
    'work history', 'career', 'sự nghiệp', 'timeline', 'dòng thời gian',
    'đã làm việc ở đâu', 'công ty đã qua', 'vị trí đã giữ',
    'quá trình công tác', 'hành trình sự nghiệp', 'journey',
    'trải nghiệm', 'nơi đã làm việc', 'lịch sử nghề nghiệp',
  ],
  purpose: `Section kể câu chuyện sự nghiệp — đã làm gì, ở đâu, và đạt được gì.
    Xây dựng trust và credibility. Cho visitor thấy trajectory và growth của chủ nhân.`,
  designPrinciples: [
    'Thứ tự thời gian ngược (mới nhất trên đầu) là convention phổ biến nhất',
    'Mỗi item cần: vai trò + nơi làm + thời gian + thành tích chính',
    'Timeline visual (đường thẳng, điểm mốc) tạo cảm giác narrative mạnh',
    'Không cần liệt kê tất cả — 3–5 vị trí tiêu biểu nhất là đủ',
    'Tên công ty/tổ chức nên nổi bật hơn mô tả công việc',
    'Dùng badge để mark các thành tích hoặc công nghệ dùng',
  ],
  variations: [
    {
      name: 'Timeline Cards — Dạng dòng thời gian',
      whenToUse: `Tạo cảm giác narrative và progression mạnh. Phù hợp khi muốn
        thể hiện hành trình career có chiều sâu. Đẹp và storytelling tốt.`,
      keyCharacteristics: [
        'rows(N) với mỗi row là 1 job entry',
        'Mỗi entry: columns(2, gap:md) → [cột trái: thời gian + dot indicator] + [cột phải: card nội dung]',
        'Hoặc đơn giản hơn: rows của containers(style:card hoặc outlined) với content bên trong',
        'Badge cho công nghệ/thành tích ở cuối mỗi card',
      ],
    },
    {
      name: 'List Cards — Thẻ experience đơn giản',
      whenToUse: `Khi không cần timeline visual phức tạp. Clean và dễ đọc.
        Phù hợp khi muốn focus vào nội dung hơn là visual storytelling.`,
      keyCharacteristics: [
        'rows(N) với mỗi row là container(style:card, padding:1.5rem)',
        'Bên trong card: rows → flex(justify:between)[heading vai trò + badge thời gian] → description → flex badges công nghệ',
        'Columns(2) nếu muốn 2 items ngang nhau (tiết kiệm space)',
      ],
    },
    {
      name: 'Compact Horizontal List',
      whenToUse: `Khi muốn show nhiều kinh nghiệm trong ít không gian.
        Phù hợp khi experience không phải highlight chính của trang.`,
      keyCharacteristics: [
        'rows(N) đơn giản với mỗi row là flex(justify:between, align:center)',
        'Text: tên vai trò + công ty (heading nhỏ) | badge thời gian bên phải',
        'Không card style — dùng border-bottom hoặc spacing để phân cách',
      ],
    },
  ],
  antiPatterns: [
    'Không viết JD dài dòng — mỗi entry tối đa 3 dòng mô tả',
    'Không để tất cả entries cùng visual weight — nổi bật nhất/gần đây nhất lên đầu',
    'Không bỏ ngày tháng — "thời gian" là context quan trọng với visitor',
    'Không list quá 6 positions — gây overwhelm, chọn 3–5 tiêu biểu nhất',
  ],
  recommendedProps: {
    cardPadding: '"1.5rem" hoặc "2rem" — đủ breathing space',
    cardStyle: '"outlined" hoặc "glass" — tạo separation mà không quá nặng',
    badgeVariant: '"subtle" cho tech tags, "solid" cho achievement highlights',
    timelineDot: 'Dùng icon(name:Circle hoặc Dot, size:xs) làm marker nếu muốn timeline feel',
  },
};
