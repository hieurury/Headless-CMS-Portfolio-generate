import type { SectionBlueprint } from '../types';

export const faqBlueprint: SectionBlueprint = {
  id: 'faq',
  naturalAliases: [
    'faq', 'câu hỏi thường gặp', 'hỏi đáp', 'q&a', 'q and a',
    'câu hỏi', 'giải đáp', 'thắc mắc', 'frequently asked questions',
    'người ta hay hỏi tôi', 'mọi người thường hỏi', 'thông tin thêm',
    'clarifications', 'questions', 'answers', 'hỏi và đáp',
    'những điều cần biết', 'what you need to know', 'tôi có thể hỏi gì',
  ],
  purpose: `Section giải đáp những câu hỏi phổ biến visitor có trước khi quyết định liên hệ.
    Giảm barrier to contact — người xem tự trả lời thắc mắc mà không cần hỏi.
    Tăng trust và credibility bằng cách cho thấy chủ nhân hiểu rõ nhu cầu của họ.
    Đặc biệt hiệu quả với service provider, freelancer, consultant.`,
  designPrinciples: [
    'Mỗi Q&A phải ngắn gọn — câu hỏi 1 câu, trả lời tối đa 3–4 câu',
    '5–8 câu hỏi là optimal — đủ cover concerns chính mà không gây overwhelm',
    'Câu hỏi phải là câu khách hàng thực sự hỏi, không phải câu "chủ nhân muốn marketing"',
    'Accordion/expand pattern (description với toggle) cho phép scan nhanh',
    'Đặt câu hỏi quan trọng nhất và phổ biến nhất lên đầu',
    'Kết thúc bằng CTA: "Còn thắc mắc khác? Liên hệ tôi ngay"',
    'Background section nên nhẹ hơn sections xung quanh để tạo visual break',
  ],
  variations: [
    {
      name: 'Accordion List — Vertical Expand',
      whenToUse: `Pattern chuẩn và phổ biến nhất cho FAQ.
        Người dùng click để expand từng câu trả lời.
        Tiết kiệm space, dễ scan câu hỏi.`,
      keyCharacteristics: [
        'container(section) → rows: section heading → rows(N) Q&A items',
        'Mỗi Q&A item: container(borderBottom:1px, padding:1.5rem 0) với rows',
        'Bên trong: heading(question, size:lg, bold) → description(answer) với style ẩn/hiện',
        'Thêm icon chevron bên phải heading để gợi ý expand',
        'Cuối cùng: flex(justify:center) với button CTA "Liên hệ nếu còn thắc mắc"',
      ],
    },
    {
      name: 'Two-Column Q&A Grid',
      whenToUse: `Khi không cần accordion, muốn hiện tất cả câu trả lời cùng lúc.
        Phù hợp khi câu trả lời ngắn (1–2 câu).
        Tạo layout sạch và đọc được ngay.`,
      keyCharacteristics: [
        'columns(2, gap:xl) với mỗi cell là 1 Q&A pair',
        'Mỗi cell: rows → heading(question, size:base, bold, primary color) → description(answer, size:sm)',
        'Container(style:glass hoặc subtle bg, borderRadius:lg, padding:1.5rem) bao quanh từng pair',
        'Số câu hỏi nên chẵn (4, 6, 8) để grid đều nhau',
      ],
    },
    {
      name: 'Highlighted FAQ — Câu hỏi nổi bật',
      whenToUse: `Khi chỉ có 3–5 câu hỏi cốt lõi và muốn mỗi câu có visual impact.
        Phù hợp minimal portfolio, landing page đơn giản.`,
      keyCharacteristics: [
        'rows(N) với mỗi Q&A là container(style:glass, padding:2rem, borderRadius:xl)',
        'Bên trong: columns(2, colSpans:[1,3]): icon/số thứ tự + rows[question heading + answer description]',
        'Số thứ tự (01, 02...) hoặc icon Q làm visual anchor bên trái',
      ],
    },
  ],
  antiPatterns: [
    'Không viết câu hỏi dạng marketing ("Tại sao tôi là lựa chọn tốt nhất?") — không authentic',
    'Không để câu trả lời quá dài (>5 câu) — mất điểm của FAQ là ngắn gọn',
    'Không list hơn 10 Q&A — quá nhiều gây mệt mỏi, visitor bỏ qua hết',
    'Không quên CTA ở cuối section — FAQ là bước trước contact',
    'Không để mọi Q&A cùng style và độ dài giống nhau — thiếu natural feel',
  ],
  recommendedProps: {
    sectionPadding: '"4rem 2rem" — FAQ không cần quá lớn, vừa phải',
    questionTextSize: '"base" hoặc "lg" — rõ ràng, bold để differentiate từ answer',
    answerTextSize: '"sm" hoặc "base" — nhỏ hơn một chút so với question',
    itemSpacing: '"gap:lg" giữa các Q&A items — đủ breathing room',
  },
  typicalPosition: 'pre-last',
};
