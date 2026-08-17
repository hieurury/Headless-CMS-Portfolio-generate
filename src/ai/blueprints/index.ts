import type { SectionBlueprint } from './types';
import { navBlueprint } from './sections/nav.blueprint';
import { introBlueprint } from './sections/intro.blueprint';
import { portfolioBlueprint } from './sections/portfolio.blueprint';
import { skillsBlueprint } from './sections/skills.blueprint';
import { experienceBlueprint } from './sections/experience.blueprint';
import { servicesBlueprint } from './sections/services.blueprint';
import { contactBlueprint } from './sections/contact.blueprint';
import { testimonialsBlueprint } from './sections/testimonials.blueprint';
import { faqBlueprint } from './sections/faq.blueprint';
import { galleryBlueprint } from './sections/gallery.blueprint';

/**
 * ════════════════════════════════════════════════════════════════
 * BLUEPRINT REGISTRY — Single source of truth cho tất cả Section Blueprints.
 *
 * Mỗi blueprint định nghĩa:
 *  - naturalAliases: các từ user phổ thông dùng để mô tả section này
 *  - purpose: mục đích section
 *  - designPrinciples: nguyên tắc thiết kế (KHÔNG phải fixed example)
 *  - variations: ma trận các hướng triển khai
 *  - antiPatterns: lỗi cần tránh
 *
 * IntentResolver dùng registry này để map user intent → section IDs.
 * BlueprintLoader dùng registry này để build prompt context.
 * ════════════════════════════════════════════════════════════════
 */
class BlueprintRegistry {
  private readonly registry = new Map<string, SectionBlueprint>();

  constructor() {
    // Register tất cả blueprints
    const blueprints: SectionBlueprint[] = [
      navBlueprint,
      introBlueprint,
      portfolioBlueprint,
      skillsBlueprint,
      experienceBlueprint,
      servicesBlueprint,
      contactBlueprint,
      testimonialsBlueprint,
      faqBlueprint,
      galleryBlueprint,
    ];

    for (const bp of blueprints) {
      this.registry.set(bp.id, bp);
    }
  }

  get(id: string): SectionBlueprint | undefined {
    return this.registry.get(id);
  }

  getAll(): SectionBlueprint[] {
    return Array.from(this.registry.values());
  }

  /** Trả về danh sách tất cả section IDs hợp lệ */
  getValidIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /** Trả về mapping alias → id cho IntentResolver */
  getAliasMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const bp of this.registry.values()) {
      for (const alias of bp.naturalAliases) {
        map[alias.toLowerCase()] = bp.id;
      }
    }
    return map;
  }
}

/** Singleton registry — dùng chung toàn app */
export const blueprintRegistry = new BlueprintRegistry();

export type { SectionBlueprint } from './types';
