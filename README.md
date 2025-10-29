# ERP Core - 企业级ERP系统核心框架

## 项目简介

基于 NestJS 的现代化企业ERP系统核心框架，采用"数据库驱动业务逻辑"架构：
- **动态业务流程**：业务逻辑代码存储在数据库中，支持热更新
- **核心框架层**：提供数据访问、认证授权、API接口等基础设施
- **高度灵活**：无需重启即可更新业务逻辑

## 技术栈

- **框架**: NestJS + TypeScript
- **数据库**: MySQL + TypeORM
- **缓存**: Redis (可选)
- **认证**: JWT + Passport
- **文档**: Swagger

## 核心实体（17张表）

| 表名 | 说明 |
|------|------|
| users | 系统用户 |
| companies | 公司信息 |
| departments | 部门信息 |
| roles | 角色管理 |
| menus | 菜单管理 |
| role_menus | 角色菜单关联 |
| customers | 客户信息 |
| customer_follows | 客户跟进记录 |
| materials | 物料库 |
| orders | 订单主表 |
| order_materials | 订单物料明细 |
| payments | 收款记录 |
| projects | 施工项目 |
| files | 文件管理 |
| dicts | 字典配置 |
| logs | 操作日志 |
| code_flows | 代码流程（核心）|

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动数据库（使用Docker）

```bash
cd E:\frame\db-app
docker-compose up -d
```

服务列表：
- MySQL: `localhost:3306` (root/root)
- Redis: `localhost:6379`
- phpMyAdmin: `http://localhost:8888`

### 3. 配置环境变量

创建 `.env` 文件：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=erp_core
DB_SYNCHRONIZE=true    # 生产环境设置为 false

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 4. 启动项目

```bash
# 开发环境
pnpm start:dev

# 生产环境
pnpm build
pnpm start:prod
```

### 5. 访问 API 文档

Swagger 文档: http://localhost:3000/api

## API 接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 代码流程
- `POST /api/code/execute/:flowCode` - 执行流程
- `GET /api/code/flows` - 列出流程
- `POST /api/code/flows` - 创建流程（管理员）
- `PUT /api/code/flows/:flowCode` - 更新流程（管理员）
- `DELETE /api/code/flows/:flowCode` - 禁用流程（管理员）

## 核心特性：数据库驱动业务逻辑

### 设计理念
- 业务逻辑存储在数据库
- VM沙箱安全执行
- 修改后立即生效，无需重启

### 示例：创建业务流程

```bash
POST /api/code/flows
Authorization: Bearer <admin-token>

{
  "code": "customer_create",
  "name": "客户创建",
  "category": "客户管理",
  "codeContent": "const { repositories, params, user } = context; const { customerRepository } = repositories; const customer = customerRepository.create({ ...params, salesId: user.id, status: 'lead' }); await customerRepository.save(customer); return { success: true, data: customer };"
}
```

### 执行业务流程

```bash
POST /api/code/execute/customer_create
Authorization: Bearer <token>

{
  "params": {
    "name": "张三",
    "mobile": "13800138000",
    "address": "北京市朝阳区"
  }
}
```

## 项目结构

```
src/
├── common/              # 公共模块（常量、DTO、拦截器等）
├── config/              # 配置模块
├── database/            # 数据库模块
├── entities/            # 实体定义
├── modules/
│   ├── auth/           # 认证授权
│   └── code/           # 代码流程执行器
├── app.module.ts
└── main.ts
```

## 认证和授权

### 使用JWT守卫

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('protected')
export class ProtectedController {
  // 需要认证
}
```

### 使用角色守卫

```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/constants';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
adminOnlyRoute() {
  // 仅管理员
}
```

## 常见问题

### 数据库连接失败
- 检查MySQL服务是否启动
- 确认配置是否正确

### 业务流程执行失败
- 检查代码语法
- 确认流程状态为启用（status=1）
- 查看日志获取详细错误

## 许可证

MIT
