import type { Env } from '../index';
import { Logger } from '../utils/logger';
import { jsonResponse, errorResponse } from '../utils/errors';
import { CloudflarePages } from '../services/cf-pages';

export async function handleDeploy(
  request: Request,
  env: Env,
  logger: Logger
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const pages = new CloudflarePages(env);
  
  try {
    // POST /api/deploy/preview - Trigger preview deployment
    if (path === '/api/deploy/preview' && request.method === 'POST') {
      const body = await request.json() as { branch: string };
      
      if (!body.branch) {
        return errorResponse('Branch required', 400);
      }
      
      // Trigger deployment via GitHub webhook or direct API
      const deployment = await pages.triggerDeployment(body.branch);
      logger.info('Triggered preview deployment', { branch: body.branch });
      
      return jsonResponse({
        success: true,
        deployment,
        previewUrl: `https://${body.branch}.cooldrivepro.pages.dev`,
      });
    }
    
    // GET /api/deploy/status?branch=... - Get deployment status
    if (path === '/api/deploy/status' && request.method === 'GET') {
      const branch = url.searchParams.get('branch');
      
      if (!branch) {
        return errorResponse('Branch parameter required', 400);
      }
      
      const status = await pages.getDeploymentStatus(branch);
      return jsonResponse({ branch, status });
    }
    
    // GET /api/deploy/deployments - List recent deployments
    if (path === '/api/deploy/deployments' && request.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const deployments = await pages.listDeployments(limit);
      return jsonResponse({ deployments });
    }
    
    // POST /api/deploy/production - Trigger production deployment
    if (path === '/api/deploy/production' && request.method === 'POST') {
      const body = await request.json() as { branch: string };
      
      if (!body.branch) {
        return errorResponse('Branch required', 400);
      }
      
      // Merge PR first, then production will auto-deploy
      logger.info('Production deployment requested', { branch: body.branch });
      
      return jsonResponse({
        success: true,
        message: 'Please merge the PR to trigger production deployment',
      });
    }
    
    return errorResponse('Not Found', 404);
    
  } catch (err) {
    logger.error('Deploy handler error', err);
    return errorResponse('Deployment error', 500);
  }
}
