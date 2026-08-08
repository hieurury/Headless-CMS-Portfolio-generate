import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ImageUploadInterceptor } from './controller.interceptor';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  /**
   * POST /api/v1/upload/image
   * Body (multipart): field "file" + optional "folder" (text)
   */
  @Post('image')
  @UseInterceptors(ImageUploadInterceptor)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const user = req.user as { sub?: string; userId?: string };
    const userId = user?.sub || user?.userId || '';
    return this.uploadService.uploadImage(file, userId, folder);
  }

  /**
   * GET /api/v1/upload
   * Query: ?folder=Hero+Images
   */
  @Get()
  async getMedia(@Req() req: Request, @Query('folder') folder?: string) {
    const user = req.user as { sub?: string; userId?: string };
    const userId = user?.sub || user?.userId || '';
    return this.uploadService.getMediaByUser(userId, folder);
  }

  /**
   * GET /api/v1/upload/folders
   * Returns all distinct folder names for the current user.
   */
  @Get('folders')
  async getFolders(@Req() req: Request) {
    const user = req.user as { sub?: string; userId?: string };
    const userId = user?.sub || user?.userId || '';
    return this.uploadService.getFoldersByUser(userId);
  }

  /**
   * DELETE /api/v1/upload/:id
   * Deletes from Cloudinary and MongoDB.
   */
  @Delete(':id')
  async deleteMedia(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub?: string; userId?: string };
    const userId = user?.sub || user?.userId || '';
    await this.uploadService.deleteMedia(id, userId);
    return { message: 'Media deleted successfully' };
  }
}
