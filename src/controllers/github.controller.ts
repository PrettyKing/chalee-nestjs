import { Controller, Get, Query, Param, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GitHubService } from '../services/github.service';
import { GetReposDto } from '../dto/github-repos.dto';
import { GitHubApiResponse, GitHubRepo } from '../interfaces/github.interface';

@ApiTags('GitHub')
@Controller('api/github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('users/:username/repos')
  @ApiOperation({ summary: '获取用户的GitHub仓库列表' })
  @ApiParam({ name: 'username', description: 'GitHub用户名' })
  @ApiQuery({ name: 'per_page', required: false, description: '每页数量 (1-100)', example: 30 })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'sort', required: false, description: '排序方式', enum: ['created', 'updated', 'pushed', 'full_name'] })
  @ApiQuery({ name: 'direction', required: false, description: '排序方向', enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: '成功获取仓库列表' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 429, description: 'API请求限制' })
  async getUserRepos(
    @Param('username') username: string,
    @Query(new ValidationPipe({ transform: true })) query: Omit<GetReposDto, 'username'>,
  ): Promise<GitHubApiResponse> {
    const params: GetReposDto = { username, ...query };
    return this.githubService.getUserRepos(params);
  }

  @Get('repos/:username/:repo')
  @ApiOperation({ summary: '获取指定仓库的详细信息' })
  @ApiParam({ name: 'username', description: 'GitHub用户名' })
  @ApiParam({ name: 'repo', description: '仓库名称' })
  @ApiResponse({ status: 200, description: '成功获取仓库详情' })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  async getRepoDetails(
    @Param('username') username: string,
    @Param('repo') repo: string,
  ): Promise<GitHubRepo> {
    return this.githubService.getRepoDetails(username, repo);
  }
}