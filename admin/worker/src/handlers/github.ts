import type { Env } from '../index';
import { Logger } from '../utils/logger';
import { jsonResponse, errorResponse } from '../utils/errors';
import { GitHubAPI } from '../services/github-api';

export async function handleGitHub(
  request: Request,
  env: Env,
  logger: Logger
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const github = new GitHubAPI(env);
  
  try {
    // GET /api/github/branches - List branches
    if (path === '/api/github/branches' && request.method === 'GET') {
      const branches = await github.listBranches();
      return jsonResponse({ branches });
    }
    
    // GET /api/github/files?path=... - Get file content
    if (path === '/api/github/files' && request.method === 'GET') {
      const filePath = url.searchParams.get('path');
      const branch = url.searchParams.get('branch') || 'main';
      
      if (!filePath) {
        return errorResponse('Path parameter required', 400);
      }
      
      const content = await github.getFileContent(filePath, branch);
      return jsonResponse({ path: filePath, content, branch });
    }
    
    // POST /api/github/branches - Create branch
    if (path === '/api/github/branches' && request.method === 'POST') {
      const body = await request.json() as { name: string; from?: string };
      
      if (!body.name) {
        return errorResponse('Branch name required', 400);
      }
      
      await github.createBranch(body.name, body.from || 'main');
      logger.info('Created branch via API', { branch: body.name });
      
      return jsonResponse({ success: true, branch: body.name });
    }
    
    // POST /api/github/commit - Create commit
    if (path === '/api/github/commit' && request.method === 'POST') {
      const body = await request.json() as {
        path: string;
        content: string;
        message: string;
        branch: string;
      };
      
      if (!body.path || !body.content || !body.branch) {
        return errorResponse('Path, content, and branch required', 400);
      }
      
      await github.createOrUpdateFile(
        body.path,
        body.content,
        body.message,
        body.branch
      );
      
      logger.info('Created commit', { path: body.path, branch: body.branch });
      return jsonResponse({ success: true });
    }
    
    // POST /api/github/pr - Create PR
    if (path === '/api/github/pr' && request.method === 'POST') {
      const body = await request.json() as {
        title: string;
        head: string;
        base?: string;
        body?: string;
      };
      
      if (!body.title || !body.head) {
        return errorResponse('Title and head branch required', 400);
      }
      
      const pr = await github.createPullRequest(
        body.title,
        body.head,
        body.base || 'main',
        body.body || ''
      );
      
      logger.info('Created PR', { prNumber: pr.number });
      return jsonResponse({ success: true, pr });
    }
    
    // POST /api/github/pr/:number/merge - Merge PR
    if (path.match(/\/api\/github\/pr\/\d+\/merge/) && request.method === 'POST') {
      const match = path.match(/\/pr\/(\d+)\/merge/);
      const prNumber = parseInt(match![1]);
      
      const result = await github.mergePullRequest(prNumber);
      logger.info('Merged PR', { prNumber });
      
      return jsonResponse({ success: true, result });
    }
    
    // GET /api/github/prs - List PRs
    if (path === '/api/github/prs' && request.method === 'GET') {
      const state = url.searchParams.get('state') || 'open';
      const prs = await github.listPullRequests(state as 'open' | 'closed' | 'all');
      return jsonResponse({ prs });
    }
    
    return errorResponse('Not Found', 404);
    
  } catch (err) {
    logger.error('GitHub handler error', err);
    return errorResponse('GitHub API error', 500);
  }
}
