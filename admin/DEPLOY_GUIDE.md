# AI Admin Chat - 部署指南

## 📋 前置准备

确保你拥有以下账号和权限：
- [ ] Cloudflare 账号 (有 Pages 和 Workers 权限)
- [ ] GitHub 账号 (有仓库访问权限)
- [ ] OpenAI / Anthropic / Kimi API Key

## 🚀 部署步骤

### Step 1: 配置 Cloudflare AI Gateway (2分钟)

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单 → **AI** → **AI Gateway**
3. 点击 **Create Gateway**
4. 名称填写: `cooldrivepro-ai`
5. 点击 **View** 进入 Gateway 详情
6. 复制 **Gateway ID** (格式如: `abc123def456`)

### Step 2: 获取 GitHub Token (3分钟)

1. 登录 GitHub → Settings (右上角头像)
2. 底部左侧 → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
3. 点击 **Generate new token**
4. 配置:
   - Token name: `CoolDrivePro Admin Chat`
   - Expiration: 90 days (或 No expiration)
   - Repository access: Select repositories → 选择 `parking-ac-website`
   - Permissions:
     - **Contents**: Read and write
     - **Pull requests**: Read and write
     - **Pages**: Read and write
5. 点击 **Generate token**
6. **立即复制 token** (只显示一次!)

### Step 3: 获取 Cloudflare API Token (2分钟)

1. Cloudflare Dashboard → 右上角头像 → **My Profile**
2. 左侧 → **API Tokens**
3. 点击 **Create Token**
4. 使用模板: **Cloudflare Pages Edit**
5. 配置:
   - Account Resources: Include → 你的账号
   - Zone Resources: Include → 选择你的域名 (cooldrivepro.com)
6. 点击 **Continue to summary** → **Create token**
7. **立即复制 token** (只显示一次!)

### Step 4: 生成 Admin Auth Token (1分钟)

生成一个强密码作为 Admin UI 的访问令牌:

```bash
# 在终端运行
openssl rand -base64 32
```

或者使用任意强密码生成器，生成 32-64 字符的随机字符串。

### Step 5: 部署 Cloudflare Worker (5分钟)

1. 进入 worker 目录:
```bash
cd cooldrivepro-new/admin/worker
```

2. 登录 Wrangler:
```bash
npx wrangler login
```

3. 创建 KV namespace (可选，用于 rate limiting):
```bash
npx wrangler kv:namespace create "RATE_LIMITER"
```

4. 部署 Worker:
```bash
npx wrangler deploy
```

5. 设置 Secrets (逐个执行，会提示输入值):
```bash
npx wrangler secret put ADMIN_AUTH_TOKEN
# 粘贴你生成的强密码

npx wrangler secret put GITHUB_TOKEN
# 粘贴 GitHub token

npx wrangler secret put CF_ACCOUNT_ID
# 粘贴 Account ID (从 Cloudflare Dashboard 右侧获取)

npx wrangler secret put CF_API_TOKEN
# 粘贴 Cloudflare API Token

npx wrangler secret put OPENAI_API_KEY
# 粘贴 OpenAI API Key

npx wrangler secret put ANTHROPIC_API_KEY
# 粘贴 Anthropic API Key (可选)

npx wrangler secret put KIMI_API_KEY
# 粘贴 Kimi API Key (可选)

npx wrangler secret put AI_GATEWAY_ID
# 粘贴 AI Gateway ID
```

6. 获取 Worker URL:
```bash
npx wrangler info
```
或者查看输出: `https://cooldrivepro-admin.<your-subdomain>.workers.dev`

### Step 6: 配置自定义域名 (3分钟)

1. Cloudflare Dashboard → **Workers & Pages**
2. 找到 `cooldrivepro-admin` → 点击
3. 点击 **Triggers** 标签
4. 点击 **Add Custom Domain**
5. 输入: `admin-api.cooldrivepro.com`
6. 点击 **Add Custom Domain**

### Step 7: 集成 Admin UI 到现有项目 (5分钟)

在现有项目中添加 Admin 路由:

1. 创建 admin 路由文件 `client/src/pages/Admin.tsx`:

