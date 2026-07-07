import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PosttypeService } from './posttype.service';
import { CreatePosttypeDto } from './dto/create-posttype.dto';
import { UpdatePosttypeDto } from './dto/update-posttype.dto';

@Controller('posttype')
export class PosttypeController {
  constructor(private readonly posttypeService: PosttypeService) {}

  @Post()
  create(@Body() createPosttypeDto: CreatePosttypeDto) {
    return this.posttypeService.create(createPosttypeDto);
  }

  @Get()
  findAll() {
    return this.posttypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posttypeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePosttypeDto: UpdatePosttypeDto) {
    return this.posttypeService.update(id, updatePosttypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posttypeService.remove(id);
  }
}
