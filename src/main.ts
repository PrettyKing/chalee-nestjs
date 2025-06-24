import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // 设置 Swagger (仅在非生产环境)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Chalee NestJS API')
      .setDescription('Chalee NestJS API documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // 启用 CORS
  app.enableCors();

  // Lambda 环境检查
  if (process.env.NODE_ENV === 'production') {
    // 生产环境下，初始化应用但不启动监听
    await app.init();
    console.log('Application initialized for Lambda');
    return app;
  } else {
    // 本地开发环境
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
    return app;
  }
}

// 导出 bootstrap 函数供 Lambda 使用
export { bootstrap };

// 如果不是 Lambda 环境，直接启动应用
if (require.main === module) {
  bootstrap();
}