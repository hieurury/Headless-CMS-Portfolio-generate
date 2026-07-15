import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested } from 'class-validator';

export class FieldDefinitionDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsString()
    label: string;

    @IsString({ each: true, always: true })
    options?: string[];
}

export class CreatePosttypeDto {
    @IsString()
    name: string;

    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDefinitionDto)
    customFieldsSchema: FieldDefinitionDto[];
}
