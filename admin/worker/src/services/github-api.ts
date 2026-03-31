import type { Env } from '../index';

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

interface FileContent {
  content: string;
  sha: string;
}

interface PullRequest {
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

export class GitHubAPI {
  private env: Env;
  private baseUrl: string;
  private headers: Record<string, string>;
  
  constructor(env: Env) {
    this.env = env;
    this.baseUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`;
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'User-Agent': 'AI-Admin-Worker',
    };
  }
  
  // List branches
  async listBranches(): Promise<Branch[]> {
    const response = await fetch(`${this.baseUrl}/branches`, {
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${await response.text()}`);
    }
    
    return response.json();
  }
  
  // Get file content
  async getFileContent(path: string, branch: string = 'main'): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/contents/${path}?ref=${branch}`,
      { headers: this.headers }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`GitHub API error: ${await response.text()}`);
    }
    
    const data = await response.json();
    // Decode base64
    const content = atob(data.content.replace(/\n/g, ''));
    return content;
  }
  
  // Create or update file
  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    branch: string,
    sha?: string
  ): Promise<void> {
    // Check if file exists
    let fileSha = sha;
    if (!fileSha) {
      try {
        const existing = await this.getFileContent(path, branch);
        // Need to get SHA from API
        const response = await fetch(
          `${this.baseUrl}/contents/${path}?ref=${branch}`,
          { headers: this.headers }
        );
        if (response.ok) {
          const data = await response.json();
          fileSha = data.sha;
        }
      } catch (e) {
        // File doesn't exist, will create new
      }
    }
    
    const body: any = {
      message,
      content: btoa(content),
      branch,
    };
    
    if (fileSha) {
      body.sha = fileSha;
    }
    
    const response = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update file: ${await response.text()}`);
    }
  }
  
  // Create branch
  async createBranch(name: string, from: string = 'main'): Promise<void> {
    // Get base branch SHA
    const baseResponse = await fetch(
      `${this.baseUrl}/git/refs/heads/${from}`,
      { headers: this.headers }
    );
    
    if (!baseResponse.ok) {
      throw new Error(`Base branch not found: ${from}`);
    }
    
    const baseData = await baseResponse.json();
    const sha = baseData.object.sha;
    
    // Create new branch
    const response = await fetch(`${this.baseUrl}/git/refs`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        ref: `refs/heads/${name}`,
        sha,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      // Branch might already exist
      if (error.includes('already exists')) {
        return;
      }
      throw new Error(`Failed to create branch: ${error}`);
    }
  }
  
  // Create pull request
  async createPullRequest(
    title: string,
    head: string,
    base: string,
    body: string
  ): Promise<PullRequest> {
    const response = await fetch(`${this.baseUrl}/pulls`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        title,
        head,
        base,
        body,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create PR: ${await response.text()}`);
    }
    
    return response.json();
  }
  
  // List pull requests
  async listPullRequests(
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<PullRequest[]> {
    const response = await fetch(
      `${this.baseUrl}/pulls?state=${state}`,
      { headers: this.headers }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to list PRs: ${await response.text()}`);
    }
    
    return response.json();
  }
  
  // Merge pull request
  async mergePullRequest(number: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pulls/${number}/merge`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        merge_method: 'merge',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to merge PR: ${await response.text()}`);
    }
    
    return response.json();
  }
  
  // Delete branch
  async deleteBranch(name: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/git/refs/heads/${name}`,
      {
        method: 'DELETE',
        headers: this.headers,
      }
    );
    
    if (!response.ok && response.status !== 422) { // 422 = already deleted
      throw new Error(`Failed to delete branch: ${await response.text()}`);
    }
  }
}
