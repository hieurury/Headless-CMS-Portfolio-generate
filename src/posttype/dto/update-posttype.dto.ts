import { PartialType } from '@nestjs/mapped-types';
import { CreatePosttypeDto } from './create-posttype.dto';

export class UpdatePosttypeDto extends PartialType(CreatePosttypeDto) {}
