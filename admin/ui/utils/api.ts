export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIAction[];
  branch?: string;
}

export interface AIAction {
  type: 'create_file' | 'modify_file' | 'delete_file' | 'explain';
  path: string;
  content?: string;
  description: string;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
  };
}

export interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  state: string;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
}

export interface DeploymentStatus {
  id: string;
  url: string;
  status: string;
  branch: string;
}

export class AdminAPI {
  private endpoint: string;
  private authToken: string;

  constructor(endpoint: string, authToken: string) {
    this.endpoint = endpoint;
    this.authToken = authToken;
  }

  private async fetch(path: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(`${this.endpoint}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response;
  }

  // Chat
  async sendMessage(message: string, provider?: string): Promise<ChatMessage> {
    const response = await this.fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, provider }),
    });
    return response.json();
  }

  // GitHub
  async listBranches(): Promise<Branch[]> {
    const response = await this.fetch('/api/github/branches');
    const data = await response.json();
    return data.branches;
  }

  async getFileContent(path: string, branch?: string): Promise<{ path: string; content: string; branch: string }> {
    const query = new URLSearchParams({ path, ...(branch && { branch }) });
    const response = await this.fetch(`/api/github/files?${query}`);
    return response.json();
  }

  async createBranch(name: string, from?: string): Promise<void> {
    await this.fetch('/api/github/branches', {
      method: 'POST',
      body: JSON.stringify({ name, from }),
    });
  }

  async createPR(title: string, head: string, base?: string, body?: string): Promise<PullRequest> {
    const response = await this.fetch('/api/github/pr', {
      method: 'POST',
      body: JSON.stringify({ title, head, base, body }),
    });
    const data = await response.json();
    return data.pr;
  }

  async listPRs(state?: 'open' | 'closed' | 'all'): Promise<PullRequest[]> {
    const query = state ? `?state=${state}` : '';
    const response = await this.fetch(`/api/github/prs${query}`);
    const data = await response.json();
    return data.prs;
  }

  async mergePR(number: number): Promise<void> {
    await this.fetch(`/api/github/pr/${number}/merge`, {
      method: 'POST',
    });
  }

  // Deployment
  async triggerDeploy(branch: string): Promise<{ previewUrl: string }> {
    const response = await this.fetch('/api/deploy/preview', {
      method: 'POST',
      body: JSON.stringify({ branch }),
    });
    const data = await response.json();
    return { previewUrl: data.previewUrl };
  }

  async getDeployStatus(branch: string): Promise<DeploymentStatus> {
    const response = await this.fetch(`/api/deploy/status?branch=${branch}`);
    return response.json();
  }

  // Config
  async getConfig(): Promise<{ github: { owner: string; repo: string }; provider: string }> {
    const response = await this.fetch('/api/config');
    return response.json();
  }
}
