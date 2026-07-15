import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import { ImageUploadInterceptor } from './controller.interceptor';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  /**
   * POST /api/v1/upload/image
   * Accepts a multipart/form-data request with field name "file".
   * Uploads the image to Cloudinary and returns the secure URL.
   */
  @Post('image')
  @UseInterceptors(ImageUploadInterceptor)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadService.uploadImage(file);
  }
}
