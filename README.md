# erp-core - ERP 系统后端服务

NestJS 后端服务,提供 RESTful API。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start:dev

# 访问 API 文档
http://localhost:3009/api
```

### 生产部署

使用 GitHub Actions 自动部署,详见 [DEPLOY.md](./DEPLOY.md)

---

## 📝 环境变量

- `.env` - 本地开发环境
- `.env.prod` - 生产环境 (模板)

---

## 🔧 技术栈

- **框架**: NestJS
- **数据库**: MySQL + TypeORM
- **缓存**: Redis
- **认证**: JWT
- **文档**: Swagger

---

## 📚 相关文档

- [部署指南](./DEPLOY.md)
- [API 文档](http://localhost:3009/api)
