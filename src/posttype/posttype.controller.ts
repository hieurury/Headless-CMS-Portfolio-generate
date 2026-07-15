import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PosttypeService } from './posttype.service';
import { CreatePosttypeDto } from './dto/create-posttype.dto';
import { UpdatePosttypeDto } from './dto/update-posttype.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('posttype')
export class PosttypeController {
  constructor(private readonly posttypeService: PosttypeService) {}

  @Post()
  create(@Body() createPosttypeDto: CreatePosttypeDto, @Req() req: any) {
    const authorId = req.user.sub;
    return this.posttypeService.create(createPosttypeDto, authorId);
  }

  @Get()
  findAll(@Req() req: any) {
    const authorId = req.user.sub;
    return this.posttypeService.findAll(authorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const authorId = req.user.sub;
    return this.posttypeService.findOne(id, authorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePosttypeDto: UpdatePosttypeDto, @Req() req: any) {
    const authorId = req.user.sub;
    return this.posttypeService.update(id, updatePosttypeDto, authorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const authorId = req.user.sub;
    return this.posttypeService.remove(id, authorId);
  }
}
