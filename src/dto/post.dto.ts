import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePostDto {
    @ApiProperty({
        example: 'Getting Started with NestJS',
        description: '文章标题',
        maxLength: 255
    })
    @IsString()
    @MinLength(1, { message: '标题不能为空' })
    @MaxLength(255, { message: '标题不能超过255个字符' })
    title: string;

    @ApiProperty({
        example: 'This is a comprehensive guide about NestJS...',
        description: '文章内容'
    })
    @IsString()
    @MinLength(1, { message: '内容不能为空' })
    content: string;

    @ApiProperty({
        example: 'A comprehensive guide for beginners',
        description: '文章摘要',
        required: false,
        maxLength: 500
    })
    @IsOptional()
    @MaxLength(500, { message: '摘要不能超过500个字符' })
    summary?: string;

    @ApiProperty({
        example: 'getting-started-with-nestjs',
        description: '文章slug，用于URL',
        maxLength: 255
    })
    @IsString()
    @MinLength(1, { message: 'Slug不能为空' })
    @MaxLength(255, { message: 'Slug不能超过255个字符' })
    @Transform(({ value }) => value.toLowerCase().replace(/\s+/g, '-'))
    slug: string;

    @ApiProperty({
        example: false,
        description: '是否发布',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    published?: boolean = false;
}

export class UpdatePostDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    content?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @MaxLength(500)
    summary?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    @Transform(({ value }) => value?.toLowerCase().replace(/\s+/g, '-'))
    slug?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class QueryPostDto {
    @ApiProperty({ required: false, default: 1, minimum: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    page?: number = 1;

    @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    limit?: number = 10;

    @ApiProperty({ required: false, description: '搜索关键词' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, description: '是否只显示已发布的文章' })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    published?: boolean;

    @ApiProperty({
        required: false,
        enum: ['createdAt', 'updatedAt', 'title'],
        description: '排序字段'
    })
    @IsOptional()
    @IsString()
    sortBy?: 'createdAt' | 'updatedAt' | 'title' = 'createdAt';

    @ApiProperty({
        required: false,
        enum: ['asc', 'desc'],
        description: '排序方向'
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';
}