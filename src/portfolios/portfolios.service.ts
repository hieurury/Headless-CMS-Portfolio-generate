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
    const existing = await this.portfolioModel
      .findOne({ owner: ownerId, slug: dto.slug })
      .exec();
    if (existing) {
      throw new ConflictException(
        `A portfolio with slug "${dto.slug}" already exists`,
      );
    }

    const portfolio = new this.portfolioModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });
    return portfolio.save();
  }

  async findAllByOwner(ownerId: string): Promise<PortfolioDocument[]> {
    return this.portfolioModel
      .find({ owner: ownerId })
      .populate('pages', 'title slug order isPublished')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, ownerId: string): Promise<PortfolioDocument> {
    const portfolio = await this.portfolioModel
      .findById(id)
      .populate('pages')
      .exec();

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID "${id}" not found`);
    }

    if (portfolio.owner.toString() !== ownerId) {
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

    // Check slug conflict if slug is being changed
    if (dto.slug && dto.slug !== portfolio.slug) {
      const conflict = await this.portfolioModel
        .findOne({ owner: ownerId, slug: dto.slug, _id: { $ne: id } })
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
    await this.portfolioModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
