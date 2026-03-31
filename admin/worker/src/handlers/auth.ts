import type { Env } from '../index';

export async function verifyAuth(
  request: Request,
  env: Env
): Promise<Response | null> {
  // Skip auth for health check
  const url = new URL(request.url);
  if (url.pathname === '/health') {
    return null;
  }
  
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Bearer' },
    });
  }
  
  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return new Response('Invalid authorization format', { status: 401 });
  }
  
  // Constant-time comparison to prevent timing attacks
  const expectedToken = env.ADMIN_AUTH_TOKEN;
  if (!constantTimeCompare(token, expectedToken)) {
    return new Response('Invalid token', { status: 401 });
  }
  
  return null; // Auth successful
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
