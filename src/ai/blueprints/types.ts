/**
 * ════════════════════════════════════════════════════════════════
 * SECTION BLUEPRINT TYPES
 *
 * Định nghĩa cấu trúc cho từng Blueprint của mỗi loại section.
 * Blueprints là hướng dẫn nguyên tắc — KHÔNG phải fixed examples.
 * Agent đọc blueprint, tự suy luận và sáng tạo theo ngữ cảnh.
 * ════════════════════════════════════════════════════════════════
 */

/**
 * Một variation của section — mô tả approach thiết kế,
 * khi nào nên dùng, và đặc trưng cấu trúc mở (không phải JSON cứng).
 */
export interface SectionVariation {
  /** Tên ngắn gọn của variation */
  name: string;
  /** Ngữ cảnh nên dùng variation này */
  whenToUse: string;
  /** Đặc trưng cấu trúc — mô tả mở, không phải JSON template */
  keyCharacteristics: string[];
}

/**
 * Blueprint đầy đủ của một loại section.
 *
 * Bao gồm:
 * - naturalAliases: các từ người dùng phổ thông dùng để mô tả section này
 * - purpose: mục đích section để AI hiểu context sâu hơn
 * - designPrinciples: nguyên tắc thiết kế (rule-based, không phải example)
 * - variations: các hướng triển khai + khi nào nên dùng
 * - antiPatterns: lỗi phổ biến cần tránh
 * - recommendedProps: gợi ý props (giải thích context, không phải ép buộc)
 * - typicalPosition: vị trí thông thường của section trong page layout
 */
export interface SectionBlueprint {
  /** ID duy nhất, dùng làm key trong BlueprintRegistry */
  id: string;
  /** Từ người dùng phổ thông (Vietnamese/English) dùng để mô tả section này */
  naturalAliases: string[];
  /** Mục đích section — giúp AI hiểu "tại sao section này tồn tại" */
  purpose: string;
  /** Nguyên tắc thiết kế — rule-based, không phải ví dụ cụ thể */
  designPrinciples: string[];
  /** Ma trận biến thể — các hướng triển khai khác nhau */
  variations: SectionVariation[];
  /** Lỗi phổ biến agent nên tránh */
  antiPatterns: string[];
  /** Gợi ý props với giải thích ngữ cảnh */
  recommendedProps: Record<string, string>;
  /**
   * Vị trí thông thường trong page layout.
   * 'first': luôn đầu trang (nav), 'second': ngay sau nav (intro/hero),
   * 'middle': phần thân trang, 'pre-last': ngay trước contact, 'last': cuối trang.
   * Dùng để gợi ý agent sắp xếp sections đúng thứ tự.
   */
  typicalPosition?: 'first' | 'second' | 'middle' | 'pre-last' | 'last';
}
