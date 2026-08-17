import type { SectionBlueprint } from '../types';

export const testimonialsBlueprint: SectionBlueprint = {
  id: 'testimonials',
  naturalAliases: [
    'đánh giá', 'nhận xét', 'review', 'testimonials', 'feedback',
    'khách hàng nói gì', 'phản hồi', 'lời khuyên', 'recommendation',
    'người ta nói về tôi', 'client reviews', 'customer feedback',
    'cảm nhận', 'ý kiến', 'quote', 'lời chứng thực',
    'trust', 'social proof', 'bằng chứng', 'đánh giá từ khách hàng',
  ],
  purpose: `Social proof section — thể hiện người khác đánh giá chủ nhân như thế nào.
    Tạo trust và credibility thông qua lời của người thứ ba.
    Đặc biệt hiệu quả với freelancer, service provider, coach.`,
  designPrinciples: [
    'Quote (trích dẫn) nên nổi bật — font to hơn, có dấu ngoặc kép visual',
    'Tên + vai trò người đánh giá là bắt buộc — anonymous quote thiếu credibility',
    'Ảnh avatar tùy chọn — nếu không có, dùng icon placeholder',
    '3–5 testimonials là optimal — đủ social proof mà không gây overwhelm',
    'Nên chọn quotes ngắn nhưng powerful (1–3 câu), không phải essay',
    'Background khác biệt nhẹ với sections xung quanh để tạo visual break',
  ],
  variations: [
    {
      name: 'Quote Cards Grid',
      whenToUse: `Pattern phổ biến nhất. Clean và professional.
        Phù hợp khi có 3–6 testimonials cần hiển thị.`,
      keyCharacteristics: [
        'columns(2 hoặc 3, gap:lg)',
        'Mỗi card: container(style:glass hoặc outlined, borderRadius:xl, padding:2rem)',
        'Bên trong: rows → description(quote text, size:base) → flex[avatar/icon + rows[heading tên + description vai trò]]',
        'Dấu quote lớn (heading với ký tự " hoặc dùng icon) ở đầu card làm visual element',
      ],
    },
    {
      name: 'Featured Single Quote',
      whenToUse: `Khi muốn highlight 1 testimonial đặc biệt mạnh. Tạo impact lớn.`,
      keyCharacteristics: [
        'container(alignX:center, padding:5rem 2rem)',
        'rows: icon(quote mark) → heading(quote text, size:2xl, textAlign:center, gradient:true) → flex[avatar + attribution]',
        'Container maxWidth:lg để quote không quá rộng trên màn hình lớn',
      ],
    },
    {
      name: 'Horizontal Scroll Cards',
      whenToUse: `Khi có nhiều testimonials (6+). Dùng flex wrap để auto-flow.`,
      keyCharacteristics: [
        'flex(direction:row, wrap:wrap, gap:md)',
        'Mỗi card nhỏ hơn với quote ngắn hơn (1 câu power quote)',
        'Container maxWidth giới hạn để cards không quá to',
      ],
    },
  ],
  antiPatterns: [
    'Không để testimonial không có tên người — thiếu credibility hoàn toàn',
    'Không để quote quá dài (>4 câu) — người đọc skip',
    'Không để tất cả testimonials cùng format quá đồng đều — thiếu authentic feel',
    'Không bỏ qua visual separation giữa testimonials — dễ confused',
  ],
  recommendedProps: {
    cardStyle: '"glass" hoặc "outlined" — không quá nặng, để quote nổi',
    cardPadding: '"2rem" — đủ breathing space cho text quote',
    quoteTextSize: '"base" hoặc "lg" — to hơn description thường nhưng không quá to',
    attributionSize: '"sm" — nhỏ hơn để tạo hierarchy rõ ràng',
  },
  typicalPosition: 'pre-last',
};
