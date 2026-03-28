# CoolDrivePro 网站项目交接文档

> 本文档供 OpenClaw（或任何 AI 编码工具）接手 cooldrivepro.com 网站的维护和更新工作。

---

## 1. 项目概览

| 项目 | 信息 |
|------|------|
| 网站名称 | CoolDrive Pro — Parking Air Conditioner |
| 线上域名 | cooldrivepro.com（当前指向 Manus，待切换到 Railway） |
| Railway 临时域名 | web-production-35c29.up.railway.app |
| GitHub 仓库 | https://github.com/vethymch-spec/parking-ac-website |
| 技术栈 | React 19 + Tailwind 4 + Express 4 + tRPC 11 + Drizzle ORM + MySQL |
| Node 版本 | 22（package.json engines 已指定） |
| 包管理器 | pnpm |
| Railway 项目 | cooldrivepro-website |
| Railway API Token | 6940b835-d382-452b-bfc4-40117a630d16 |

---

## 2. 项目文件结构

```
parking-ac-website/
├── client/                          # 前端（React + Vite）
│   ├── public/
│   │   ├── data/blog/               # 88 篇博客文章 JSON 文件
│   │   │   ├── list.json            # 博客列表索引（所有文章元数据）
│   │   │   └── *.json               # 单篇文章内容
│   │   ├── data/products/           # 产品数据
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── pages/                   # 页面组件（每个路由一个文件）
│   │   │   ├── Home.tsx             # 首页
│   │   │   ├── AboutUs.tsx          # 关于我们
│   │   │   ├── ContactUs.tsx        # 联系我们
│   │   │   ├── Products.tsx         # 产品列表
│   │   │   ├── ProductTopMounted.tsx    # 顶置空调产品页
│   │   │   ├── ProductMiniSplit.tsx     # 分体空调产品页
│   │   │   ├── ProductHeatingCooling.tsx # 冷暖空调产品页
│   │   │   ├── BlogList.tsx         # 博客列表
│   │   │   ├── BlogPost.tsx         # 博客文章详情
│   │   │   ├── Forum.tsx            # 论坛首页
│   │   │   ├── ForumPost.tsx        # 论坛帖子
│   │   │   ├── ForumNewPost.tsx     # 发新帖
│   │   │   ├── Support.tsx          # 客户支持首页
│   │   │   ├── SupportTicket.tsx    # 提交工单
│   │   │   ├── CustomerLogin.tsx    # 客户登录
│   │   │   ├── CustomerPortal.tsx   # 客户门户
│   │   │   ├── AdminLogin.tsx       # 管理员登录
│   │   │   ├── AdminTickets.tsx     # 管理工单
│   │   │   └── AdminCustomers.tsx   # 管理客户
│   │   ├── components/              # 可复用组件
│   │   │   ├── ui/                  # shadcn/ui 组件库
│   │   │   ├── FAQSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── BlogSection.tsx
│   │   │   └── ...
│   │   ├── App.tsx                  # 路由定义
│   │   ├── main.tsx                 # 入口
│   │   └── index.css                # 全局样式（Tailwind 主题）
│   └── index.html
├── server/                          # 后端（Express + tRPC）
│   ├── _core/                       # 框架层（勿修改）
│   │   ├── index.ts                 # Express 入口 + SSR 路由 + db-init 端点
│   │   ├── env.ts                   # 环境变量定义
│   │   ├── trpc.ts                  # tRPC 初始化
│   │   ├── context.ts               # tRPC 上下文
│   │   ├── oauth.ts                 # Manus OAuth（待替换）
│   │   ├── llm.ts                   # LLM 调用助手（待替换）
│   │   ├── notification.ts          # 通知 API（待替换）
│   │   └── vite.ts                  # Vite SSR 桥接
│   ├── routers/                     # tRPC 子路由
│   │   ├── forum.ts                 # 论坛 CRUD
│   │   ├── ticket.ts                # 工单 CRUD
│   │   ├── customer.ts              # 客户管理
│   │   └── adminAuth.ts             # 管理员认证
│   ├── routers.ts                   # tRPC 主路由（汇总所有子路由）
│   ├── db.ts                        # 数据库查询助手
│   ├── forum.db.ts                  # 论坛数据库操作
│   ├── customer.db.ts               # 客户数据库操作
│   ├── ticket.db.ts                 # 工单数据库操作
│   ├── email.ts                     # Resend 邮件发送
│   ├── pageSSR.ts                   # 首页/About/Contact SSR 内容
│   ├── productSSR.ts                # 产品页 SSR 内容
│   ├── blogSSR.ts                   # 博客 SSR 内容
│   └── storage.ts                   # S3 存储助手
├── drizzle/                         # 数据库 Schema 和迁移
│   ├── schema.ts                    # 表定义（11 张表）
│   └── 0000-0005*.sql               # 迁移 SQL
├── railway-deploy/                  # Railway 部署相关
│   ├── seed-data.sql                # 种子数据（论坛分类）
│   └── env-setup.md                 # 环境变量配置说明
├── railway.json                     # Railway 部署配置
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 3. 数据库结构（11 张表）

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `users` | 论坛用户（Manus OAuth） | openId, name, email, role(admin/user) |
| `forum_categories` | 论坛分类（6个） | name, slug, description |
| `forum_posts` | 论坛帖子 | title, content, authorId, categoryId |
| `forum_replies` | 论坛回复 | postId, authorId, content |
| `post_likes` | 帖子点赞 | postId, userId |
| `reply_likes` | 回复点赞 | replyId, userId |
| `customers` | 售后客户（邮箱+密码登录） | customerNo, email, passwordHash, status |
| `customer_logs` | 客户操作审计日志 | customerId, action, description |
| `tickets` | 支持工单 | customerId, subject, status, priority |
| `ticket_messages` | 工单消息 | ticketId, senderType, content |
| `ticket_attachments` | 工单附件 | messageId, fileUrl, fileName |

---

## 4. 前端路由表

| 路由 | 页面组件 | 说明 |
|------|---------|------|
| `/` | Home.tsx | 首页（有 SSR） |
| `/about` | AboutUs.tsx | 关于我们（有 SSR） |
| `/contact` | ContactUs.tsx | 联系我们（有 SSR） |
| `/products` | Products.tsx | 产品列表 |
| `/products/top-mounted-ac` | ProductTopMounted.tsx | 顶置空调（有 SSR） |
| `/products/mini-split-ac` | ProductMiniSplit.tsx | 分体空调（有 SSR） |
| `/products/heating-cooling-ac` | ProductHeatingCooling.tsx | 冷暖空调（有 SSR） |
| `/blog` | BlogList.tsx | 博客列表（有 SSR） |
| `/blog/:slug` | BlogPost.tsx | 博客文章（有 SSR） |
| `/forum` | Forum.tsx | 论坛 |
| `/forum/new-post` | ForumNewPost.tsx | 发帖 |
| `/forum/post/:slug` | ForumPost.tsx | 帖子详情 |
| `/support` | Support.tsx | 客户支持 |
| `/support/login` | CustomerLogin.tsx | 客户登录（邮箱+密码） |
| `/support/portal` | CustomerPortal.tsx | 客户门户 |
| `/support/submit` | SupportTicket.tsx | 提交工单 |
| `/admin/login` | AdminLogin.tsx | 管理员登录 |
| `/admin/tickets` | AdminTickets.tsx | 管理工单 |
| `/admin/customers` | AdminCustomers.tsx | 管理客户 |
| `/warranty` | PolicyPage.tsx | 保修政策 |
| `/return-policy` | PolicyPage.tsx | 退货政策 |
| `/shipping-policy` | PolicyPage.tsx | 物流政策 |
| `/privacy-policy` | PolicyPage.tsx | 隐私政策 |

---

## 5. Railway 环境变量

以下环境变量已在 Railway 的 Web 服务中配置：

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `DATABASE_URL` | MySQL 连接字符串 | Railway MySQL 自动注入 |
| `JWT_SECRET` | JWT 签名密钥 | 手动设置（已配置） |
| `RESEND_API_KEY` | Resend 邮件 API Key | 手动设置（re_bGv4vMvL_FCbn4ws4fYVsDNCEU4LoPw8B） |
| `OAUTH_SERVER_URL` | Manus OAuth 地址 | 设为 `https://placeholder.invalid`（待替换） |
| `NIXPACKS_NODE_VERSION` | Node.js 版本 | 设为 `22` |
| `NODE_ENV` | 运行环境 | 设为 `production` |

