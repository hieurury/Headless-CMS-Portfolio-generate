import { blueprintRegistry } from '../blueprints';
import type { SectionBlueprint } from '../blueprints';

/**
 * ════════════════════════════════════════════════════════════════
 * BLUEPRINT LOADER
 *
 * Đọc blueprints từ registry và format thành prompt text cho agent.
 * Format là hướng dẫn nguyên tắc mở — KHÔNG phải JSON example cứng.
 * Agent đọc, suy luận, và sáng tạo theo ngữ cảnh.
 * ════════════════════════════════════════════════════════════════
 */
export class BlueprintLoader {
  /**
   * Load và format blueprints cho danh sách section IDs.
   * Trả về empty string nếu không có blueprint nào.
   */
  load(sectionIds: string[]): string {
    const blueprints = sectionIds
      .map((id) => blueprintRegistry.get(id))
      .filter((bp): bp is SectionBlueprint => bp !== undefined);

    if (blueprints.length === 0) return '';

    const formatted = blueprints
      .map((bp) => this.formatForPrompt(bp))
      .join('\n\n───────────────────────────────────────\n\n');

    return (
      `═══════════════════════════════════════════════════\n` +
      `SECTION BLUEPRINTS — Design guidance for each section\n` +
      `Read these principles and choose the variation that best fits the user's context.\n` +
      `DO NOT copy structures literally — use them as inspiration and adapt creatively.\n` +
      `═══════════════════════════════════════════════════\n\n` +
      formatted
    );
  }

  private formatForPrompt(bp: SectionBlueprint): string {
    const lines: string[] = [];

    lines.push(`[BLUEPRINT: ${bp.id.toUpperCase()}]`);
    lines.push(`Purpose: ${bp.purpose.replace(/\n\s+/g, ' ').trim()}`);
    lines.push('');

    lines.push('Design Principles:');
    for (const principle of bp.designPrinciples) {
      lines.push(`  • ${principle}`);
    }
    lines.push('');

    lines.push('Variation Options (choose based on user context, profession, and content):');
    for (const v of bp.variations) {
      lines.push(`  ▸ ${v.name}`);
      lines.push(`    When: ${v.whenToUse.replace(/\n\s+/g, ' ').trim()}`);
      lines.push(`    How: ${v.keyCharacteristics.join(' | ')}`);
    }
    lines.push('');

    if (bp.antiPatterns.length > 0) {
      lines.push(`Avoid: ${bp.antiPatterns.join(' | ')}`);
    }

    if (Object.keys(bp.recommendedProps).length > 0) {
      lines.push('Suggested Props:');
      for (const [key, value] of Object.entries(bp.recommendedProps)) {
        lines.push(`  ${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }
}

/** Singleton instance */
export const blueprintLoader = new BlueprintLoader();
