
``` shell
# 获取用户仓库列表
GET /api/github/users/octocat/repos?per_page=10&page=1&sort=updated

# 获取特定仓库详情
GET /api/github/repos/octocat/Hello-World

```

``` shell
# 初始化命令
# 安装 Prisma
npm install prisma @prisma/client

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma db push

# 或者使用迁移文件
npx prisma migrate dev --name init
```


主要特性

完整的 CRUD 操作：
创建文章 (POST /api/posts)
获取文章列表 (GET /api/posts) - 支持分页、搜索、筛选
根据ID获取文章 (GET /api/posts/:id)
根据Slug获取文章 (GET /api/posts/slug/:slug)
更新文章 (PUT /api/posts/:id)
删除文章 (DELETE /api/posts/:id)

额外功能：

发布/取消发布文章
文章统计信息
全文搜索 (标题、内容、摘要)
多字段排序
分页支持

> change log by claude

### 1. 环境准备

```bash
# 安装 AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 安装 SAM CLI
pip install aws-sam-cli

# 配置 AWS 凭证
aws configure
```

### 2. 项目初始化

```bash
# 在你的 NestJS 项目根目录创建必要文件
touch template.yaml
touch samconfig.toml
touch .samignore

# 安装 Lambda 相关依赖
npm install @vendia/serverless-express
npm install -D @types/aws-lambda
```

### 3. 创建 S3 部署桶

```bash
# 创建 S3 桶用于存储部署包
aws s3 mb s3://your-sam-deployment-bucket --region us-east-1
```

### 4. 更新项目文件

将上面提供的配置文件内容复制到对应文件中：
- `template.yaml` - SAM 模板
- `samconfig.toml` - SAM 配置
- `src/lambda.ts` - Lambda 入口
- `.samignore` - 忽略文件

### 5. 构建和部署

```bash
# 构建 NestJS 应用
npm run build

# 复制 node_modules 到 dist（SAM 需要）
npm run build:sam

# 验证 SAM 模板
sam validate

# 构建 SAM 应用
sam build

# 部署到 AWS
sam deploy --guided  # 第一次部署使用 guided 模式

# 后续部署可以直接使用
sam deploy
```

### 6. 本地测试

```bash
# 启动本地数据库
docker-compose up -d

# 运行 Prisma 迁移
npx prisma db push

# 本地启动 SAM API
sam local start-api

# 测试 API
curl http://localhost:3000/api/posts
```

### 7. 查看日志

```bash
# 实时查看 Lambda 日志
sam logs -n NestJSFunction --stack-name nestjs-api-stack --tail

# 查看 CloudFormation 堆栈
aws cloudformation describe-stacks --stack-name nestjs-api-stack
```

### 8. 监控和调试

```bash
# 获取 API Gateway 端点
aws cloudformation describe-stacks \
  --stack-name nestjs-api-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`NestJSApiUrl`].OutputValue' \
  --output text

# 测试部署的 API
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/posts
```

### 9. 清理资源

```bash
# 删除堆栈
sam delete --stack-name nestjs-api-stack

# 清理 S3 桶
aws s3 rm s3://your-sam-deployment-bucket --recursive
aws s3 rb s3://your-sam-deployment-bucket
```

## 重要注意事项：

1. **数据库连接**：确保数据库可以从 Lambda 访问（如使用 RDS Proxy）
2. **环境变量**：敏感信息使用 AWS Systems Manager Parameter Store 或 Secrets Manager
3. **冷启动**：考虑使用 Provisioned Concurrency 减少冷启动时间
4. **权限**：确保 Lambda 有访问所需 AWS 服务的权限
5. **包大小**：优化 node_modules 大小，考虑使用 Lambda Layers
