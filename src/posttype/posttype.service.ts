import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePosttypeDto } from './dto/create-posttype.dto';
import { UpdatePosttypeDto } from './dto/update-posttype.dto';
import { Posttype } from './schema/posttype.schema';
import { Model } from 'mongoose';

@Injectable()
export class PosttypeService {
  constructor(@InjectModel(Posttype.name) private readonly posttypeModel: Model<Posttype>) { }
  create(createPosttypeDto: CreatePosttypeDto) {
    const slug = this.createSlug(createPosttypeDto.name);
    return this.posttypeModel.create({ ...createPosttypeDto, slug });
  }

  createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  findAll() {
    return this.posttypeModel.find().exec();
  }

  findOne(id: string) {
    return this.posttypeModel.findById(id).exec();
  }

  update(id: string, updatePosttypeDto: UpdatePosttypeDto) {
    return this.posttypeModel.findByIdAndUpdate(id, updatePosttypeDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.posttypeModel.findByIdAndDelete(id).exec();
  }
}
