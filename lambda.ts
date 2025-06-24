import { configure as serverlessExpress } from '@vendia/serverless-express';
import { bootstrap } from './src/main';

let cachedServer: any;

export const handler = async (event: any, context: any) => {
    if (!cachedServer) {
        // 初始化 NestJS 应用
        const nestApp = await bootstrap();

        // 获取底层的 Express 实例
        const expressApp = nestApp.getHttpAdapter().getInstance();

        // 配置 serverless-express
        cachedServer = serverlessExpress({
            app: expressApp,
            logSettings: {
                level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
            }
        });
    }

    return cachedServer(event, context);
};