import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GetReposDto } from '../dto/github-repos.dto';
import { GitHubRepo, GitHubApiResponse } from '../interfaces/github.interface';

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly baseUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getUserRepos(params: GetReposDto): Promise<GitHubApiResponse> {
    try {
      const { username, per_page, page, sort, direction } = params;
      
      // 构建请求URL
      const url = `${this.baseUrl}/users/${username}/repos`;
      
      // 设置请求头
      const headers: any = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NestJS-GitHub-Client',
      };

      // 如果配置了GitHub Token，添加到请求头（可选，用于提高API限制）
      const githubToken = this.configService.get<string>('GITHUB_TOKEN');
      if (githubToken) {
        headers.Authorization = `token ${githubToken}`;
      }

      // 发起请求
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers,
          params: {
            per_page,
            page,
            sort,
            direction,
          },
        }),
      );

      const repos: GitHubRepo[] = response.data;
      
      // 处理分页信息
      const linkHeader = response.headers.link;
      const hasNext = linkHeader && linkHeader.includes('rel="next"');
      const hasPrev = linkHeader && linkHeader.includes('rel="prev"');

      return {
        repos: repos.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          ssh_url: repo.ssh_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          open_issues_count: repo.open_issues_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          private: repo.private,
          fork: repo.fork,
        })),
        total_count: repos.length,
        page,
        per_page,
        has_next: hasNext,
        has_prev: hasPrev,
      } as GitHubApiResponse;

    } catch (error) {
      this.logger.error(`获取GitHub仓库失败: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new HttpException(
          `用户 ${params.username} 不存在`,
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (error.response?.status === 403) {
        throw new HttpException(
          'GitHub API请求限制已达上限',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        '获取GitHub仓库信息失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRepoDetails(username: string, repoName: string): Promise<GitHubRepo> {
    try {
      const url = `${this.baseUrl}/repos/${username}/${repoName}`;
      
      const headers: any = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NestJS-GitHub-Client',
      };

      const githubToken = this.configService.get<string>('GITHUB_TOKEN');
      if (githubToken) {
        headers.Authorization = `token ${githubToken}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      return response.data;

    } catch (error) {
      this.logger.error(`获取仓库详情失败: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new HttpException(
          `仓库 ${username}/${repoName} 不存在`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        '获取仓库详情失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}