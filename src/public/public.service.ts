import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Portfolio,
  PortfolioDocument,
} from '../portfolios/schemas/portfolio.schema';
import { Page, PageDocument } from '../pages/schemas/page.schema';
import { Post, POST_STATUS } from '../posts/schemas/post.schema';
import { Posttype } from '../posttype/schema/posttype.schema';

export interface PublicPortfolioCard {
  _id: string;
  title: string;
  slug: string;
  description: string;
  ownerName: string;
  ownerAvatar: string;
  pageCount: number;
  meta: { theme?: string; primaryColor?: string; fontFamily?: string };
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Normalize a page slug for use in URLs.
 * Strips leading slashes and converts "/" (root) to "home".
 * Examples: "/about" → "about", "/" → "home", "projects" → "projects"
 */
export function normalizeSlug(slug: string): string {
  const stripped = slug.replace(/^\/+/, '');
  return stripped.length > 0 ? stripped : 'home';
}

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,
    @InjectModel(Page.name)
    private readonly pageModel: Model<PageDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
    @InjectModel(Posttype.name)
    private readonly posttypeModel: Model<Posttype>,
  ) {}

  /**
   * List all published portfolios with optional full-text search.
   * Searches across: portfolio title, description, AND owner name.
   * Pagination: page (1-based), limit (default 12).
   */
  async listAllPublished(
    query?: string,
    page = 1,
    limit = 12,
    excludeOwnerId?: string,
  ): Promise<PaginatedResult<PublicPortfolioCard>> {
    const skip = (page - 1) * limit;
    const trimmedQuery = query?.trim() ?? '';

    // ── Stage 1: Filter only published portfolios ──────────────────
    // Optionally exclude the requesting user's own portfolios
    const initialMatch: Record<string, unknown> = { isPublished: true };
    if (excludeOwnerId) {
      try {
        initialMatch.owner = { $ne: new Types.ObjectId(excludeOwnerId) };
      } catch {
        // Invalid ObjectId — ignore exclusion
      }
    }

    const pipeline: object[] = [
      { $match: initialMatch },

      // ── Stage 2: Join owner info from users collection ─────────────
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerDoc',
        },
      },
      // preserveNullAndEmptyArrays: true → keep portfolio even if user is missing
      { $unwind: { path: '$ownerDoc', preserveNullAndEmptyArrays: true } },

      // ── Stage 3: Count published pages per portfolio ───────────────
      {
        $lookup: {
          from: 'pages',
          let: { pid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$portfolio', '$$pid'] },
                    { $eq: ['$isPublished', true] },
                  ],
                },
              },
            },
            { $count: 'n' },
          ],
          as: 'pageCounts',
        },
      },
    ];

    // ── Stage 4: Search filter (applied BEFORE $project on raw fields) ──
    // Uses $or + $regex with $options:'i' directly on original fields and
    // joined ownerDoc.name — more reliable than computed field matching.
    if (trimmedQuery.length > 0) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: trimmedQuery, $options: 'i' } },
            { description: { $regex: trimmedQuery, $options: 'i' } },
            { 'ownerDoc.name': { $regex: trimmedQuery, $options: 'i' } },
          ],
        },
      });
    }

    // ── Stage 5: Shape the output ──────────────────────────────────
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        description: { $ifNull: ['$description', ''] },
        ownerName: { $ifNull: ['$ownerDoc.name', 'Unknown'] },
        ownerAvatar: { $ifNull: ['$ownerDoc.avatar', ''] },
        pageCount: {
          $ifNull: [{ $arrayElemAt: ['$pageCounts.n', 0] }, 0],
        },
        meta: 1,
        createdAt: 1,
      },
    });

    // ── Stage 6: Sort ──────────────────────────────────────────────
    pipeline.push({ $sort: { createdAt: -1 } });

    // ── Count total before pagination ──────────────────────────────
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.portfolioModel
      .aggregate(
        countPipeline as Parameters<typeof this.portfolioModel.aggregate>[0],
      )
      .exec();
    const total: number = (countResult[0]?.total as number | undefined) ?? 0;

    // Apply pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    const results = await this.portfolioModel
      .aggregate(
        pipeline as Parameters<typeof this.portfolioModel.aggregate>[0],
      )
      .exec();

    return {
      data: results.map((r) => ({
        _id: String(r._id),
        title: r.title as string,
        slug: r.slug as string,
        description: r.description as string,
        ownerName: r.ownerName as string,
        ownerAvatar: (r.ownerAvatar as string) || '',
        pageCount: r.pageCount as number,
        meta: (r.meta as PublicPortfolioCard['meta']) ?? {},
        createdAt: (r.createdAt as Date).toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a published portfolio by slug — returns meta + list of published pages.
   * Used by the public hub page at /p/:portfolioSlug
   */
  async findPublicPortfolio(portfolioSlug: string) {
    const portfolio = await this.portfolioModel
      .findOne({ slug: portfolioSlug, isPublished: true })
      .select('_id title slug description meta isPublished')
      .populate('owner', 'name')
      .lean()
      .exec();

    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio "${portfolioSlug}" not found or is not published`,
      );
    }

    const pages = await this.pageModel
      .find({ portfolio: portfolio._id, isPublished: true })
      .select('_id title slug order meta')
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    return {
      title: portfolio.title,
      slug: portfolio.slug,
      description: portfolio.description,
      ownerName:
        (portfolio.owner as { name?: string } | null)?.name ?? 'Unknown',
      meta: portfolio.meta,
      // Return normalized slugs so the frontend can build correct URLs
      pages: pages.map((p) => ({ ...p, urlSlug: normalizeSlug(p.slug) })),
    };
  }

  /**
   * Find a published portfolio page by slug — no auth required.
   * Used by the public-facing renderer at /p/:portfolioSlug/:pageSlug
   */
  async findPublicPage(portfolioSlug: string, pageSlug: string) {
    const portfolio = await this.portfolioModel
      .findOne({ slug: portfolioSlug, isPublished: true })
      .select('_id title slug description meta isPublished owner')
      .populate('owner', 'name')
      .lean()
      .exec();

    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio "${portfolioSlug}" not found or is not published`,
      );
    }

    // Fetch all published pages for in-page navigation
    const allPages = await this.pageModel
      .find({ portfolio: portfolio._id, isPublished: true })
      .select('_id title slug order')
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    // Normalize both sides of comparison:
    // stored slug "/about" → "about", URL param "about" → "about" ✓
    // stored slug "/" → "home", URL param "home" → "home" ✓
    const normalizedPageSlug = normalizeSlug(pageSlug);
    const page = allPages.find(
      (p) => normalizeSlug(p.slug) === normalizedPageSlug,
    );
    if (!page) {
      throw new NotFoundException(
        `Page "${pageSlug}" not found or is not published`,
      );
    }

    // Fetch full layout for the current page
    const fullPage = await this.pageModel.findById(page._id).lean().exec();

    return {
      portfolio: {
        title: portfolio.title,
        slug: portfolio.slug,
        description: portfolio.description,
        ownerName:
          (portfolio.owner as { name?: string } | null)?.name ?? 'Unknown',
        meta: portfolio.meta,
      },
      page: {
        _id: fullPage!._id,
        title: fullPage!.title,
        slug: fullPage!.slug,
        layout: fullPage!.layout,
      },
      // Navigation: normalized slugs for correct URL building
      allPages: allPages.map((p) => ({
        title: p.title,
        slug: p.slug,
        urlSlug: normalizeSlug(p.slug),
      })),
    };
  }

  /**
   * Find a published post by slug — no auth required.
   * Used by the public-facing renderer at /p/:portfolioSlug/post/:postSlug
   */
  async findPublicPost(portfolioSlug: string, postSlug: string) {
    const portfolio = await this.portfolioModel
      .findOne({ slug: portfolioSlug, isPublished: true })
      .select('_id title slug description meta isPublished owner')
      .populate('owner', 'name')
      .lean()
      .exec();

    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio "${portfolioSlug}" not found or is not published`,
      );
    }

    const ownerId = (portfolio.owner as any)._id
      ? (portfolio.owner as any)._id.toString()
      : portfolio.owner.toString();

    // Lookup Post by postSlug, matching the portfolio's owner
    const post = await this.postModel
      .findOne({
        slug: postSlug,
        authorId: ownerId,
        status: POST_STATUS.PUBLISHED,
      })
      .populate('postTypeId')
      .exec();

    if (!post) {
      throw new NotFoundException(
        `Post "${postSlug}" not found or is not published`,
      );
    }

    // Tăng lượt xem lên 1
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    // Fetch all published pages for in-page navigation (Header)
    const allPages = await this.pageModel
      .find({ portfolio: portfolio._id, isPublished: true })
      .select('_id title slug order')
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    return {
      portfolio: {
        title: portfolio.title,
        slug: portfolio.slug,
        description: portfolio.description,
        ownerName:
          (portfolio.owner as { name?: string } | null)?.name ?? 'Unknown',
        meta: portfolio.meta,
      },
      post: post.toObject(),
      // Navigation: normalized slugs for correct URL building
      allPages: allPages.map((p) => ({
        title: p.title,
        slug: p.slug,
        urlSlug: normalizeSlug(p.slug),
      })),
    };
  }
  /**
   * Fetch all published portfolios and their published pages for sitemap generation.
   * Returns an array of paths and their last modified dates.
   */
  async getSitemapData(): Promise<
    { urlPath: string; lastmod: Date; isPage: boolean }[]
  > {
    const portfolios = await this.portfolioModel
      .find({ isPublished: true })
      .select('_id slug updatedAt')
      .lean()
      .exec();

    const result: { urlPath: string; lastmod: Date; isPage: boolean }[] = [];

    for (const p of portfolios) {
      // Portfolio Hub page — priority 0.8
      result.push({
        urlPath: `/p/${p.slug}`,
        lastmod: ((p as any).updatedAt as Date) || new Date(),
        isPage: false,
      });

      // Individual pages within the portfolio — priority 0.7
      const pages = await this.pageModel
        .find({ portfolio: p._id, isPublished: true })
        .select('slug updatedAt')
        .lean()
        .exec();

      for (const page of pages) {
        result.push({
          urlPath: `/p/${p.slug}/${normalizeSlug(page.slug)}`,
          lastmod: ((page as any).updatedAt as Date) || new Date(),
          isPage: true,
        });
      }
    }

    return result;
  }
}
