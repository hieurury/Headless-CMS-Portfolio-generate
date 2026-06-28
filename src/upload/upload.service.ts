import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    const c = cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
    console.log('UploadService Cloudinary Config:', { cloud_name: c.cloud_name, api_key: c.api_key });
  }

  /**
   * Upload an image buffer to Cloudinary.
   * @param buffer  Raw file buffer from multer
   * @param folder  Cloudinary folder (default: 'cms-portfolio')
   */
  async uploadImage(
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
