# erp-core GitHub Actions 部署指南

## 📋 前置准备

### 1. 创建阿里云容器镜像仓库

1. **登录阿里云控制台**
   ```
   https://cr.console.aliyun.com/
   ```

2. **创建命名空间** (如果还没有)
   - 进入 "容器镜像服务 ACR"
   - 点击 "命名空间" → "创建命名空间"
   - 命名空间名称: `erp` (或其他名称)
   - 地域: 选择与 ECS 相同的地域

3. **创建镜像仓库**
   - 点击 "镜像仓库" → "创建镜像仓库"
   - 仓库名称: `erp-core`
   - 仓库类型: 私有
   - 代码源: 本地仓库

4. **获取访问凭证**
   - 点击右上角头像 → "访问凭证"
   - 设置 Registry 登录密码
   - 记录:
     - Registry 地址: `registry.cn-beijing.aliyuncs.com` (根据地域不同)
     - 用户名: 您的阿里云账号
     - 密码: Registry 登录密码

---

## 🔐 配置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets:

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SSH_HOST` | 服务器 IP | `47.98.123.456` |
| `SSH_USERNAME` | SSH 用户名 | `root` |
| `SSH_PASSWORD` | SSH 密码 | `your_password` |
| `ACR_REGISTRY` | ACR 地址 | `registry.cn-beijing.aliyuncs.com` |
| `ACR_NAMESPACE` | ACR 命名空间 | `erp` |
| `ACR_USERNAME` | ACR 用户名 | `your_aliyun_account` |
| `ACR_PASSWORD` | ACR 密码 | `your_registry_password` |
| `DB_USER_PASSWORD` | 数据库 erp_user 密码 | `erp_password_123` |
| `REDIS_PASSWORD` | Redis 密码 | `Erp2024Redis@Prod#xxx` |
| `JWT_SECRET` | JWT 密钥 | `your-super-strong-secret-key` |

**说明**:
- `DB_HOST` 和 `REDIS_HOST` 不需要配置,直接使用容器名称
- `DB_USER_PASSWORD` 是 db-app 中创建的 `erp_user` 的密码

---

## 🚀 部署流程

### 1. 推送代码触发部署

```bash
cd e:\erp\erp-core

git add .
git commit -m "feat: add deployment workflow"
git push origin master
```

### 2. 查看部署进度

访问 GitHub Actions 页面:
```
https://github.com/your-username/erp-core/actions
```

### 3. 部署成功后验证

SSH 到服务器:

```bash
ssh root@your-server-ip

# 查看容器状态
cd /app/erp-core
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 测试 API
curl http://localhost:3009/api
```

---

## 🔍 验证清单

- [ ] 容器状态为 healthy
- [ ] 可以访问 API (http://服务器IP:3009/api)
- [ ] 数据库连接成功 (查看日志)
- [ ] Redis 连接成功 (查看日志)
- [ ] 文件上传功能正常
- [ ] 日志正常写入

---

## 🆘 故障排查

### 容器启动失败

```bash
# 查看详细日志
docker compose -f docker-compose.prod.yml logs

# 检查网络
docker network ls | grep erp-db-network

# 检查数据库连接
docker exec erp-core ping erp-mysql
```

### 无法连接数据库

```bash
# 确认 db-app 正在运行
cd /app/db-app
docker compose -f docker-compose.prod.yml ps

# 检查网络连接
docker network inspect erp-db-network
```

### 镜像拉取失败

```bash
# 手动登录 ACR
docker login registry.cn-beijing.aliyuncs.com

# 手动拉取镜像
docker pull registry.cn-beijing.aliyuncs.com/erp/erp-core:latest
```

---

## 📝 常用命令

```bash
# 查看容器状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f erp-core

# 重启容器
docker compose -f docker-compose.prod.yml restart

# 停止容器
docker compose -f docker-compose.prod.yml down

# 更新部署
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```
