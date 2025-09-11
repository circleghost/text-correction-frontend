# 部署說明 - Caddy 反向代理解決方案

## 🎯 解決的問題

原本的 HTTPS 前端無法直接調用 HTTP 後端 API，會出現 Mixed Content 錯誤。

## 🚀 解決方案架構

```
[瀏覽器] → [HTTPS 前端] → [Caddy 代理] → [HTTP 後端內網]
          texttt.zeabur.app     /api/*      backend.zeabur.internal:8080
```

## 📁 新增檔案

- **`Caddyfile`** - Caddy 配置檔，處理反向代理
- **`Dockerfile`** - 多階段構建，使用 Caddy 作為 web server
- **`.dockerignore`** - 優化 Docker 構建

## 🔧 修改檔案

- **`src/services/api.ts`** - 改用相對路徑 `/api/v1`
- **`vite.config.ts`** - 添加開發環境代理配置

## 🌐 部署步驟

### 1. Zeabur 部署
1. 推送代碼到 GitHub（已完成 ✅）
2. Zeabur 會自動檢測 Dockerfile 並重新構建
3. **不需要設定任何環境變數**

### 2. 清理舊的環境變數
可以移除之前設定的：
- ~~`VITE_API_BASE_URL`~~ (不再需要)

### 3. 後端環境變數保持不變
後端保持現有配置：
```
CORS_ORIGIN=https://texttt.zeabur.app
```

## ✅ 工作原理

1. **前端請求**: `https://texttt.zeabur.app/api/v1/text/correct`
2. **Caddy 攔截**: 偵測到 `/api/*` 路徑
3. **代理轉發**: 轉發到 `http://backend.zeabur.internal:8080/api/v1/text/correct`
4. **返回結果**: 後端回應透過 Caddy 返回給瀏覽器

## 🔍 優勢

- ✅ **無 Mixed Content 錯誤** - 全程 HTTPS
- ✅ **無 CORS 問題** - 同源請求
- ✅ **使用內網通信** - 更快、更安全
- ✅ **無需公開後端域名** - 安全性更高
- ✅ **開發環境相容** - Vite 代理自動處理

## 🧪 測試

部署完成後，可以在瀏覽器開發者工具檢查：
1. 網路請求都是 `https://texttt.zeabur.app/api/*`
2. 狀態碼應該是 200，不再有紅色錯誤
3. 可以正常看到 API 回應資料