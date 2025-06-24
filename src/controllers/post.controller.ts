import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ValidationPipe,
    ParseIntPipe,
    HttpStatus,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from '../dto/post.dto';

@ApiTags('Posts')
@Controller('api/posts')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post()
    @ApiOperation({ summary: '创建新文章' })
    @ApiBody({ type: CreatePostDto })
    @ApiResponse({ status: 201, description: '文章创建成功' })
    @ApiResponse({ status: 409, description: 'Slug已存在' })
    @ApiResponse({ status: 400, description: '请求参数错误' })
    async createPost(
        @Body(new ValidationPipe({ transform: true })) createPostDto: CreatePostDto,
    ) {
        return this.postService.createPost(createPostDto);
    }

    @Get()
    @ApiOperation({ summary: '获取文章列表' })
    @ApiQuery({ name: 'page', required: false, description: '页码' })
    @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
    @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
    @ApiQuery({ name: 'published', required: false, description: '是否已发布' })
    @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
    @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
    @ApiResponse({ status: 200, description: '获取文章列表成功' })
    async findAllPosts(
        @Query(new ValidationPipe({ transform: true })) query: QueryPostDto,
    ) {
        return this.postService.findAllPosts(query);
    }

    @Get('stats')
    @ApiOperation({ summary: '获取文章统计信息' })
    @ApiResponse({ status: 200, description: '获取统计信息成功' })
    async getPostStats() {
        return this.postService.getPostStats();
    }

    @Get(':id')
    @ApiOperation({ summary: '根据ID获取文章' })
    @ApiParam({ name: 'id', description: '文章ID' })
    @ApiResponse({ status: 200, description: '获取文章成功' })
    @ApiResponse({ status: 404, description: '文章不存在' })
    async findPostById(@Param('id', ParseIntPipe) id: number) {
        return this.postService.findPostById(id);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: '根据Slug获取文章' })
    @ApiParam({ name: 'slug', description: '文章Slug' })
    @ApiResponse({ status: 200, description: '获取文章成功' })
    @ApiResponse({ status: 404, description: '文章不存在' })
    async findPostBySlug(@Param('slug') slug: string) {
        return this.postService.findPostBySlug(slug);
    }

    @Put(':id')
    @ApiOperation({ summary: '更新文章' })
    @ApiParam({ name: 'id', description: '文章ID' })
    @ApiBody({ type: UpdatePostDto })
    @ApiResponse({ status: 200, description: '文章更新成功' })
    @ApiResponse({ status: 404, description: '文章不存在' })
    @ApiResponse({ status: 409, description: 'Slug已存在' })
    async updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true })) updatePostDto: UpdatePostDto,
    ) {
        return this.postService.updatePost(id, updatePostDto);
    }

    @Patch(':id/publish')
    @ApiOperation({ summary: '发布文章' })
    @ApiParam({ name: 'id', description: '文章ID' })
    @ApiResponse({ status: 200, description: '文章发布成功' })
    @ApiResponse({ status: 404, description: '文章不存在' })
    async publishPost(@Param('id', ParseIntPipe) id: number) {
        return this.postService.publishPost(id);
    }

    @Patch(':id/unpublish')
    @ApiOperation({ summary: '取消发布文章' })
    @ApiParam({ name: 'id', description: '文章ID' })
    @ApiResponse({ status: 200, description: '取消发布成功' })
    @ApiResponse({ status: 404, description: '文章不存在' })
    async unpublishPost(@Param('id', ParseIntPipe) id: number) {
        return this.postService.unpublishPost(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除文章' })
    @ApiParam({ name: 'id', description: '文章ID' })
    @ApiResponse({ status: 204, description: '文章删除成功' })
    @ApiResponse({ status: 404, description: '文章不存在' })
    async deletePost(@Param('id', ParseIntPipe) id: number) {
        await this.postService.deletePost(id);
        return { message: '文章删除成功' };
    }
}