**以下 Manus 专有变量在 Railway 上不存在（功能受限）：**

| 变量名 | 影响 | 替代方案 |
|--------|------|---------|
| `VITE_APP_ID` | Manus OAuth 登录不可用 | 替换为 Clerk / Auth.js |
| `VITE_OAUTH_PORTAL_URL` | 同上 | 同上 |
| `OWNER_OPEN_ID` / `OWNER_NAME` | 管理员识别 | 用数据库 role 字段代替 |
| `BUILT_IN_FORGE_API_URL/KEY` | LLM / 图片生成不可用 | 直连 OpenAI API |
| `VITE_FRONTEND_FORGE_API_URL/KEY` | 前端 AI 功能不可用 | 同上 |

---

## 6. 常见操作指南

### 6.1 新增博客文章

博客是纯 JSON 文件，不需要数据库操作。

**步骤：**

1. 在 `client/public/data/blog/` 目录创建新 JSON 文件，文件名即 slug：
```json
{
  "title": "文章标题",
  "slug": "article-slug",
  "excerpt": "文章摘要（150字以内）",
  "content": "文章正文（Markdown 格式，2500字以上）",
  "image": "https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/图片名.webp",
  "category": "分类",
  "tags": ["tag1", "tag2"],
  "author": "CoolDrive Pro Team",
  "date": "2026-03-23",
  "readTime": "10 min read"
}
```

