# ============================================
# 依赖阶段 - 准备 node_modules
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# 安装 pnpm (使用 corepack 更高效)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 配置国内镜像源
RUN pnpm config set registry https://registry.npmmirror.com

# 只复制依赖定义文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN pnpm install --frozen-lockfile

# ============================================
# 构建阶段 - 编译 TypeScript
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# 从依赖阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码和配置文件
COPY . .

# 构建应用
RUN npm run build

# ============================================
# 生产依赖阶段
# ============================================
FROM node:22-alpine AS prod-deps

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 配置国内镜像源
RUN pnpm config set registry https://registry.npmmirror.com

# 复制依赖定义文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# ============================================
# 生产运行阶段
# ============================================
FROM node:22-alpine

WORKDIR /app

# 设置 NODE_ENV
ENV NODE_ENV=production

# 从生产依赖阶段复制 node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

# 从构建阶段复制构建产物（包含编译后的 migrations）
COPY --from=builder /app/dist ./dist

# 复制必要的文件
COPY package.json ./
COPY scripts/run-migrations.js ./scripts/

# 复制迁移文件（编译后的 JS 已在 dist/migrations 中）

# 创建必要的目录
RUN mkdir -p /app/uploads /app/logs && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3009

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3009/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["sh", "-c", "node scripts/run-migrations.js && node dist/main.js"]
