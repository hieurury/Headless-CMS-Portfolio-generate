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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('portfolios/:portfolioId/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  /**
   * POST /api/v1/portfolios/:portfolioId/pages
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('portfolioId') portfolioId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePageDto,
  ) {
    return this.pagesService.create(portfolioId, user.sub, dto);
  }

  /**
   * GET /api/v1/portfolios/:portfolioId/pages
   */
  @Get()
  findAll(
    @Param('portfolioId') portfolioId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.findAll(portfolioId, user.sub);
  }

  /**
   * GET /api/v1/portfolios/:portfolioId/pages/:pageId
   */
  @Get(':pageId')
  findOne(
    @Param('portfolioId') portfolioId: string,
    @Param('pageId') pageId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.findOne(portfolioId, pageId, user.sub);
  }

  /**
   * PATCH /api/v1/portfolios/:portfolioId/pages/:pageId
   */
  @Patch(':pageId')
  update(
    @Param('portfolioId') portfolioId: string,
    @Param('pageId') pageId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(portfolioId, pageId, user.sub, dto);
  }

  /**
   * DELETE /api/v1/portfolios/:portfolioId/pages/:pageId
   */
  @Delete(':pageId')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('portfolioId') portfolioId: string,
    @Param('pageId') pageId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.remove(portfolioId, pageId, user.sub);
  }
}
