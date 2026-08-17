import type { SectionBlueprint } from '../types';

export const galleryBlueprint: SectionBlueprint = {
  id: 'gallery',
  naturalAliases: [
    'bộ ảnh', 'triển lãm ảnh', 'gallery', 'ảnh', 'photo gallery',
    'album', 'bộ sưu tập ảnh', 'hình ảnh', 'photos', 'pictures',
    'ảnh chụp', 'ảnh tác phẩm', 'ảnh sự kiện', 'ảnh đẹp',
    'image gallery', 'photo album', 'lookbook', 'bộ nhìn',
    'portfolio ảnh', 'visual showcase', 'ảnh tôi đã chụp',
    'tác phẩm nhiếp ảnh', 'triển lãm', 'exhibition',
    'món ăn ảnh', 'food photography', 'ảnh sản phẩm',
  ],
  purpose: `Section dành riêng để showcase ảnh/visual như một tác phẩm nghệ thuật.
    Khác với portfolio (focus vào project + context), gallery focus thuần vào visual impact.
    Phù hợp photographer, food stylist, artist, event planner, interior designer.
    Mục tiêu: để ảnh "tự nói chuyện" — tối giản text, tối đa visual.`,
  designPrinciples: [
    'Ảnh là nhân vật chính — text chỉ là caption phụ trợ, không phải trọng tâm',
    'Grid dày đặc (gap nhỏ) tạo cảm giác abundance và chuyên nghiệp',
    'Aspect ratio nhất quán trong cùng 1 gallery — đừng trộn lẫn horizontal/vertical',
    'Tối thiểu 6 ảnh để tạo impact, optimal 9–12 ảnh (bội số của 3)',
    'Dùng ảnh chất lượng cao từ Unsplash với alt text mô tả chính xác lĩnh vực',
    'Section heading tối giản — 1–2 từ đủ ("My Work", "Gallery", "Portfolio")',
    'Không cần description dài — ảnh phải tự giải thích được',
    'Cân nhắc categories/tabs nếu có nhiều loại ảnh khác nhau',
  ],
  variations: [
    {
      name: 'Masonry Grid — 3 cột đều',
      whenToUse: `Phổ biến nhất cho photography portfolio.
        Tạo cảm giác professional và abundant.
        Phù hợp khi có 9–12+ ảnh cùng aspect ratio.`,
      keyCharacteristics: [
        'columns(3, gap:sm hoặc xs) để tạo grid chặt chẽ',
        'Mỗi cell: image(1/1 hoặc 4/3, objectFit:cover, borderRadius:none hoặc sm)',
        'Optional: description(caption, size:xs, overlay hoặc bên dưới)',
        'Section heading: rows → heading nhỏ + badge category ở trên grid',
        'Không cần container card — ảnh lấp đầy cell hoàn toàn tạo feel sạch',
      ],
    },
    {
      name: 'Feature + Grid — 1 ảnh lớn + nhiều nhỏ',
      whenToUse: `Khi muốn highlight 1–2 tác phẩm nổi bật nhất.
        Tạo visual hierarchy rõ ràng và kể chuyện qua ảnh.
        Phù hợp khi có "hero shot" muốn show trước.`,
      keyCharacteristics: [
        'rows(2): hàng 1 = image lớn (16/9 hoặc 21/9, full width)',
        'Hàng 2 = columns(3 hoặc 4) với ảnh nhỏ hơn (1/1)',
        'Ảnh lớn có thể có caption overlay với heading + description ngắn',
        'Ảnh nhỏ không cần caption — visual grid thuần',
      ],
    },
    {
      name: 'Horizontal Scroll — Cuộn ngang',
      whenToUse: `Khi muốn gallery có feel của một cinematic experience.
        Phù hợp artist, photographer muốn trang có điểm nhấn unique.
        Dùng flex với overflow gợi ý cuộn.`,
      keyCharacteristics: [
        'flex(direction:row, gap:sm, wrap:nowrap) với overflow hint',
        'Mỗi ảnh: image(portrait 2/3 hoặc landscape 4/3, width:fixed hoặc min-w)',
        'Ảnh đa dạng aspect ratio tạo rhythm thú vị khi scroll',
        'Arrow buttons hoặc indicator dots gợi ý scroll direction',
      ],
    },
    {
      name: 'Categorized Gallery — Theo nhóm chủ đề',
      whenToUse: `Khi photographer có nhiều style/genre khác nhau
        (chân dung, phong cảnh, sự kiện, thực phẩm...).
        Tạo navigation rõ ràng giữa các loại ảnh.`,
      keyCharacteristics: [
        'rows(N) với mỗi row là 1 category group',
        'Mỗi group: rows → heading(category name, h3, accent) → columns(3) ảnh grid',
        'Gap giữa categories lớn hơn gap giữa ảnh trong cùng category',
        'Tối đa 3–4 categories để không quá phức tạp',
      ],
    },
  ],
  antiPatterns: [
    'Không thêm quá nhiều text vào gallery section — mục đích là visual, không phải reading',
    'Không để ảnh có aspect ratio loạn xạ trong cùng 1 grid — mất visual consistency',
    'Không dùng gap quá lớn (>1rem) giữa ảnh trong gallery — mất cohesion',
    'Không dùng border-radius lớn cho gallery ảnh — trông cartoonish, không professional',
    'Không quên alt text cho ảnh — quan trọng cho accessibility và SEO',
    'Không để gallery section mà không có heading/label gì — visitor cần context',
  ],
  recommendedProps: {
    imageAspectRatio: '"1/1" cho portrait grid, "4/3" cho landscape — nhất quán trong gallery',
    imageObjectFit: '"cover" — luôn fill cell, không để ảnh bị distort',
    gridGap: '"xs" hoặc "sm" (4–8px) — gallery dense là intentional design choice',
    imageBorderRadius: '"none" hoặc "sm" — tối giản, để ảnh nổi bật',
    sectionPadding: '"4rem 2rem" — gallery không cần padding quá to, ảnh đã chiếm chỗ',
  },
  typicalPosition: 'middle',
};
