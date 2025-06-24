import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
// controller imports
import { AppController } from './controllers/app.controller';
import { GitHubController } from './controllers/github.controller';
import { PostController } from './controllers/post.controller';
// service imports
import { AppService } from './services/app.service';
import { GitHubService } from './services/github.service';
import { PostService } from './services/post.service';
import { PrismaService } from './services/prisma.service'; // Assuming you have a PrismaService for database operations

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [AppController, GitHubController, PostController],
  providers: [AppService, GitHubService, PostService, PrismaService],
  exports: [AppService, GitHubService, PostService, PrismaService],
})
export class AppModule { }
