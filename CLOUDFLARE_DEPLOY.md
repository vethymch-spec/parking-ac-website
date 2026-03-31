# Cloudflare Pages Deployment Guide

## 快速部署步骤

### 1. 登录 Cloudflare Dashboard
- 访问 https://dash.cloudflare.com
- 登录你的账户

### 2. 创建 Pages 项目
1. 点击左侧菜单 **Pages**
2. 点击 **Create a project**
3. 选择 **Upload assets**（直接上传）或 **Connect to Git**（GitHub集成）

### 3. 直接上传方式（推荐首次部署）

#### 选项 A: 使用 Wrangler CLI
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署（在项目根目录执行）
wrangler pages deploy dist/client --project-name=cooldrivepro
```

#### 选项 B: 使用 Cloudflare Dashboard 上传
1. 在 Pages 创建页面选择 **Upload assets**
2. 拖拽 `dist/client` 文件夹上传
3. 项目名设为 `cooldrivepro`

### 4. GitHub 自动部署（推荐长期维护）
1. 选择 **Connect to Git**
2. 授权 GitHub 账户
3. 选择仓库 `vethymch-spec/parking-ac-website`
4. 构建设置：
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist/client`
   - **Root directory**: `/`

### 5. 自定义域名
1. 部署完成后进入项目 **Custom domains**
2. 添加域名 `cooldrivepro.com`
3. 按提示配置 DNS 记录

## 构建设置

| 设置项 | 值 |
|--------|-----|
| Build command | `npm install && npm run build` |
| Build output directory | `dist/client` |
| Root directory | `/` |
| Node version | 20 |

## 环境变量（可选）

如需配置 API 端点等，在 **Environment variables** 添加：
- `NODE_VERSION`: `20`

## 注意事项

1. **SPA 路由**: 已配置 `_redirects` 文件支持前端路由
2. **缓存**: 已配置 `_headers` 文件优化静态资源缓存
3. **Functions**: 如需服务端功能，可创建 `functions/` 目录

## 验证部署

部署完成后访问：
- `https://cooldrivepro.pages.dev`（Cloudflare 默认域名）
- `https://cooldrivepro.com`（自定义域名）
