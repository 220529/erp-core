# ERP Core 服务管理指南

## 🚀 快速启动

### 方式一：使用管理脚本（推荐）

```powershell
# 启动开发服务器（自动清理端口）
.\scripts\start.ps1

# 启动生产服务器
.\scripts\start.ps1 -Mode prod

# 指定端口
.\scripts\start.ps1 -Port 3009

# 重启服务
.\scripts\restart.ps1
```

### 方式二：手动启动

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run start:prod

# 调试模式
pnpm run start:debug
```

---

## 🛑 停止服务

### 方式一：快捷键

如果服务在前台运行，直接按 **`Ctrl + C`** 停止

### 方式二：使用脚本

```powershell
# 关闭占用 3009 端口的进程
.\scripts\kill-port.ps1

# 关闭占用其他端口的进程
.\scripts\kill-port.ps1 -Port 3000
```

### 方式三：手动关闭

```powershell
# 1. 查找占用端口的进程
netstat -ano | findstr :3009

# 2. 关闭进程（PID 是上一步查到的数字）
taskkill /F /PID <PID>
```

---

## ⚠️ 常见问题

### 1. 端口被占用（EADDRINUSE）

**现象：**
```
Error: listen EADDRINUSE: address already in use :::3009
```

**原因：** 之前启动的服务还在运行

**解决方法：**
```powershell
# 方法1：使用脚本（推荐）
.\scripts\kill-port.ps1

# 方法2：使用启动脚本（自动清理）
.\scripts\start.ps1

# 方法3：手动查找并关闭
netstat -ano | findstr :3009
taskkill /F /PID <PID>
```

### 2. 修改代码后不生效

**开发模式（start:dev）：** 自动重启，等待几秒即可

**生产模式（start:prod）：** 需要手动重启
```powershell
# 重新构建
pnpm run build

# 重启服务
.\scripts\restart.ps1 -Mode prod
```

### 3. 如何查看服务是否在运行？

```powershell
# 查看端口占用情况
netstat -ano | findstr :3009

# 查看 Node.js 进程
tasklist | findstr node.exe
```

---

## 📝 启动模式说明

| 模式 | 命令 | 特点 | 适用场景 |
|------|------|------|---------|
| **开发模式** | `pnpm run start:dev` | 热重载、自动重启 | 本地开发 |
| **生产模式** | `pnpm run start:prod` | 性能优化、无热重载 | 生产环境 |
| **调试模式** | `pnpm run start:debug` | 支持断点调试 | 问题排查 |
| **构建** | `pnpm run build` | 仅编译，不运行 | 部署前 |

---

## 🔧 服务配置

### 端口配置

**方式1：修改 `.env` 文件**
```env
PORT=3009
```

**方式2：临时指定端口**
```bash
PORT=3010 pnpm run start:dev
```

### 环境配置

在 `.env` 文件中配置：
```env
# 服务端口
PORT=3009

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=erp_core

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## 💡 最佳实践

### 1. 开发时

- ✅ 使用 `.\scripts\start.ps1` 启动，自动清理端口
- ✅ 保持一个终端窗口运行服务，方便查看日志
- ✅ 修改代码后等待自动重启完成
- ✅ 下班前记得 `Ctrl + C` 停止服务

### 2. 生产环境

- ✅ 使用 PM2 或 Docker 管理服务
- ✅ 定期备份数据库
- ✅ 监控日志和性能指标
- ✅ 配置自动重启策略

### 3. 多人协作

- ✅ 统一使用相同的端口（如 3009）
- ✅ 使用脚本启动，避免端口冲突
- ✅ 提交代码前确保服务能正常启动
- ✅ 更新依赖后运行 `pnpm install`

---

## 📞 遇到问题？

1. **服务无法启动** → 检查数据库连接、端口占用
2. **修改不生效** → 确认是开发模式、等待重启完成
3. **端口冲突** → 使用 `.\scripts\kill-port.ps1` 清理
4. **依赖报错** → 删除 `node_modules` 重新安装

**查看详细日志：**
```bash
# 开发模式会自动显示日志
pnpm run start:dev

# 生产模式查看日志（如果使用 PM2）
pm2 logs erp-core
```

