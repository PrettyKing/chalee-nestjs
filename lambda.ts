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
    
    // Enable CORS if needed
    nestApp.enableCors({
      origin: true,
      credentials: true,
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