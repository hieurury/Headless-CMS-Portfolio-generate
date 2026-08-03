import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Media, MEDIA_TYPE, MediaDocument } from './schema/media.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UploadService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
  ) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // ─── Upload ───────────────────────────────────────────────────────────────

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    folder = 'Uncategorized',
  ): Promise<MediaDocument> {
    const uploaded = await this.uploadToCloudinary(file.buffer, folder);

    return this.mediaModel.create({
      userId: new Types.ObjectId(userId),
      folder,
      url: uploaded.url,
      publicId: uploaded.publicId,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: MEDIA_TYPE.IMAGE,
    });
  }

  // ─── List ─────────────────────────────────────────────────────────────────

  async getMediaByUser(
    userId: string,
    folder?: string,
  ): Promise<MediaDocument[]> {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (folder) filter.folder = folder;
    return this.mediaModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /** Return unique folder names owned by the user */
  async getFoldersByUser(userId: string): Promise<string[]> {
    return this.mediaModel
      .distinct('folder', { userId: new Types.ObjectId(userId) })
      .exec();
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    const media = await this.mediaModel.findById(mediaId).exec();
    if (!media) throw new NotFoundException('Media not found');
    if (media.userId.toString() !== userId) {
      throw new ForbiddenException('You do not own this media');
    }

    // Remove from Cloudinary first; ignore "not found" errors gracefully
    await cloudinary.uploader.destroy(media.publicId).catch(() => null);

    await this.mediaModel.findByIdAndDelete(mediaId).exec();
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  async uploadToCloudinary(
    buffer: Buffer,
    folder = 'cms-portfolio',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(
              new BadRequestException(
                error?.message ?? 'Cloudinary upload failed',
              ),
            );
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(buffer);
    });
  }

  /** @deprecated Use uploadToCloudinary instead */
  async uploadImageToCloudinary(
    buffer: Buffer,
    folder = 'cms-portfolio',
  ): Promise<{ url: string; publicId: string }> {
    return this.uploadToCloudinary(buffer, folder);
  }
}
