import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ComponentDefinition,
  ComponentDocument,
} from './schemas/component.schema';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { BUILT_IN_COMPONENTS } from './registry/component-registry';

@Injectable()
export class ComponentsService implements OnModuleInit {
  private readonly logger = new Logger(ComponentsService.name);

  constructor(
    @InjectModel(ComponentDefinition.name)
    private readonly componentModel: Model<ComponentDocument>,
  ) {}

  /**
   * Seed built-in components on module initialization.
   * Uses upsert to avoid duplicate errors on restarts.
   */
  async onModuleInit() {
    this.logger.log('Seeding built-in component registry...');
    let seeded = 0;

    for (const component of BUILT_IN_COMPONENTS) {
      const result = await this.componentModel
        .findOneAndUpdate(
          { type: component.type },
          { $setOnInsert: component },
          { upsert: true, new: false },
        )
        .exec();

      if (!result) seeded++;
    }

    if (seeded > 0) {
      this.logger.log(
        `✅ Seeded ${seeded} new built-in component(s) into registry`,
      );
    } else {
      this.logger.log('✅ Component registry already up to date');
    }
  }

  async findAll(): Promise<ComponentDocument[]> {
    return this.componentModel.find().sort({ category: 1, name: 1 }).exec();
  }

  async findByType(type: string): Promise<ComponentDocument> {
    const component = await this.componentModel
      .findOne({ type: type.toLowerCase() })
      .exec();
    if (!component) {
      throw new NotFoundException(
        `Component type "${type}" is not registered`,
      );
    }
    return component;
  }

  async create(dto: CreateComponentDto): Promise<ComponentDocument> {
    const existing = await this.componentModel
      .findOne({ type: dto.type })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Component type "${dto.type}" is already registered`,
      );
    }

    const component = new this.componentModel({ ...dto, isBuiltIn: false });
    return component.save();
  }

  async update(
    type: string,
    dto: UpdateComponentDto,
  ): Promise<ComponentDocument> {
    const component = await this.findByType(type);

    if (component.isBuiltIn && dto.type && dto.type !== component.type) {
      throw new ForbiddenException(
        'Cannot change the type of a built-in component',
      );
    }

    Object.assign(component, dto);
    return component.save();
  }

  async remove(type: string): Promise<{ deleted: boolean }> {
    const component = await this.findByType(type);

    if (component.isBuiltIn) {
      throw new ForbiddenException(
        `Built-in component "${type}" cannot be deleted`,
      );
    }

    await this.componentModel.findByIdAndDelete(component._id).exec();
    return { deleted: true };
  }
}
