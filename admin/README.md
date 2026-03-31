# AI Admin Chat for CoolDrivePro

🤖 **自然语言驱动的网站管理后台**

通过聊天界面输入自然语言需求，AI 自动修改代码、创建分支、部署预览、合并发布。

## ✨ 功能特性

- 💬 **自然语言交互** - 像聊天一样描述需求
- 🤖 **多 AI 支持** - OpenAI GPT-4 / Anthropic Claude / Kimi 切换
- 🌿 **自动分支管理** - 每个修改创建独立分支
- 🚀 **一键预览部署** - 自动生成 Cloudflare Pages Preview URL
- ✅ **安全合并流程** - 必须人工确认才合并到 main
- 🔒 **多层安全** - Token 认证 + Rate Limiting + Branch Protection

## 🏗️ 架构

```
Admin UI (React) 
    ↓ HTTP
Cloudflare Worker (API Gateway)
    ↓
├── Cloudflare AI Gateway → OpenAI/Anthropic/Kimi
├── GitHub API → Branch/Commit/PR
└── Cloudflare Pages API → Preview/Deploy
```

## 📁 文件结构

```
admin/
├── worker/                 # Cloudflare Worker (Backend)
│   ├── src/
│   │   ├── index.ts        # Worker 入口
│   │   ├── handlers/       # API 路由处理器
│   │   ├── services/       # AI/GitHub/Pages 服务
│   │   └── utils/          # 工具函数
│   ├── wrangler.toml       # Worker 配置
│   └── package.json
│
├── ui/                     # Admin UI 组件
│   ├── components/
│   │   └── AdminChat.tsx   # 主聊天组件
│   └── utils/
│       └── api.ts          # API 客户端
│
├── DEPLOY_GUIDE.md         # 完整部署指南
└── README.md              # 本文档
```

## 🚀 快速开始

### 1. 部署 Worker (5分钟)

```bash
cd admin/worker

# 登录 Cloudflare
npx wrangler login

# 部署 Worker
npx wrangler deploy

# 配置 Secrets
npx wrangler secret put ADMIN_AUTH_TOKEN
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put OPENAI_API_KEY
# ... 其他 secrets
```

### 2. 集成到现有项目

```tsx
// client/src/pages/Admin.tsx
import { AdminChat } from '../../admin/ui/components/AdminChat';

export default function Admin() {
  return (
    <AdminChat 
      apiEndpoint="https://admin-api.cooldrivepro.com"
      authToken="your-admin-token"
    />
  );
}
```

### 3. 配置路由

```tsx
// App.tsx
<Route path="/admin" element={<Admin />} />
```

## 💬 使用示例

### 修改网站内容
```
用户: 把首页标题改成 "CoolDrivePro - Best Parking AC for Trucks"
AI: ✅ 已创建分支 ai/1712345678-update-hero-title
   已修改 client/src/components/Hero.tsx
   Preview: https://ai-1712345678-update-hero.cooldrivepro.pages.dev
   
用户: [点击 Deploy Preview]
AI: 🚀 Preview 部署中...
   Preview URL: https://ai-1712345678-update-hero.cooldrivepro.pages.dev
   
用户: [确认无误，点击 Merge to Main]
AI: ✅ PR 已创建并合并
   生产环境将在 2 分钟内更新
```

### 添加新功能
```
用户: 添加一个 FAQ 部分，包含 5 个常见问题
AI: ✅ 已创建分支 ai/1712345679-add-faq-section
   已创建 client/src/components/FAQ.tsx
   已修改 client/src/pages/Home.tsx
   Preview: https://ai-1712345679-add-faq-secti.cooldrivepro.pages.dev
```

## 🔐 安全特性

| 层级 | 保护机制 |
|------|----------|
| 1 | Bearer Token 认证 |
| 2 | Rate Limiting (10 req/min) |
| 3 | GitHub Branch Protection |
| 4 | 禁止直接修改 main |
| 5 | 敏感文件保护 (.env, secrets) |

## 📚 文档

- [架构设计](./ADMIN_CHAT_ARCHITECTURE.md) - 完整架构说明
- [部署指南](./DEPLOY_GUIDE.md) - 逐步部署教程

## 🔧 配置

### 环境变量 (Secrets)

| 变量 | 必需 | 说明 |
|------|------|------|
| ADMIN_AUTH_TOKEN | ✅ | Admin UI 访问令牌 |
| GITHUB_TOKEN | ✅ | GitHub Personal Access Token |
| CF_ACCOUNT_ID | ✅ | Cloudflare Account ID |
| CF_API_TOKEN | ✅ | Cloudflare API Token |
| OPENAI_API_KEY | ✅ | OpenAI API Key |
| ANTHROPIC_API_KEY | ❌ | Anthropic API Key (可选) |
| KIMI_API_KEY | ❌ | Kimi API Key (可选) |
| AI_GATEWAY_ID | ❌ | Cloudflare AI Gateway ID (可选) |

### 可选配置

编辑 `worker/wrangler.toml`:

```toml
[vars]
DEFAULT_AI_PROVIDER = "openai"  # 默认 AI 提供商
GITHUB_OWNER = "vethymch-spec"   # GitHub 用户名
GITHUB_REPO = "parking-ac-website"  # 仓库名
```

## 🐛 调试

### 查看 Worker 日志
```bash
cd admin/worker
npx wrangler tail
```

### 测试 API
```bash
curl -X POST https://admin-api.cooldrivepro.com/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "provider": "openai"}'
```

## 🔄 更新

```bash
cd admin/worker
# 修改代码
npx wrangler deploy
```

## 📝 License

Private - For CoolDrivePro use only

---

Built with ❤️ using Cloudflare Workers, React, and AI
