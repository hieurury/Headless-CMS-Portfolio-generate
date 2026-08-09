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
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { UserProfile, UserProfileDocument } from '../accounts/schemas/user-profile.schema';

export interface PublicPortfolioCard {
  _id: string;
  title: string;
  slug: string;
  description: string;
  ownerUsername: string;
  ownerName: string;     // fullName or username fallback
  ownerAvatar: string;
  ownerEmail: string;
  pageCount: number;
  postCount: number;
  categories?: string[];
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
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(UserProfile.name)
    private readonly profileModel: Model<UserProfileDocument>,
  ) {}

  // ─── Resolve username → accountId ───────────────────────────────────────────

  private async resolveAccount(
    username: string,
  ): Promise<{ accountId: Types.ObjectId; profile: UserProfileDocument } | null> {
    const profile = await this.profileModel
      .findOne({ username: username.toLowerCase() })
      .lean()
      .exec();
    if (!profile) return null;
    return { accountId: profile.accountId as Types.ObjectId, profile: profile as any };
  }

  // ─── User Public Profile ─────────────────────────────────────────────────────

  /**
   * GET /public/user/:username
   * Returns public profile info + list of published portfolios.
   */
  async getUserPublicProfile(username: string) {
    const resolved = await this.resolveAccount(username);
    if (!resolved) {
      throw new NotFoundException(`User "${username}" not found`);
    }

    const { accountId, profile } = resolved;

    const portfolios = await this.portfolioModel
      .find({ owner: accountId, isPublished: true })
      .select('_id title slug description meta categories pages createdAt')
      .lean()
      .exec();

    // Count pages per portfolio
    const portfoliosWithCounts = await Promise.all(
      portfolios.map(async (p) => {
        const pageCount = await this.pageModel.countDocuments({
          portfolio: p._id,
          isPublished: true,
        });
        return {
          _id: String(p._id),
          title: p.title as string,
          slug: p.slug as string,
          description: (p.description as string) || '',
          meta: p.meta,
          categories: (p.categories as string[]) || [],
          pageCount,
        };
      }),
    );

    return {
      username: profile.username,
      fullName: profile.fullName ?? null,
      email: profile.email,
      avatar: profile.avatar ?? null,
      background: profile.background ?? null,
      slogan: profile.slogan ?? null,
      occupation: profile.occupation ?? null,
      interests: profile.interests ?? [],
      portfolios: portfoliosWithCounts,
    };
  }

  // ─── Portfolio Hub ───────────────────────────────────────────────────────────

  /**
   * GET /public/user/:username/:portfolioSlug
   * Returns portfolio meta + list of published pages (hub page).
   */
  async findPublicPortfolio(username: string, portfolioSlug: string) {
    const resolved = await this.resolveAccount(username);
    if (!resolved) {
      throw new NotFoundException(`User "${username}" not found`);
    }

    const { accountId, profile } = resolved;

    const portfolio = await this.portfolioModel
      .findOne({ owner: accountId, slug: portfolioSlug, isPublished: true })
      .select('_id title slug description meta isPublished')
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

    const posts = await this.postModel
      .find({
        authorId: String(accountId),
        status: POST_STATUS.PUBLISHED,
      })
      .select('_id title slug excerpt coverImage viewCount createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      username: profile.username,
      ownerName: profile.fullName ?? profile.username,
      ownerAvatar: profile.avatar ?? '',
      ownerEmail: profile.email,
      title: portfolio.title,
      slug: portfolio.slug,
      description: portfolio.description,
      meta: portfolio.meta,
      pages: pages.map((p) => ({ ...p, urlSlug: normalizeSlug(p.slug) })),
      posts: posts.map((p) => ({
        _id: String(p._id),
        title: p.title as string,
        slug: p.slug as string,
        excerpt: p.excerpt as string,
        coverImage: p.coverImage as string,
        views: ((p as any).viewCount as number) || 0,
        createdAt: ((p as any).createdAt as Date)?.toISOString(),
      })),
    };
  }

  // ─── Portfolio Page ──────────────────────────────────────────────────────────

  /**
   * GET /public/user/:username/:portfolioSlug/:pageSlug
   * Returns the full layout JSON + all page navigation for the renderer.
   */
  async findPublicPage(username: string, portfolioSlug: string, pageSlug: string) {
    const resolved = await this.resolveAccount(username);
    if (!resolved) {
      throw new NotFoundException(`User "${username}" not found`);
    }

    const { accountId, profile } = resolved;

    const portfolio = await this.portfolioModel
      .findOne({ owner: accountId, slug: portfolioSlug, isPublished: true })
      .select('_id title slug description meta isPublished')
      .lean()
      .exec();

    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio "${portfolioSlug}" not found or is not published`,
      );
    }

    const allPages = await this.pageModel
      .find({ portfolio: portfolio._id, isPublished: true })
      .select('_id title slug order')
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    const normalizedPageSlug = normalizeSlug(pageSlug);
    const page = allPages.find(
      (p) => normalizeSlug(p.slug) === normalizedPageSlug,
    );
    if (!page) {
      throw new NotFoundException(
        `Page "${pageSlug}" not found or is not published`,
      );
    }

    const fullPage = await this.pageModel.findById(page._id).lean().exec();

    return {
      portfolio: {
        title: portfolio.title,
        slug: portfolio.slug,
        description: portfolio.description,
        ownerName: profile.fullName ?? profile.username,
        ownerUsername: profile.username,
        meta: portfolio.meta,
      },
      page: {
        _id: fullPage!._id,
        title: fullPage!.title,
        slug: fullPage!.slug,
        layout: fullPage!.layout,
      },
      allPages: allPages.map((p) => ({
        title: p.title,
        slug: p.slug,
        urlSlug: normalizeSlug(p.slug),
      })),
    };
  }

  // ─── Portfolio Post ──────────────────────────────────────────────────────────

  /**
   * GET /public/user/:username/:portfolioSlug/post/:postSlug
   * Returns public post data + portfolio meta.
   */
  async findPublicPost(username: string, portfolioSlug: string, postSlug: string) {
    const resolved = await this.resolveAccount(username);
    if (!resolved) {
      throw new NotFoundException(`User "${username}" not found`);
    }

    const { accountId, profile } = resolved;

    const portfolio = await this.portfolioModel
      .findOne({ owner: accountId, slug: portfolioSlug, isPublished: true })
      .select('_id title slug description meta isPublished')
      .lean()
      .exec();

    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio "${portfolioSlug}" not found or is not published`,
      );
    }

    const post = await this.postModel
      .findOne({
        slug: postSlug,
        authorId: String(accountId),
        status: POST_STATUS.PUBLISHED,
      })
      .populate('postTypeId')
      .exec();

    if (!post) {
      throw new NotFoundException(
        `Post "${postSlug}" not found or is not published`,
      );
    }

    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

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
        ownerName: profile.fullName ?? profile.username,
        ownerUsername: profile.username,
        meta: portfolio.meta,
      },
      post: post.toObject(),
      allPages: allPages.map((p) => ({
        title: p.title,
        slug: p.slug,
        urlSlug: normalizeSlug(p.slug),
      })),
    };
  }

  // ─── Explore / List All Published ───────────────────────────────────────────

  async listAllPublished(
    query?: string,
    page = 1,
    limit = 12,
    excludeUsername?: string,
    category?: string,
  ): Promise<PaginatedResult<PublicPortfolioCard>> {
    const skip = (page - 1) * limit;
    const trimmedQuery = query?.trim() ?? '';

    // Resolve excludeUsername to ObjectId if provided
    let excludeOwnerId: Types.ObjectId | undefined;
    if (excludeUsername) {
      const prof = await this.profileModel
        .findOne({ username: excludeUsername.toLowerCase() })
        .lean()
        .exec();
      if (prof) {
        excludeOwnerId = prof.accountId as Types.ObjectId;
      }
    }

    const initialMatch: Record<string, unknown> = { isPublished: true };
    if (category) {
      const cats = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (cats.length > 0) initialMatch.categories = { $in: cats };
    }
    if (excludeOwnerId) {
      initialMatch.owner = { $ne: excludeOwnerId };
    }

    const pipeline: object[] = [
      { $match: initialMatch },

      // Join user_profiles for owner info
      {
        $lookup: {
          from: 'user_profiles',
          localField: 'owner',
          foreignField: 'accountId',
          as: 'ownerProfile',
        },
      },
      { $unwind: { path: '$ownerProfile', preserveNullAndEmptyArrays: true } },

      // Count published pages
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

      // Count published posts
      {
        $lookup: {
          from: 'posts',
          let: { ownerId: '$owner' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$authorId', { $toString: '$$ownerId' }] },
                    { $eq: ['$status', 'published'] },
                  ],
                },
              },
            },
            { $count: 'n' },
          ],
          as: 'postCounts',
        },
      },
    ];

    if (trimmedQuery.length > 0) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: trimmedQuery, $options: 'i' } },
            { description: { $regex: trimmedQuery, $options: 'i' } },
            { 'ownerProfile.username': { $regex: trimmedQuery, $options: 'i' } },
            { 'ownerProfile.fullName': { $regex: trimmedQuery, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        description: { $ifNull: ['$description', ''] },
        ownerUsername: { $ifNull: ['$ownerProfile.username', 'unknown'] },
        ownerName: {
          $ifNull: [
            '$ownerProfile.fullName',
            { $ifNull: ['$ownerProfile.username', 'Unknown'] },
          ],
        },
        ownerAvatar: { $ifNull: ['$ownerProfile.avatar', ''] },
        ownerEmail: { $ifNull: ['$ownerProfile.email', ''] },
        pageCount: { $ifNull: [{ $arrayElemAt: ['$pageCounts.n', 0] }, 0] },
        postCount: { $ifNull: [{ $arrayElemAt: ['$postCounts.n', 0] }, 0] },
        categories: 1,
        meta: 1,
        createdAt: 1,
      },
    });

    pipeline.push({ $sort: { createdAt: -1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.portfolioModel
      .aggregate(countPipeline as any)
      .exec();
    const total: number = (countResult[0]?.total as number | undefined) ?? 0;

    pipeline.push({ $skip: skip }, { $limit: limit });

    const results = await this.portfolioModel
      .aggregate(pipeline as any)
      .exec();

    return {
      data: results.map((r) => ({
        _id: String(r._id),
        title: r.title as string,
        slug: r.slug as string,
        description: r.description as string,
        ownerUsername: r.ownerUsername as string,
        ownerName: r.ownerName as string,
        ownerAvatar: (r.ownerAvatar as string) || '',
        ownerEmail: (r.ownerEmail as string) || '',
        pageCount: r.pageCount as number,
        postCount: (r.postCount as number) || 0,
        categories: (r.categories as string[]) || [],
        meta: (r.meta as PublicPortfolioCard['meta']) ?? {},
        createdAt: (r.createdAt as Date).toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Sitemap ─────────────────────────────────────────────────────────────────

  async getSitemapData(): Promise<
    { urlPath: string; lastmod: Date; isPage: boolean }[]
  > {
    const portfolios = await this.portfolioModel
      .find({ isPublished: true })
      .select('_id slug owner updatedAt')
      .lean()
      .exec();

    const result: { urlPath: string; lastmod: Date; isPage: boolean }[] = [];

    for (const p of portfolios) {
      // Lookup owner username
      const ownerProfile = await this.profileModel
        .findOne({ accountId: p.owner })
        .select('username')
        .lean()
        .exec();
      const username = ownerProfile?.username ?? 'unknown';

      result.push({
        urlPath: `/${username}/${p.slug}`,
        lastmod: ((p as any).updatedAt as Date) || new Date(),
        isPage: false,
      });

      const pages = await this.pageModel
        .find({ portfolio: p._id, isPublished: true })
        .select('slug updatedAt')
        .lean()
        .exec();

      for (const page of pages) {
        result.push({
          urlPath: `/${username}/${p.slug}/${normalizeSlug(page.slug)}`,
          lastmod: ((page as any).updatedAt as Date) || new Date(),
          isPage: true,
        });
      }
    }

    return result;
  }
}
