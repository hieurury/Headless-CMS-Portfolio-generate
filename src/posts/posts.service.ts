import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, POST_STATUS } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Xác định publishedAt:
   * - Nếu status là PUBLISHED và không có publishedAt → set ngay bây giờ
   * - Nếu status là SCHEDULED và có publishedAt trong tương lai → giữ nguyên
   * - Các trường hợp khác → để null
   */
  private resolvePublishedAt(
    status: POST_STATUS | undefined,
    publishedAt: string | undefined,
  ): Date | undefined {
    if (status === POST_STATUS.PUBLISHED) {
      return publishedAt ? new Date(publishedAt) : new Date();
    }
    if (status === POST_STATUS.SCHEDULED && publishedAt) {
      return new Date(publishedAt);
    }
    return undefined;
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const slug = this.createSlug(createPostDto.title) + '-' + Date.now();
    const resolvedStatus = createPostDto.status ?? POST_STATUS.DRAFT;
    const publishedAt = this.resolvePublishedAt(
      resolvedStatus,
      createPostDto.publishedAt,
    );

    const post = new this.postModel({
      ...createPostDto,
      slug,
      authorId,
      layout: { sections: [] },
      status: resolvedStatus,
      publishedAt,
    });
    return post.save();
  }

  async findAll(postTypeId?: string): Promise<Post[]> {
    const filter = postTypeId ? { postTypeId } : {};
    return this.postModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    // Nếu cập nhật status, cũng tính lại publishedAt
    const updates: Record<string, any> = { ...updatePostDto };
    if (updatePostDto.status !== undefined) {
      const publishedAt = this.resolvePublishedAt(
        updatePostDto.status as POST_STATUS,
        updatePostDto.publishedAt,
      );
      // Chỉ ghi đè publishedAt nếu hàm trả về giá trị (tránh xóa ngày đã tồn tại)
      if (publishedAt) {
        updates.publishedAt = publishedAt;
      }
    }

    const post = await this.postModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Post #${id} not found`);
  }

  /** Tăng viewCount 1 đơn vị (gọi khi user mở bài viết) */
  async incrementViewCount(id: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
      .exec();
  }
}
