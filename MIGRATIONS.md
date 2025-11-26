# TypeORM Migrations 使用指南

## 📝 什么是 Migrations?

Migrations (迁移) 是管理数据库表结构变更的版本控制系统,类似于 Git 管理代码。

---

## 🚀 快速开始

### 1. 生成初始迁移

```bash
# 基于现有实体生成迁移文件
pnpm migration:generate migrations/InitialSchema
```

### 2. 运行迁移

```bash
# 执行所有待运行的迁移
pnpm migration:run
```

### 3. 回滚迁移

```bash
# 回滚最后一次迁移
pnpm migration:revert
```

---

## 📋 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm migration:generate migrations/名称` | 自动生成迁移 (推荐) |
| `pnpm migration:create migrations/名称` | 手动创建空迁移 |
| `pnpm migration:run` | 执行迁移 |
| `pnpm migration:revert` | 回滚迁移 |

---

## 🔄 工作流程

### 开发阶段

```bash
# 1. 修改实体 (Entity)
# 2. 生成迁移
pnpm migration:generate migrations/AddUserEmail

# 3. 查看生成的迁移文件
# migrations/1234567890-AddUserEmail.ts

# 4. 运行迁移
pnpm migration:run
```

### 生产部署

```bash
# 部署时自动运行迁移
# 已配置在 Dockerfile 中
```

---

## ⚙️ 配置说明

### 环境变量

```env
# 开发环境 (.env)
DB_SYNCHRONIZE=true   # 快速开发

# 生产环境 (.env.prod)
DB_SYNCHRONIZE=false  # 使用 migrations
```

### 迁移文件位置

```
erp-core/
├── migrations/           ← 迁移文件目录
│   └── 1234567890-InitialSchema.ts
├── src/
│   └── database/
│       └── data-source.ts  ← 迁移配置
```

---

## 📝 迁移文件示例

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmail1234567890 implements MigrationInterface {
  // 执行迁移
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN email VARCHAR(255)
    `);
  }

  // 回滚迁移
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN email
    `);
  }
}
```

---

## 🎯 最佳实践

### 1. 命名规范

```bash
# 好的命名
pnpm migration:generate migrations/AddUserEmail
pnpm migration:generate migrations/CreateOrdersTable
pnpm migration:generate migrations/AddIndexToProducts

# 避免
pnpm migration:generate migrations/Update
pnpm migration:generate migrations/Fix
```

### 2. 迁移原则

- ✅ 每次迁移只做一件事
- ✅ 迁移文件不要手动修改 (除非必要)
- ✅ 测试迁移的 up 和 down
- ✅ 提交迁移文件到 Git

### 3. 团队协作

```bash
# 拉取代码后
git pull

# 运行新的迁移
pnpm migration:run

# 开始开发
```

---

## 🔧 故障排查

### 问题 1: 迁移失败

```bash
# 查看迁移状态
pnpm typeorm migration:show -d src/database/data-source.ts

# 手动回滚
pnpm migration:revert
```

### 问题 2: 迁移冲突

```bash
# 回滚到指定版本
pnpm migration:revert  # 多次执行

# 重新生成迁移
pnpm migration:generate migrations/NewMigration
```

---

## 📚 进阶用法

### 手动创建迁移

```bash
# 创建空迁移文件
pnpm migration:create migrations/CustomChanges

# 手动编写 SQL
```

### 数据迁移

```typescript
// 不仅可以修改表结构,还可以迁移数据
public async up(queryRunner: QueryRunner): Promise<void> {
  // 1. 添加新列
  await queryRunner.query(`ALTER TABLE users ADD COLUMN status VARCHAR(20)`);
  
  // 2. 迁移数据
  await queryRunner.query(`UPDATE users SET status = 'active' WHERE deleted_at IS NULL`);
}
```

---

## ✅ 检查清单

部署前确认:

- [ ] 所有迁移文件已提交到 Git
- [ ] 本地测试过 `migration:run`
- [ ] 测试过 `migration:revert`
- [ ] 生产环境 `DB_SYNCHRONIZE=false`
- [ ] Dockerfile 配置了自动运行迁移

---

## 🎓 总结

**开发阶段**:
- 使用 `DB_SYNCHRONIZE=true` 快速迭代
- 定期生成迁移文件

**生产环境**:
- 必须 `DB_SYNCHRONIZE=false`
- 只通过 migrations 修改表结构
- 部署时自动运行迁移

**这是企业级项目的标准做法!** ⭐
