
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