2. 更新 `client/public/data/blog/list.json`，在数组开头添加新文章的元数据：
```json
{
  "slug": "article-slug",
  "title": "文章标题",
  "excerpt": "文章摘要",
  "image": "缩略图URL",
  "category": "分类",
  "date": "2026-03-23",
  "readTime": "10 min read"
}
```

3. `git push` 到 GitHub，Railway 自动部署（2-3 分钟）。

**博客图片 CDN：** 所有博客图片托管在 GitHub 仓库 `vethymch-spec/cooldrivepro-cdn`，通过 jsDelivr CDN 访问：
```
https://cdn.jsdelivr.net/gh/vethymch-spec/cooldrivepro-cdn@main/文件名.webp
```
新增图片时，先上传到 `cooldrivepro-cdn` 仓库，再用上述 URL 格式引用。

### 6.2 修改页面内容

前端页面在 `client/src/pages/` 目录，使用 React + Tailwind CSS。修改后 push 到 GitHub 即可。

### 6.3 修改 SSR 内容（SEO 相关）

搜索引擎爬虫看到的内容由 SSR 文件控制：

| 页面 | SSR 文件 |
|------|---------|
| 首页、About、Contact | `server/pageSSR.ts` |
| 产品页 | `server/productSSR.ts` |
| 博客页 | `server/blogSSR.ts` |

修改这些文件中的 HTML 模板即可更新爬虫看到的内容。

### 6.4 数据库操作

Railway MySQL 连接信息在 Railway 控制台 → MySQL 服务 → Connect 标签页。

可以用以下工具连接：
- **DBeaver**（免费桌面客户端）
- **TablePlus**（Mac 推荐）
- **命令行 mysql**

### 6.5 修改环境变量

Railway 控制台 → Web 服务 → Variables 面板，直接修改后 Railway 自动重启。

