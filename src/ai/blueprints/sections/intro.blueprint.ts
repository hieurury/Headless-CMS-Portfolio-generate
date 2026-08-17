import type { SectionBlueprint } from '../types';

export const introBlueprint: SectionBlueprint = {
  id: 'intro',
  naturalAliases: [
    'giới thiệu', 'bản thân', 'về tôi', 'about', 'about me', 'intro',
    'landing', 'trang chủ', 'hero', 'tôi là ai', 'biography', 'bio',
    'profile', 'đầu trang', 'phần mở đầu', 'chào', 'mở đầu',
    'self introduction', 'introduce', 'tự giới thiệu', 'hồ sơ',
    'thông tin cá nhân', 'danh thiếp', 'chân dung',
  ],
  purpose: `Section đầu tiên visitor nhìn thấy sau nav. Phải tạo ấn tượng mạnh
    và ngay lập tức truyền đạt: chủ nhân là ai, làm gì, và lý do visitor
    nên quan tâm. Đây là "bắt tay đầu tiên" với người xem.`,
  designPrinciples: [
    'Visual weight lớn nhất trên trang — heading phải to (4xl/5xl), bold, nổi bật',
    'Cần ít nhất 1 CTA button — link đến portfolio hoặc contact',
    'Padding rộng (≥5rem vertical) tạo cảm giác premium và không chật chội',
    'Background nên khác biệt với sections còn lại — màu đậm, gradient, hoặc đặc sắc',
    'Tối đa 3–4 elements chính — quá nhiều sẽ gây nhiễu, mất focus',
    'Dùng badge nhỏ phía trên heading để định vị nghề nghiệp ngắn gọn',
    'Ảnh chân dung phù hợp với ngành: creative/service → nên có; technical backend → tùy',
  ],
  variations: [
    {
      name: 'Split — Text trái, Visual phải',
      whenToUse: `Phổ biến nhất. Khi user có ảnh/visual muốn showcase cùng bio.
        Phù hợp hầu hết ngành nghề. Tạo balance tốt giữa text và visual.`,
      keyCharacteristics: [
        'columns(2) ở cấp cao nhất với alignY:center',
        'Cột trái (text): rows → badge → heading → description → flex buttons',
        'Cột phải (visual): image block với borderRadius:2xl hoặc full',
        'Cân nhắc colSpans [2,1] nếu text nhiều, visual là điểm phụ',
        'Cân nhắc colSpans [1,1] nếu ảnh và text có vai trò ngang nhau',
      ],
    },
    {
      name: 'Centered — Căn giữa toàn màn hình',
      whenToUse: `Minimalist và modern. Khi nội dung text đủ mạnh không cần visual.
        Phù hợp với writer, consultant, speaker. Tạo cảm giác clean và confident.`,
      keyCharacteristics: [
        'container(alignX:center, alignY:middle, padding:"6rem 2rem")',
        'rows bên trong: badge → heading(textAlign:center, gradient:true) → description(center) → flex(justify:center) buttons',
        'Heading rất to (4xl/5xl) là visual anchor chính thay cho ảnh',
      ],
    },
    {
      name: 'Full-width Immersive',
      whenToUse: `Khi section cần visual impact mạnh. Phù hợp với chef, photographer,
        artist, musician — người có ảnh nghề nghiệp ấn tượng.`,
      keyCharacteristics: [
        'container với backgroundColor đậm/gradient phủ toàn section',
        'textColor sáng (trắng/off-white) để contrast cao',
        'Image có thể xếp dọc (rows) với text thay vì ngang',
        'Có thể dùng image lớn chiều cao toàn section với text overlay',
      ],
    },
    {
      name: 'Minimal Text-only',
      whenToUse: `Khi user muốn cực đơn giản, chưa có ảnh, hoặc muốn focus 100% vào câu chữ.
        Phù hợp copywriter, analyst, developer.`,
      keyCharacteristics: [
        'Không có image block',
        'Heading cực to (5xl), gradient:true để tạo visual punch bù cho thiếu visual',
        'Spacing rất rộng (6rem+) để section không trống trải',
        'Badge nhỏ và description ngắn gọn là điểm nhấn phụ',
      ],
    },
  ],
  antiPatterns: [
    'Không dùng quá 3 font sizes khác nhau trong 1 section — gây rối mắt',
    'Không đặt button ghost/outline làm CTA chính — dùng primary hoặc solid',
    'Heading và description không nên cùng textColor — phân cấp bằng opacity hoặc size',
    'Không để 2 cột bằng nhau khi text nhiều hơn visual — dùng colSpans',
    'Không nhét quá 3 CTA buttons — 1-2 là đủ',
  ],
  recommendedProps: {
    containerPadding: '"5rem 2rem" hoặc "6rem 2rem" — tạo không gian premium',
    headingSize: '"4xl" hoặc "5xl" — impact mạnh nhất',
    headingGradient: 'true khi background tối — tạo visual depth',
    imageAspectRatio: '"1/1" hoặc "4/3" cho chân dung — tự nhiên hơn "16/9"',
    imageBorderRadius: '"2xl" hoặc "full" cho ảnh chân dung tròn',
  },
  typicalPosition: 'second',
};