```tsx
import { AdminChat } from '../../../admin/ui/components/AdminChat';

const ADMIN_API_ENDPOINT = 'https://admin-api.cooldrivepro.com';
// 或者使用 Worker 的默认域名

export default function AdminPage() {
  // 从环境变量或安全存储获取 token
  const [authToken, setAuthToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin token"
            className="w-full p-3 border rounded-lg mb-4"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
          />
          <button
            onClick={() => setIsAuthenticated(true)}
            className="w-full p-3 bg-blue-600 text-white rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <AdminChat apiEndpoint={ADMIN_API_ENDPOINT} authToken={authToken} />;
}
```

2. 添加路由到 `client/src/App.tsx`:

```tsx
import AdminPage from './pages/Admin';

// 在路由中添加
<Route path="/admin" element={<AdminPage />} />
```

3. 确保 Admin UI 组件可以被导入:

```bash
# 在 client 目录
npm install lucide-react  # 如果还没有安装
```

### Step 8: 配置 GitHub Branch Protection (2分钟)

1. GitHub 仓库 → Settings → Branches
2. 点击 **Add rule**
3. Branch name pattern: `main`
4. 启用:
   - ☑️ Require a pull request before merging
   - ☑️ Require approvals (1)
   - ☑️ Dismiss stale PR approvals when new commits are pushed
5. 点击 **Create**

### Step 9: 测试完整流程 (5分钟)

1. 访问 `https://cooldrivepro.com/admin`
2. 输入 Admin Auth Token
3. 发送测试消息: "What files are in the project?"
4. 发送修改请求: "Update the hero title to 'CoolDrivePro - Best Parking AC'"
5. 确认:
   - ✅ AI 响应
   - ✅ Branch 创建
   - ✅ Preview URL 生成
   - ✅ 可以 Merge 到 main

## 🔧 故障排除

### Worker 部署失败

```bash
# 检查 wrangler.toml 配置
npx wrangler config

# 查看日志
npx wrangler tail
```

### GitHub API 403

- 检查 GitHub Token 权限
- 检查 Token 是否过期
- 确认仓库访问权限已授予

### AI Gateway 错误

- 确认 AI Gateway ID 正确
- 检查 AI API Key 有效
- 查看 Cloudflare AI Gateway 日志

### CORS 错误

- 检查 Worker 中的 CORS headers
- 确认 Admin UI 域名在允许列表中

## 📊 监控与日志

### 查看 Worker 日志
```bash
npx wrangler tail
```

### 查看 GitHub API 使用情况
GitHub → Settings → Developer settings → Personal access tokens → 点击你的 token

### 查看 Cloudflare Pages 部署
Cloudflare Dashboard → Pages → cooldrivepro → Deployments

## 🔄 更新部署

### 更新 Worker 代码
```bash
cd admin/worker
# 修改代码
npx wrangler deploy
```

### 轮换 Secrets
```bash
npx wrangler secret put ADMIN_AUTH_TOKEN
# 输入新值
```

## 🛡️ 安全建议

1. **定期轮换 API Keys** (建议每 90 天)
2. **使用强密码** 作为 ADMIN_AUTH_TOKEN
3. **启用 IP 白名单** (可选，在 Cloudflare Access 中配置)
4. **监控异常活动** 通过 Cloudflare Analytics
5. **限制 GitHub Token** 权限到最小必要

## 📝 环境变量参考

| Secret | 用途 | 获取位置 |
|--------|------|----------|
| ADMIN_AUTH_TOKEN | Admin UI 访问控制 | 手动生成 |
| GITHUB_TOKEN | 操作 GitHub 仓库 | GitHub Settings |
| CF_ACCOUNT_ID | Cloudflare API | Dashboard 右侧 |
| CF_API_TOKEN | 操作 Pages/Worker | My Profile → API Tokens |
| OPENAI_API_KEY | AI 调用 | OpenAI Dashboard |
| ANTHROPIC_API_KEY | AI 调用 | Anthropic Console |
| KIMI_API_KEY | AI 调用 | Kimi 开发者平台 |
| AI_GATEWAY_ID | AI 路由 | Cloudflare AI Gateway |

---

部署完成后，你就拥有了一个完整的 AI-driven Admin Chat 系统！🎉
