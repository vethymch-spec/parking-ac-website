# AI Admin Chat - 架构设计与实现文档

## 📐 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin UI (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Chat Widget  │  │ Preview View │  │ Branch/PR Manager    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼────────────────────┼────────────────┘
          │                 │                    │
          └─────────────────┴────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Cloudflare    │
                    │    Worker      │
                    │  (API Gateway) │
                    └───────┬────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │Cloudflare   │ │   GitHub    │ │  Cloudflare │
    │AI Gateway   │ │    API      │ │   Pages API │
    │(OpenAI/    │ │             │ │             │
    │Anthropic/  │ │ • Create    │ │ • Preview   │
    │Kimi)       │ │   Branch    │ │ • Deploy    │
    └─────────────┘ │ • Commit    │ │ • Status    │
                    │ • PR        │ └─────────────┘
                    └─────────────┘
```

## 📁 目录结构

```
cooldrivepro-new/
├── admin/                          # 新增: Admin Chat 系统
│   ├── worker/                     # Cloudflare Worker
│   │   ├── src/
│   │   │   ├── index.ts           # Worker入口
│   │   │   ├── handlers/
│   │   │   │   ├── chat.ts        # AI对话处理
│   │   │   │   ├── github.ts      # GitHub操作
│   │   │   │   ├── deploy.ts      # 部署触发
│   │   │   │   └── auth.ts        # 权限验证
│   │   │   ├── services/
│   │   │   │   ├── ai-gateway.ts  # AI Gateway调用
│   │   │   │   ├── github-api.ts  # GitHub API封装
│   │   │   │   └── cf-pages.ts    # Cloudflare Pages API
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts      # 日志工具
│   │   │   │   ├── errors.ts      # 错误处理
│   │   │   │   └── validators.ts  # 输入验证
│   │   │   └── types/
│   │   │       └── index.ts       # TypeScript类型
│   │   ├── wrangler.toml          # Worker配置
│   │   └── package.json
│   │
│   └── ui/                         # Admin UI (嵌入现有项目)
│       ├── components/
│       │   ├── AdminChat.tsx      # 主聊天组件
│       │   ├── ChatMessage.tsx    # 消息气泡
│       │   ├── CodeDiff.tsx       # 代码对比
│       │   ├── BranchSelector.tsx # 分支选择
│       │   └── DeployPreview.tsx  # 预览部署状态
│       ├── hooks/
│       │   ├── useChat.ts         # 聊天逻辑
│       │   ├── useGitHub.ts       # GitHub操作
│       │   └── useDeploy.ts       # 部署状态
│       └── utils/
│           └── api.ts             # API调用
│
├── client/                        # 现有前端
└── server/                        # 现有后端
```

## 🔐 环境变量清单

### Cloudflare Worker Secrets (通过 Dashboard 设置)

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `ADMIN_AUTH_TOKEN` | Admin UI访问令牌 | 自定义强密码 |
| `GITHUB_TOKEN` | GitHub Personal Access Token | GitHub Settings → Developer settings → Personal access tokens |
| `GITHUB_OWNER` | GitHub仓库所有者 | 用户名/组织名 |
| `GITHUB_REPO` | GitHub仓库名 | 例如: parking-ac-website |
| `CF_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare Dashboard 右侧 |
| `CF_PAGES_PROJECT` | Cloudflare Pages项目名 | 例如: cooldrivepro |
| `CF_API_TOKEN` | Cloudflare API Token | My Profile → API Tokens → Create Token |
| `OPENAI_API_KEY` | OpenAI API Key | OpenAI Dashboard |
| `ANTHROPIC_API_KEY` | Anthropic API Key | Anthropic Console |
| `KIMI_API_KEY` | Moonshot API Key | Kimi开发者平台 |
| `AI_GATEWAY_ID` | Cloudflare AI Gateway ID | Cloudflare Dashboard → AI → AI Gateway |

### 可选环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DEFAULT_AI_PROVIDER` | `openai` | 默认AI提供商 |
| `MAX_TOKENS` | `4000` | AI最大token数 |
| `RATE_LIMIT_PER_MINUTE` | `10` | 每分钟请求限制 |

## 🔧 实施步骤

### Phase 1: 基础设施 (15分钟)

1. **创建 Cloudflare AI Gateway**
   - Dashboard → AI → AI Gateway → Create Gateway
   - 记录 Gateway ID

2. **创建 GitHub Token**
   - Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - 权限: Contents (read/write), Pull requests (read/write), Pages (read/write)

3. **创建 Cloudflare API Token**
   - My Profile → API Tokens → Create Token
   - 模板: "Cloudflare Pages Edit"
   - 权限: Zone:Read, Page Rules:Edit

### Phase 2: 部署 Worker (10分钟)

1. 复制 worker 代码到 `admin/worker/`
2. 配置 `wrangler.toml`
3. 运行 `wrangler deploy`
4. 设置 Secrets: `wrangler secret put ADMIN_AUTH_TOKEN`

### Phase 3: 集成 Admin UI (20分钟)

1. 复制 UI 组件到 `admin/ui/`
2. 在现有项目中添加路由 `/admin`
3. 配置 API endpoint 指向 Worker
4. 测试完整流程

### Phase 4: 安全加固 (10分钟)

1. 验证所有 Secrets 已设置
2. 测试权限控制
3. 配置 CORS
4. 启用日志监控

## 🛡️ 安全与权限

### 多层安全防护

```
┌─────────────────────────────────────┐
│  Layer 1: Admin Auth Token          │
│  (Bearer Token in Header)           │
├─────────────────────────────────────┤
│  Layer 2: IP Whitelist (optional)   │
│  (Cloudflare Access)                │
├─────────────────────────────────────┤
│  Layer 3: Rate Limiting             │
│  (10 req/min per IP)                │
├─────────────────────────────────────┤
│  Layer 4: GitHub Branch Protection  │
│  (禁止直接push main)                │
├─────────────────────────────────────┤
│  Layer 5: Preview Approval          │
│  (必须人工确认才合并)               │
└─────────────────────────────────────┘
```

### 回滚方案

| 场景 | 回滚操作 |
|------|----------|
| AI生成错误代码 | 删除分支，重新生成 |
| Preview部署失败 | 检查日志，修复后重试 |
| 误合并到main | GitHub revert PR |
| Worker故障 | wrangler rollback |
| Token泄露 | 立即轮换所有secrets |

## 📊 日志与监控

- Worker 日志: `wrangler tail`
- GitHub Actions 日志: GitHub → Actions
- Pages 部署日志: Cloudflare Dashboard
- 错误告警: 可配置 Webhook 到 Telegram/Email

## 💡 使用流程

```
1. 访问 https://cooldrivepro.com/admin
2. 输入 Auth Token 登录
3. 输入自然语言: "把首页标题改成 CoolDrivePro - Best Parking AC"
4. AI分析 → 生成代码 → 创建分支 `ai/update-hero-title`
5. 提交 commit → 触发 Preview 部署
6. 返回 Preview URL
7. 你检查 Preview，确认后点击 "Merge to Main"
8. 自动创建 PR 并合并
9. 生产环境自动更新
```

## ⚠️ 限制与注意事项

1. **AI限制**: 单次请求最大 token 4096
2. **文件限制**: 单次最多修改 10 个文件
3. **部署限制**: 每小时最多 5 次 preview 部署
4. **安全限制**: 禁止修改 `.env`, `wrangler.toml` 等敏感文件
5. **Git限制**: 必须通过 PR 合并，不能直接 push main
