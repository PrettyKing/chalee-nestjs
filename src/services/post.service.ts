import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from '../dto/post.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service'; // Assuming you have a PrismaService for database operations

type PostCreateInput = any;
type Post = any; // Replace with actual Post type from your Prisma schema

@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);

    constructor(private prisma: PrismaService) { }

    async createPost(data: CreatePostDto): Promise<Post> {
        try {
            this.logger.log(`Creating post with slug: ${data.slug}`);

            return await this.prisma.posts.create({
                data,
            } as PostCreateInput);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('该 slug 已存在，请使用其他 slug');
                }
            }
            this.logger.error('Failed to create post', error);
            throw error;
        }
    }

    async findAllPosts(query: QueryPostDto) {
        const { page, limit, search, published, sortBy, sortOrder } = query as {
            page: number;
            limit: number;
            search?: string;
            published?: boolean;
            sortBy: 'createdAt' | 'updatedAt' | 'title';
            sortOrder: 'asc' | 'desc';
        };
        const skip = (page - 1) * limit;

        // 构建查询条件
        const where = {} as any;

        if (published !== undefined) {
            where.published = published;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
            ];
        }

        // 构建排序条件
        const orderBy = {
            [sortBy]: sortOrder,
        } as any;

        try {
            // TODO: 查询条件加回去,需要处理下异常
            // {
            //     where,
            //     skip,
            //     take: limit,
            //     orderBy,
            // }
            // console.log(`Fetching posts: page=${page}, limit=${limit}, search=${search}, published=${published}, sortBy=${sortBy}, sortOrder=${sortOrder}`);
            const [posts, total] = await Promise.all([
                this.prisma.posts.findMany(),
                this.prisma.posts.count(),
            ]);
            // { where }
            return {
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                },
            };
        } catch (error) {
            this.logger.error('Failed to fetch posts', error);
            throw error;
        }
    }

    async findPostById(id: number): Promise<Post> {
        const post = await this.prisma.posts.findUnique({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException(`ID为 ${id} 的文章不存在`);
        }

        return post;
    }

    async findPostBySlug(slug: string): Promise<Post> {
        const post = await this.prisma.posts.findUnique({
            where: { slug },
        });

        if (!post) {
            throw new NotFoundException(`Slug为 ${slug} 的文章不存在`);
        }

        return post;
    }

    async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
        try {
            this.logger.log(`Updating post with ID: ${id}`);

            return await this.prisma.posts.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`ID为 ${id} 的文章不存在`);
                }
                if (error.code === 'P2002') {
                    throw new ConflictException('该 slug 已存在，请使用其他 slug');
                }
            }
            this.logger.error('Failed to update post', error);
            throw error;
        }
    }

    async deletePost(id: number): Promise<void> {
        try {
            await this.prisma.posts.delete({
                where: { id },
            });
            this.logger.log(`Post with ID ${id} deleted successfully`);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`ID为 ${id} 的文章不存在`);
                }
            }
            this.logger.error('Failed to delete post', error);
            throw error;
        }
    }

    async publishPost(id: number): Promise<Post> {
        return this.updatePost(id, { published: true });
    }

    async unpublishPost(id: number): Promise<Post> {
        return this.updatePost(id, { published: false });
    }

    async getPostStats() {
        try {
            const [total, published, unpublished] = await Promise.all([
                this.prisma.posts.count(),
                this.prisma.posts.count({ where: { published: true } }),
                this.prisma.posts.count({ where: { published: false } }),
            ]);

            const recentPosts = await this.prisma.posts.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    published: true,
                    createdAt: true,
                },
            });

            return {
                stats: {
                    total,
                    published,
                    unpublished,
                },
                recentPosts,
            };
        } catch (error) {
            this.logger.error('Failed to get post stats', error);
            throw error;
        }
    }
}