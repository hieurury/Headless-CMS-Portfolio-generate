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

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const slug = this.createSlug(createPostDto.title) + '-' + Date.now();
    const post = new this.postModel({
      ...createPostDto,
      slug,
      authorId,
      layout: { sections: [] },
      status: createPostDto.status ?? POST_STATUS.DRAFT,
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
    const post = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { returnDocument: 'after' })
      .exec();
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Post #${id} not found`);
  }
}