### 6.6 查看部署日志

Railway 控制台 → Web 服务 → Deployments 标签页，点击具体部署查看构建和运行日志。

---

## 7. 已知问题和待办事项

### 7.1 需要修复的问题

| 优先级 | 问题 | 说明 |
|--------|------|------|
| 高 | Manus OAuth 登录不可用 | 论坛登录、管理员登录依赖 Manus OAuth，需替换为 Clerk 或自建登录 |
| 高 | `/api/db-init` 端点需删除 | 这是临时的数据库初始化端点，有安全风险，生产环境必须移除 |
| 中 | `/products/under-bunk-ac` 返回 404 | 缺少该产品页组件 |
| 中 | `/products/rooftop-ac` 返回 404 | 缺少该产品页组件 |
| 低 | LLM / 图片生成功能不可用 | 依赖 Manus Forge API，需替换为直连 OpenAI |

### 7.2 待完成的迁移步骤

1. **替换 Manus OAuth** — 推荐 Clerk（免费 10,000 MAU），需修改 `server/_core/oauth.ts` 和前端登录流程
2. **删除 `/api/db-init` 端点** — 从 `server/_core/index.ts` 中移除第 48-100 行左右的 db-init 路由
3. **绑定域名** — Railway Settings → Domains → Add `cooldrivepro.com`，修改 DNS A 记录
4. **替换 LLM 调用**（可选） — 修改 `server/_core/llm.ts`，改为直连 OpenAI API

---

## 8. 开发命令

```bash
# 克隆项目
git clone https://github.com/vethymch-spec/parking-ac-website
cd parking-ac-website

# 安装依赖
pnpm install

# 本地开发（需要 .env 文件，见下方）
pnpm dev

# 构建
pnpm build

# 启动生产服务
pnpm start

# 运行测试
pnpm test

# 生成数据库迁移
pnpm drizzle-kit generate
```

**本地开发 .env 文件模板：**
```env
DATABASE_URL=mysql://root:密码@主机:端口/railway
JWT_SECRET=你的JWT密钥
RESEND_API_KEY=re_bGv4vMvL_FCbn4ws4fYVsDNCEU4LoPw8B
OAUTH_SERVER_URL=https://placeholder.invalid
VITE_APP_ID=placeholder
VITE_OAUTH_PORTAL_URL=https://placeholder.invalid
```

---

## 9. 给 OpenClaw 的提示词模板

当你在 OpenClaw 中开始新对话时，可以发送以下内容让它快速了解项目：

```
我有一个 Node.js 全栈网站项目（CoolDrive Pro 驻车空调），代码在 GitHub：
https://github.com/vethymch-spec/parking-ac-website

技术栈：React 19 + Tailwind 4 + Express 4 + tRPC 11 + Drizzle ORM + MySQL
部署平台：Railway（自动从 GitHub main 分支部署）
Railway 临时域名：web-production-35c29.up.railway.app

项目根目录有一个 OPENCLAW_HANDOVER.md 文件，请先阅读它了解完整的项目架构、
文件结构、数据库表、路由、环境变量和常见操作指南。

我需要你帮我 [具体任务描述]。
修改完成后请 git push 到 GitHub main 分支，Railway 会自动部署。
```

---

## 10. 重要提醒

1. **每次修改后必须 `git push origin main`**，Railway 才会自动部署
2. **不要修改 `server/_core/` 目录下的文件**（除非替换 OAuth 或 LLM），这是框架层
3. **博客图片必须用 jsDelivr CDN URL**，不要把图片文件放在项目目录里（会导致部署超时）
4. **数据库 Schema 修改流程**：修改 `drizzle/schema.ts` → 运行 `pnpm drizzle-kit generate` → 在 Railway MySQL 中执行生成的 SQL
5. **Railway API Token** 用于通过 GraphQL API 自动化操作 Railway（创建服务、设置变量、触发部署等），文档见 https://docs.railway.com/reference/public-api
