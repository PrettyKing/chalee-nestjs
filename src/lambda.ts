import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { configure as serverlessExpress } from '@vendia/serverless-express';

let cachedServer: any;

async function bootstrap() {
  try {
    console.log('Starting bootstrap process...');
    
    if (!cachedServer) {
      console.log('Creating new server instance...');
      
      // 确保Prisma客户端已初始化
      try {
        const { PrismaClient } = require('@prisma/client');
        console.log('Prisma client imported successfully');
      } catch (prismaError) {
        console.error('Prisma client import failed:', prismaError.message);
        throw new Error('Prisma client not available. Please run "prisma generate"');
      }
      
      const expressApp = express();
      console.log('Express app created');

      // 创建NestJS应用时禁用一些可能导致问题的功能
      const nestApp = await NestFactory.create(
        AppModule, 
        new ExpressAdapter(expressApp),
        {
          logger: false, // 先禁用日志，减少初始化开销
          abortOnError: false, // 不要因为小错误就中止
        }
      );
      console.log('NestJS app created');

      // 启用全局验证管道
      nestApp.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production', // 生产环境禁用详细错误
      }));
      console.log('Global pipes configured');

      // 启用CORS
      nestApp.enableCors({
        origin: true,
        credentials: true,
      });
      console.log('CORS enabled');

      // 跳过Swagger，避免初始化问题
      console.log('Skipping Swagger for Lambda optimization');

      await nestApp.init();
      console.log('NestJS app initialized');

      cachedServer = serverlessExpress({ app: expressApp });
      console.log('Serverless express configured');
    } else {
      console.log('Using cached server instance');
    }

    return cachedServer;
  } catch (error) {
    console.error('Bootstrap failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500) // 限制堆栈长度
    });
    throw error;
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    console.log('=== Lambda handler started ===');
    console.log('Request ID:', context.awsRequestId);
    console.log('HTTP Method:', event.httpMethod);
    console.log('Path:', event.path);
    console.log('Remaining time:', context.getRemainingTimeInMillis(), 'ms');

    // 关键设置：不等待事件循环清空
    context.callbackWaitsForEmptyEventLoop = false;

    // 检查是否有足够时间执行
    const remainingTime = context.getRemainingTimeInMillis();
    if (remainingTime < 3000) {
      throw new Error(`Insufficient time: ${remainingTime}ms remaining`);
    }

    console.log('Initializing server...');
    const server = await bootstrap();
    const bootstrapTime = Date.now() - startTime;
    console.log(`Server ready in ${bootstrapTime}ms`);
    
    console.log('Processing request...');
    const result = await server(event, context);
    
    const totalTime = Date.now() - startTime;
    console.log(`Request completed in ${totalTime}ms`);
    
    // 确保返回的是正确的格式
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from serverless express');
    }
    
    return result;
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('=== Handler Error ===');
    console.error(`Error after ${totalTime}ms:`, error.message);
    console.error('Error type:', error.constructor.name);
    
    // 返回标准的API Gateway响应格式
    const errorResponse: APIGatewayProxyResult = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        requestId: context.awsRequestId,
        timestamp: new Date().toISOString(),
      }),
    };
    
    console.log('Returning error response');
    return errorResponse;
  }
};