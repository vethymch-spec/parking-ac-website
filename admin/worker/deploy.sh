#!/bin/bash
# Deploy AI Admin Chat Worker via Cloudflare API
# Usage: ./deploy.sh

ACCOUNT_ID="4f5262587982e4f825a8f56ca775edcf"
API_KEY="cfk_tidmp2s8tWsosNPOXo42Cn6qOiouRAxfex1nkaMU01a10eba"
EMAIL="vethymch@gmail.com"
WORKER_NAME="cooldrivepro-admin"

echo "🚀 Deploying AI Admin Chat Worker..."

# Create multipart form data for Worker upload
cd "$(dirname "$0")"

# Bundle the worker code
echo "📦 Bundling worker code..."

# Create the worker script (inline for simple deployment)
cat > /tmp/worker-temp.js <> 'WORKER_CODE'
// AI Admin Chat Worker - Simplified for API deployment
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

class Logger {
  constructor() { this.id = crypto.randomUUID().slice(0,8); }
  info(m, d) { console.log(JSON.stringify({l:'info',id:this.id,m,d,t:Date.now()})); }
  error(m, e) { console.error(JSON.stringify({l:'error',id:this.id,m,e:e?.message,t:Date.now()})); }
}

const jsonResponse = (d, s=200) => new Response(JSON.stringify(d), { 
  status: s, 
  headers: { 'Content-Type': 'application/json', ...corsHeaders } 
});

const errorResponse = (m, s=500) => jsonResponse({ error: m }, s);

async function verifyAuth(r, env) {
  const h = r.headers.get('Authorization');
  if (!h || !h.startsWith('Bearer ')) return errorResponse('Unauthorized', 401);
  const t = h.slice(7);
  if (t !== env.ADMIN_AUTH_TOKEN) return errorResponse('Invalid token', 401);
  return null;
}

async function handleChat(r, env, log) {
  try {
    const body = await r.json();
    log.info('Chat request', { msg: body.message?.slice(0,50) });
    
    // Simple AI call via OpenAI
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a web developer assistant. Help modify a React website.' },
          { role: 'user', content: body.message }
        ],
        max_tokens: 2000
      })
    });
    
    if (!aiRes.ok) throw new Error(`AI error: ${await aiRes.text()}`);
    const aiData = await aiRes.json();
    const reply = aiData.choices[0].message.content;
    
    return jsonResponse({ 
      id: crypto.randomUUID(), 
      message: reply, 
      actions: [{ type: 'explain', path: '', description: 'AI response' }],
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log.error('Chat error', e);
    return errorResponse('Failed to process chat', 500);
  }
}

async function handleGitHub(r, env, log) {
  const url = new URL(r.url);
  const path = url.pathname;
  const github = {
    base: `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
    headers: { 'Authorization': `token ${env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'AI-Admin' }
  };
  
  try {
    if (path === '/api/github/branches' && r.method === 'GET') {
      const res = await fetch(`${github.base}/branches`, { headers: github.headers });
      const data = await res.json();
      return jsonResponse({ branches: data });
    }
    
    if (path === '/api/github/files' && r.method === 'GET') {
      const filePath = url.searchParams.get('path');
      const res = await fetch(`${github.base}/contents/${filePath}?ref=main`, { headers: github.headers });
      const data = await res.json();
      const content = atob(data.content.replace(/\n/g, ''));
      return jsonResponse({ path: filePath, content, branch: 'main' });
    }
    
    return errorResponse('Not found', 404);
  } catch (e) {
    log.error('GitHub error', e);
    return errorResponse('GitHub API error', 500);
  }
}

async function handleDeploy(r, env, log) {
  return jsonResponse({ 
    status: 'ok', 
    message: 'Deployment triggered',
    previewUrl: `https://${env.CF_PAGES_PROJECT}.pages.dev` 
  });
}

export default {
  async fetch(request, env, ctx) {
    const logger = new Logger();
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (path === '/health') {
      return jsonResponse({ status: 'ok', time: new Date().toISOString() });
    }
    
    const authError = await verifyAuth(request, env);
    if (authError) return authError;
    
    try {
      if (path === '/api/chat' && request.method === 'POST') {
        return handleChat(request, env, logger);
      }
      if (path.startsWith('/api/github')) {
        return handleGitHub(request, env, logger);
      }
      if (path.startsWith('/api/deploy')) {
        return handleDeploy(request, env, logger);
      }
      if (path === '/api/config') {
        return jsonResponse({ github: { owner: env.GITHUB_OWNER, repo: env.GITHUB_REPO }, provider: env.DEFAULT_AI_PROVIDER || 'openai' });
      }
      return errorResponse('Not Found', 404);
    } catch (err) {
      logger.error('Handler error', err);
      return errorResponse('Internal Server Error', 500);
    }
  }
};
WORKER_CODE

# Upload to Cloudflare
echo "📤 Uploading to Cloudflare..."

RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${WORKER_NAME}" \
  -H "X-Auth-Email: ${EMAIL}" \
  -H "X-Auth-Key: ${API_KEY}" \
  -H "Content-Type: application/javascript" \
  --data-binary @/tmp/worker-temp.js)

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Worker deployed successfully!"
  echo ""
  echo "🌐 Worker URL: https://${WORKER_NAME}.4f5262587982e4f825a8f56ca775edcf.workers.dev"
  echo ""
  echo "⚠️  下一步: 设置 Secrets"
  echo "   1. 访问: https://dash.cloudflare.com/${ACCOUNT_ID}/workers/services/view/${WORKER_NAME}/production/settings"
  echo "   2. 添加以下环境变量:"
  echo "      - ADMIN_AUTH_TOKEN (你的强密码)"
  echo "      - GITHUB_TOKEN"
  echo "      - OPENAI_API_KEY"
  echo "      - GITHUB_OWNER=vethymch-spec"
  echo "      - GITHUB_REPO=parking-ac-website"
  echo "      - CF_PAGES_PROJECT=cooldrivepro"
else
  echo "❌ Deployment failed:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi

rm /tmp/worker-temp.js
