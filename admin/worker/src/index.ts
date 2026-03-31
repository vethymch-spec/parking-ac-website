// Cloudflare Worker - AI Admin Chat API
// Entry point

import { handleChat } from './handlers/chat';
import { handleGitHub } from './handlers/github';
import { handleDeploy } from './handlers/deploy';
import { verifyAuth } from './handlers/auth';
import { Logger } from './utils/logger';
import { jsonResponse, errorResponse } from './utils/errors';

export interface Env {
  // Auth
  ADMIN_AUTH_TOKEN: string;
  
  // GitHub
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  
  // Cloudflare
  CF_ACCOUNT_ID: string;
  CF_PAGES_PROJECT: string;
  CF_API_TOKEN: string;
  
  // AI
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  KIMI_API_KEY: string;
  AI_GATEWAY_ID: string;
  
  // Optional
  DEFAULT_AI_PROVIDER?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const logger = new Logger();
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Health check
      if (path === '/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
      }
      
      // Auth verification (skip for health)
      const authError = await verifyAuth(request, env);
      if (authError) {
        return errorResponse('Unauthorized', 401);
      }
      
      // Route handlers
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
        return jsonResponse({
          github: {
            owner: env.GITHUB_OWNER,
            repo: env.GITHUB_REPO,
          },
          provider: env.DEFAULT_AI_PROVIDER || 'openai',
        });
      }
      
      return errorResponse('Not Found', 404);
      
    } catch (err) {
      logger.error('Unhandled error', err);
      return errorResponse('Internal Server Error', 500);
    }
  },
};
