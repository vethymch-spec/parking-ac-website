// AI Admin Chat - Cloudflare Worker
// 复制此代码到 Cloudflare Dashboard → Workers → Create Worker

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
  if (h.slice(7) !== env.ADMIN_AUTH_TOKEN) return errorResponse('Invalid token', 401);
  return null;
}

async function handleChat(r, env, log) {
  try {
    const body = await r.json();
    log.info('Chat request', { msg: body.message?.slice(0,50) });
    
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a web developer assistant. Help modify a React website. Be concise and actionable.' },
          { role: 'user', content: body.message }
        ],
        max_tokens: 2000
      })
    });
    
    if (!aiRes.ok) throw new Error(await aiRes.text());
    const aiData = await aiRes.json();
    
    return jsonResponse({ 
      id: crypto.randomUUID(), 
      message: aiData.choices[0].message.content, 
      actions: [],
      branch: `ai/${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log.error('Chat error', e);
    return errorResponse('Failed: ' + e.message, 500);
  }
}

async function handleGitHub(r, env, log) {
  const url = new URL(r.url);
  const github = {
    base: `https://api.github.com/repos/${env.GITHUB_OWNER || 'vethymch-spec'}/${env.GITHUB_REPO || 'parking-ac-website'}`,
    headers: { 'Authorization': `token ${env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'AI-Admin' }
  };
  
  try {
    if (url.pathname === '/api/github/branches' && r.method === 'GET') {
      const res = await fetch(`${github.base}/branches`, { headers: github.headers });
      return jsonResponse({ branches: await res.json() });
    }
    
    if (url.pathname === '/api/github/files' && r.method === 'GET') {
      const filePath = url.searchParams.get('path');
      const branch = url.searchParams.get('branch') || 'main';
      const res = await fetch(`${github.base}/contents/${filePath}?ref=${branch}`, { headers: github.headers });
      if (!res.ok) return errorResponse('File not found', 404);
      const data = await res.json();
      return jsonResponse({ path: filePath, content: data.content, sha: data.sha, branch });
    }
    
    return errorResponse('Not found', 404);
  } catch (e) {
    log.error('GitHub error', e);
    return errorResponse('GitHub API error: ' + e.message, 500);
  }
}

async function handleDeploy(r, env, log) {
  const body = await r.json().catch(() => ({}));
  return jsonResponse({ 
    status: 'ok', 
    message: 'Cloudflare Pages auto-deploys on git push',
    previewUrl: `https://${env.CF_PAGES_PROJECT || 'cooldrivepro'}.pages.dev`
  });
}

async function handleConfig(env) {
  return jsonResponse({ 
    github: { owner: env.GITHUB_OWNER || 'vethymch-spec', repo: env.GITHUB_REPO || 'parking-ac-website' }, 
    provider: env.DEFAULT_AI_PROVIDER || 'openai',
    pages: env.CF_PAGES_PROJECT || 'cooldrivepro'
  });
}

export default {
  async fetch(request, env, ctx) {
    const logger = new Logger();
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok', time: new Date().toISOString() });
    }
    
    const authError = await verifyAuth(request, env);
    if (authError) return authError;
    
    try {
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return handleChat(request, env, logger);
      }
      if (url.pathname.startsWith('/api/github')) {
        return handleGitHub(request, env, logger);
      }
      if (url.pathname.startsWith('/api/deploy')) {
        return handleDeploy(request, env, logger);
      }
      if (url.pathname === '/api/config') {
        return handleConfig(env);
      }
      return errorResponse('Not Found', 404);
    } catch (err) {
      logger.error('Handler error', err);
      return errorResponse('Internal Server Error: ' + err.message, 500);
    }
  }
};