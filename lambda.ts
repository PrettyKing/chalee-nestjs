import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Server } from 'http';
import * as express from 'express';
import * as awsServerlessExpress from 'aws-serverless-express';
import { AppModule } from './src/app.module';

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    nestApp.enableCors({
    origin: true, // 或指定具体域名 ['https://yourdomain.com']
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
    
    await nestApp.init();
    cachedServer = awsServerlessExpress.createServer(expressApp);
  }
  return cachedServer;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const server = await bootstrap();
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};