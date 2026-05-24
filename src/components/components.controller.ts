import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  /**
   * GET /api/v1/components
   * Public — list all registered components (built-in + custom)
   */
  @Get()
  findAll() {
    return this.componentsService.findAll();
  }

  /**
   * GET /api/v1/components/:type
   * Public — get a single component definition by type
   */
  @Get(':type')
  findOne(@Param('type') type: string) {
    return this.componentsService.findByType(type);
  }

  /**
   * POST /api/v1/components
   * Auth required — register a custom component
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateComponentDto) {
    return this.componentsService.create(dto);
  }

  /**
   * PATCH /api/v1/components/:type
   * Auth required — update a component definition
   */
  @Patch(':type')
  @UseGuards(JwtAuthGuard)
  update(@Param('type') type: string, @Body() dto: UpdateComponentDto) {
    return this.componentsService.update(type, dto);
  }

  /**
   * DELETE /api/v1/components/:type
   * Auth required — remove a custom component (built-in are protected)
   */
  @Delete(':type')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('type') type: string) {
    return this.componentsService.remove(type);
  }
}
