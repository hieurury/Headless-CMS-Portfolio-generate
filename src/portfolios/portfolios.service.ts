import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Portfolio, PortfolioDocument } from './schemas/portfolio.schema';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

/**
 * IMPORTANT: All queries that match against MongoDB ObjectId fields (_id, owner, portfolio, etc.)
 * MUST use `new Types.ObjectId(id)` — never pass a raw string.
 * MongoDB stores these fields as ObjectId, not string. String comparison silently returns 0 results.
 */
@Injectable()
export class PortfoliosService {
  constructor(
    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,
  ) {}

  async create(
    ownerId: string,
    dto: CreatePortfolioDto,
  ): Promise<PortfolioDocument> {
    const ownerOid = new Types.ObjectId(ownerId);

    const existing = await this.portfolioModel
      .findOne({ owner: ownerOid, slug: dto.slug })
      .exec();
    if (existing) {
      throw new ConflictException(
        `A portfolio with slug "${dto.slug}" already exists`,
      );
    }

    const portfolio = new this.portfolioModel({
      ...dto,
      owner: ownerOid,
    });
    return portfolio.save();
  }

  async findAllByOwner(ownerId: string): Promise<PortfolioDocument[]> {
    return this.portfolioModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .populate('pages', 'title slug order isPublished')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, ownerId: string): Promise<PortfolioDocument> {
    const portfolio = await this.portfolioModel
      .findById(new Types.ObjectId(id))
      .populate('pages')
      .exec();

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID "${id}" not found`);
    }

    // Compare as strings — both sides are ObjectId after cast
    if (portfolio.owner.toString() !== new Types.ObjectId(ownerId).toString()) {
      throw new ForbiddenException('You do not have access to this portfolio');
    }

    return portfolio;
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdatePortfolioDto,
  ): Promise<PortfolioDocument> {
    const portfolio = await this.findOne(id, ownerId);
    const ownerOid = new Types.ObjectId(ownerId);

    // Check slug conflict if slug is being changed
    if (dto.slug && dto.slug !== portfolio.slug) {
      const conflict = await this.portfolioModel
        .findOne({
          owner: ownerOid,
          slug: dto.slug,
          _id: { $ne: new Types.ObjectId(id) },
        })
        .exec();
      if (conflict) {
        throw new ConflictException(
          `A portfolio with slug "${dto.slug}" already exists`,
        );
      }
    }

    Object.assign(portfolio, dto);
    return portfolio.save();
  }

  async remove(id: string, ownerId: string): Promise<{ deleted: boolean }> {
    await this.findOne(id, ownerId); // ownership check
    await this.portfolioModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
    return { deleted: true };
  }
}
