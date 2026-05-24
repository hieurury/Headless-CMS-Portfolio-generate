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
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  /**
   * POST /api/v1/portfolios
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePortfolioDto,
  ) {
    return this.portfoliosService.create(user.sub, dto);
  }

  /**
   * GET /api/v1/portfolios
   */
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.portfoliosService.findAllByOwner(user.sub);
  }

  /**
   * GET /api/v1/portfolios/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.portfoliosService.findOne(id, user.sub);
  }

  /**
   * PATCH /api/v1/portfolios/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfoliosService.update(id, user.sub, dto);
  }

  /**
   * DELETE /api/v1/portfolios/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.portfoliosService.remove(id, user.sub);
  }
}
