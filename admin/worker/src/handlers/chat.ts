import type { Env } from '../index';
import { Logger } from '../utils/logger';
import { jsonResponse, errorResponse } from '../utils/errors';
import { AIGateway } from '../services/ai-gateway';
import { GitHubAPI } from '../services/github-api';

interface ChatRequest {
  message: string;
  provider?: 'openai' | 'anthropic' | 'kimi';
  context?: {
    branch?: string;
    files?: string[];
  };
}

interface ChatResponse {
  id: string;
  message: string;
  actions: AIAction[];
  branch?: string;
  previewUrl?: string;
}

interface AIAction {
  type: 'create_file' | 'modify_file' | 'delete_file' | 'explain';
  path: string;
  content?: string;
  description: string;
}

export async function handleChat(
  request: Request,
  env: Env,
  logger: Logger
): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message) {
      return errorResponse('Message is required', 400);
    }
    
    const provider = body.provider || env.DEFAULT_AI_PROVIDER || 'openai';
    const ai = new AIGateway(env, provider);
    const github = new GitHubAPI(env);
    
    logger.info('Processing chat message', { provider, message: body.message.slice(0, 100) });
    
    // Fetch current files if needed
    let fileContext = '';
    if (body.context?.files) {
      for (const filePath of body.context.files) {
        try {
          const content = await github.getFileContent(filePath, 'main');
          fileContext += `\n\n--- ${filePath} ---\n${content}`;
        } catch (e) {
          logger.warn(`Failed to fetch file ${filePath}`);
        }
      }
    }
    
    // Prepare system prompt
    const systemPrompt = `You are an expert web developer helping modify a React + Vite website.

RULES:
1. ALWAYS analyze the request carefully before making changes
2. ONLY modify files in the /client directory (React frontend)
3. NEVER modify .env, secrets, or configuration files
4. Create a new branch for each change
5. Provide clear explanations for each change

AVAILABLE ACTIONS:
- create_file: Create a new file
- modify_file: Modify existing file
- delete_file: Delete a file (rare)
- explain: Just explain something without code changes

BRANCH NAMING:
- Use format: ai/{timestamp}-{brief-description}
- Example: ai/1712345678-update-hero-title

CODE STYLE:
- Use TypeScript
- Follow React best practices
- Maintain existing code style
- Add comments for complex logic

SECURITY:
- Never expose secrets
- Validate all inputs
- Escape user content properly

${fileContext ? 'CURRENT FILES:\n' + fileContext : ''}`;
    
    // Call AI
    const aiResponse = await ai.complete({
      system: systemPrompt,
      user: body.message,
      max_tokens: 4000,
    });
    
    // Parse AI response
    const { message, actions, branchName } = parseAIResponse(aiResponse);
    
    // Create branch if there are code changes
    let branch = '';
    if (actions.some(a => a.type !== 'explain')) {
      branch = branchName || `ai/${Date.now()}-${slugify(body.message.slice(0, 30))}`;
      await github.createBranch(branch, 'main');
      logger.info('Created branch', { branch });
      
      // Apply file changes
      for (const action of actions) {
        if (action.type === 'create_file' || action.type === 'modify_file') {
          await github.createOrUpdateFile(
            action.path,
            action.content!,
            `AI: ${action.description}`,
            branch
          );
          logger.info(`Modified file ${action.path}`);
        }
      }
    }
    
    const response: ChatResponse = {
      id: crypto.randomUUID(),
      message,
      actions,
      branch,
    };
    
    return jsonResponse(response);
    
  } catch (err) {
    logger.error('Chat handler error', err);
    return errorResponse('Failed to process chat message', 500);
  }
}

function parseAIResponse(aiText: string): { message: string; actions: AIAction[]; branchName?: string } {
  const actions: AIAction[] = [];
  let message = aiText;
  let branchName = '';
  
  // Extract branch name if specified
  const branchMatch = aiText.match(/BRANCH:\s*(\S+)/);
  if (branchMatch) {
    branchName = branchMatch[1];
    message = message.replace(branchMatch[0], '');
  }
  
  // Extract file operations
  const fileRegex = /```(?:file|typescript|tsx|jsx|css|html):?\s*(\S+)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = fileRegex.exec(aiText)) !== null) {
    const path = match[1];
    const content = match[2].trim();
    
    actions.push({
      type: 'modify_file',
      path,
      content,
      description: `Update ${path}`,
    });
  }
  
  // Clean up message
  message = message
    .replace(fileRegex, '')
    .replace(/```[\s\S]*?```/g, '[code]')
    .trim();
  
  // If no actions extracted, treat as explanation
  if (actions.length === 0) {
    actions.push({
      type: 'explain',
      path: '',
      description: 'Explanation provided',
    });
  }
  
  return { message, actions, branchName };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
