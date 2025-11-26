# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用 (包含 migrations)
RUN pnpm build

# 生产阶段
FROM node:22-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 复制 migration 运行脚本
COPY scripts/run-migrations.js ./scripts/

# 创建必要的目录
RUN mkdir -p /app/uploads /app/logs

# 暴露端口
EXPOSE 3009

# 健康检查 - 使用 /api/dict/type 端点
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3009/api/dict/type', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 401 ? 0 : 1)})"

# 启动命令 (先运行迁移，再启动应用)
CMD ["sh", "-c", "node scripts/run-migrations.js && node dist/main.js"]
