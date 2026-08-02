import { LayoutSection } from 'src/pages/schemas/page.schema';

/**
 * ════════════════════════════════════════════════════════════
 * AI_ACTION — danh sách thao tác mà AI có thể yêu cầu thực hiện.
 *
 *  ADD_CHILD   → Thêm `newNode` vào cuối mảng `children` của node có id = `targetId`.
 *  ADD_BEFORE  → Thêm `newNode` vào *trước* node có id = `targetId` (cùng cấp).
 *  ADD_AFTER   → Thêm `newNode` vào *sau* node có id = `targetId` (cùng cấp).
 *  UPDATE      → Thay thế toàn bộ node có id = `targetId` bằng `newNode`.
 *  DELETE      → Xoá node có id = `targetId` khỏi cây.
 * ════════════════════════════════════════════════════════════
 */
export enum AI_ACTION {
  ADD_CHILD = 'ADD_CHILD',
  ADD_BEFORE = 'ADD_BEFORE',
  ADD_AFTER = 'ADD_AFTER',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Một yêu cầu thay đổi duy nhất do AI tạo ra.
 */
export interface LayoutModification {
  /** Loại thao tác */
  type: AI_ACTION;
  /** ID của node mục tiêu */
  targetId: string;
  /**
   * Node dữ liệu mới.
   * - Bắt buộc với ADD_CHILD, ADD_BEFORE, ADD_AFTER, UPDATE.
   * - Bỏ qua với DELETE.
   */
  newNode?: LayoutSection;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Đệ quy xử lý một thao tác `mod` trên mảng `nodes`.
 *
 * Hàm luôn trả về một **mảng mới** (immutable) — không mutate dữ liệu gốc.
 * Trả về `null` khi không tìm thấy targetId trong cây con này (dùng để
 * phân biệt "đã xử lý" với "chưa tìm thấy" trong vòng đệ quy).
 */
function applyToArray(
  nodes: LayoutSection[],
  mod: LayoutModification,
): LayoutSection[] | null {
  const { type, targetId, newNode } = mod;
  let found = false;
  const result: LayoutSection[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // ── Xử lý thao tác CÓ LIÊN QUAN ĐẾN VỊ TRÍ TRONG MẢNG (sibling) ───────
    if (node.id === targetId) {
      found = true;

      if (type === AI_ACTION.DELETE) {
        // Bỏ qua node này → không push vào result
        continue;
      }

      if (type === AI_ACTION.ADD_BEFORE && newNode) {
        result.push({ ...newNode });
        result.push(node);
        continue;
      }

      if (type === AI_ACTION.ADD_AFTER && newNode) {
        result.push(node);
        result.push({ ...newNode });
        continue;
      }

      if (type === AI_ACTION.UPDATE && newNode) {
        result.push({ ...newNode });
        continue;
      }

      if (type === AI_ACTION.ADD_CHILD && newNode) {
        // Thêm vào cuối children của node này
        result.push({
          ...node,
          children: [...(node.children ?? []), { ...newNode }],
        });
        continue;
      }

      // Fallthrough nếu không match action nào (giữ nguyên)
      result.push(node);
      continue;
    }

    // ── Đệ quy vào children ────────────────────────────────────────────────
    if (node.children && node.children.length > 0) {
      const updatedChildren = applyToArray(node.children, mod);
      if (updatedChildren !== null) {
        // Đã tìm thấy target trong cây con → cập nhật children
        found = true;
        result.push({ ...node, children: updatedChildren });
        continue;
      }
    }

    // Không liên quan → giữ nguyên
    result.push(node);
  }

  return found ? result : null;
}

/**
 * Áp dụng **một** thao tác `mod` lên cây layout `sections`.
 * Trả về cây layout mới sau khi đã cập nhật (không thay đổi input gốc).
 * Nếu không tìm thấy `targetId`, trả về cây gốc không thay đổi và log cảnh báo.
 */
export function applyModification(
  sections: LayoutSection[],
  mod: LayoutModification,
): LayoutSection[] {
  const result = applyToArray(sections, mod);
  if (result === null) {
    console.warn(
      `[searchSection] targetId "${mod.targetId}" không tìm thấy trong cây layout — bỏ qua thao tác ${mod.type}`,
    );
    return sections;
  }
  return result;
}

/**
 * Áp dụng **nhiều** thao tác lần lượt lên cây layout.
 * Mỗi thao tác được thực thi trên kết quả của thao tác trước (pipeline).
 */
export function applyModifications(
  sections: LayoutSection[],
  modifications: LayoutModification[],
): LayoutSection[] {
  return modifications.reduce(
    (current, mod) => applyModification(current, mod),
    sections,
  );
}
