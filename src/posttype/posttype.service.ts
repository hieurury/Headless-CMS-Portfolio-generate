import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePosttypeDto } from './dto/create-posttype.dto';
import { UpdatePosttypeDto } from './dto/update-posttype.dto';
import { Posttype } from './schema/posttype.schema';
import { Model } from 'mongoose';

@Injectable()
export class PosttypeService {
  constructor(@InjectModel(Posttype.name) private readonly posttypeModel: Model<Posttype>) { }
  create(createPosttypeDto: CreatePosttypeDto, authorId: string) {

    const slug = this.createSlug(createPosttypeDto.name);
    return this.posttypeModel.create({ ...createPosttypeDto, slug, authorId });
  }

  createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  findAll(authorId: string) {
    return this.posttypeModel.find({ authorId }).exec();
  }

  findOne(id: string, authorId: string) {
    return this.posttypeModel.findOne({ _id: id, authorId }).exec();
  }

  update(id: string, updatePosttypeDto: UpdatePosttypeDto, authorId: string) {
    return this.posttypeModel.findOneAndUpdate({ _id: id, authorId }, updatePosttypeDto, { new: true }).exec();
  }

  remove(id: string, authorId: string) {
    return this.posttypeModel.findOneAndDelete({ _id: id, authorId }).exec();
  }
}
