# ===============================
# 多階段構建 Dockerfile
# 階段 1：構建 React 應用
# 階段 2：使用 Caddy 服務靜態文件並代理 API
# ===============================

# 階段 1: 構建階段
FROM node:18-alpine as builder

# 設置工作目錄
WORKDIR /app

# 複製 package 文件
COPY package.json package-lock.json ./

# 安裝依賴 (使用 npm ci 確保一致性)
RUN npm ci --only=production

# 複製源代碼
COPY . .

# 構建應用
RUN npm run build

# ===============================
# 階段 2: 運行階段 (Caddy)
# ===============================
FROM caddy:2-alpine

# 安裝 curl 用於健康檢查
RUN apk add --no-cache curl

# 創建服務目錄
RUN mkdir -p /srv

# 從構建階段複製構建後的文件
COPY --from=builder /app/dist /srv

# 複製 Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# 創建 Caddy 用戶的數據目錄
RUN mkdir -p /data/caddy && \
    chown -R caddy:caddy /data/caddy && \
    chown -R caddy:caddy /srv

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 暴露端口
EXPOSE 80

# 設置用戶
USER caddy

# 啟動 Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]