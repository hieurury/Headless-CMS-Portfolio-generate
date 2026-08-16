import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export interface PageDesignMeta {
  /** Page layout type: full-width or constrained-with-margin */
  pageLayout?: {
    type: 'normal' | 'fluid' | 'custom';
    padding?: { top: string; right: string; bottom: string; left: string };
  };
  /** Color palettes for light and dark modes */
  colors?: {
    light?: { primary: string; secondary: string; accents: string[] };
    dark?: { primary: string; secondary: string; accents: string[] };
  };
  /** Font family settings */
  fonts?: {
    main: string;
  };
}

export class GenerateLayoutDto {
  @IsString()
  @MinLength(10, { message: 'Prompt must be at least 10 characters' })
  @MaxLength(2000, { message: 'Prompt must be at most 2000 characters' })
  prompt: string;

  @IsString()
  portfolioId: string;

  @IsOptional()
  @IsString()
  pageId?: string;

  @IsOptional()
  currentLayout?: { sections: unknown[] };

  /**
   * Optional per-page design system context.
   * When present, the AI will use these colors and fonts when generating/modifying layout.
   */
  @IsOptional()
  pageMeta?: PageDesignMeta;

  /**
   * Routing mode:
   *  - 'fast'  (default): Deterministic keyword routing, 0 Admin LLM hops, 1-2 sub-agent hops.
   *                       Best for most requests — low latency.
   *  - 'think':           Administrator LLM decides which agent(s) to call. Slower but handles
   *                       ambiguous or multi-step requests more intelligently.
   */
  @IsOptional()
  @IsIn(['fast', 'think'])
  mode?: 'fast' | 'think';
}
