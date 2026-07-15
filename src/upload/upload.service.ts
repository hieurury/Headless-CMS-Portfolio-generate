import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Media, MEDIA_TYPE, MediaDocument } from './schema/media.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UploadService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
  ) {
    const c = cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadImage(file: Express.Multer.File): Promise<Media> {
    const uploaded = await this.uploadImageToCloudinary(file.buffer);

    return this.mediaModel.create({
      url: uploaded.url,
      publicId: uploaded.publicId,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: MEDIA_TYPE.IMAGE,
    });
  }
  /**
   * Upload an image buffer to Cloudinary.
   * @param buffer  Raw file buffer from multer
   * @param folder  Cloudinary folder (default: 'cms-portfolio')
   */
  async uploadImageToCloudinary(
    buffer: Buffer,
    folder = 'cms-portfolio',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          // folder,
          resource_type: 'image',
          // Auto-detect format, strip metadata, compress automatically
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(new BadRequestException(error?.message ?? 'Cloudinary upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(buffer);
    });
  }
}
