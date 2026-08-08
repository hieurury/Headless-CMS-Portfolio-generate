import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';
import {
  Portfolio,
  PortfolioDocument,
} from '../portfolios/schemas/portfolio.schema';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,
  ) {}

  /**
   * Verify the portfolio exists and belongs to the owner.
   * Always cast both IDs to ObjectId — MongoDB stores them as ObjectId,
   * string comparison silently returns no results.
   */
  private async getPortfolio(
    portfolioId: string,
    ownerId: string,
  ): Promise<PortfolioDocument> {
    const portfolio = await this.portfolioModel
      .findOne({
        _id: new Types.ObjectId(portfolioId),
        owner: new Types.ObjectId(ownerId),
      })
      .exec();
    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio "${portfolioId}" not found or you do not have access`,
      );
    }
    return portfolio;
  }

  async create(
    portfolioId: string,
    ownerId: string,
    dto: CreatePageDto,
  ): Promise<PageDocument> {
    const portfolio = await this.getPortfolio(portfolioId, ownerId);
    const portfolioOid = new Types.ObjectId(portfolioId);

    const existing = await this.pageModel
      .findOne({ portfolio: portfolioOid, slug: dto.slug })
      .exec();
    if (existing) {
      throw new ConflictException(
        `A page with slug "${dto.slug}" already exists in this portfolio`,
      );
    }

    const page = await new this.pageModel({
      ...dto,
      layout: dto.layout ?? { sections: [] },
      portfolio: portfolioOid,
    }).save();

    // Register page reference in portfolio
    portfolio.pages.push(page._id);
    await portfolio.save();

    return page;
  }

  async findAll(portfolioId: string, ownerId: string): Promise<PageDocument[]> {
    await this.getPortfolio(portfolioId, ownerId);
    return this.pageModel
      .find({ portfolio: new Types.ObjectId(portfolioId) })
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }

  async findOne(
    portfolioId: string,
    pageId: string,
    ownerId: string,
  ): Promise<PageDocument> {
    await this.getPortfolio(portfolioId, ownerId);
    const page = await this.pageModel
      .findOne({
        _id: new Types.ObjectId(pageId),
        portfolio: new Types.ObjectId(portfolioId),
      })
      .exec();
    if (!page) {
      throw new NotFoundException(`Page "${pageId}" not found`);
    }
    return page;
  }

  async update(
    portfolioId: string,
    pageId: string,
    ownerId: string,
    dto: UpdatePageDto,
  ): Promise<PageDocument> {
    const page = await this.findOne(portfolioId, pageId, ownerId);

    // Check slug conflict if changing slug
    if (dto.slug && dto.slug !== page.slug) {
      const conflict = await this.pageModel
        .findOne({
          portfolio: new Types.ObjectId(portfolioId),
          slug: dto.slug,
          _id: { $ne: new Types.ObjectId(pageId) },
        })
        .exec();
      if (conflict) {
        throw new ConflictException(
          `A page with slug "${dto.slug}" already exists in this portfolio`,
        );
      }
    }

    Object.assign(page, dto);
    return page.save();
  }

  async remove(
    portfolioId: string,
    pageId: string,
    ownerId: string,
  ): Promise<{ deleted: boolean }> {
    const page = await this.findOne(portfolioId, pageId, ownerId);

    // Remove page reference from portfolio
    await this.portfolioModel
      .findByIdAndUpdate(portfolioId, { $pull: { pages: page._id } })
      .exec();

    await this.pageModel.findByIdAndDelete(pageId).exec();
    return { deleted: true };
  }
}
