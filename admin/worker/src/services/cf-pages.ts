import type { Env } from '../index';

interface Deployment {
  id: string;
  url: string;
  environment: string;
  latest_stage: {
    status: string;
  };
}

export class CloudflarePages {
  private env: Env;
  private headers: Record<string, string>;
  
  constructor(env: Env) {
    this.env = env;
    this.headers = {
      'Authorization': `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
  
  private getBaseUrl(): string {
    return `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}/pages/projects/${this.env.CF_PAGES_PROJECT}`;
  }
  
  // Trigger deployment (via GitHub webhook or manual)
  async triggerDeployment(branch: string): Promise<any> {
    // Cloudflare Pages auto-deploys when GitHub branch updates
    // We just need to check if deployment is triggered
    const response = await fetch(`${this.getBaseUrl()}/deployments`, {
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list deployments: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // Find deployment for this branch
    const deployment = data.result.find((d: any) => 
      d.deployment_trigger?.metadata?.branch === branch
    );
    
    return deployment || { message: 'Deployment will be triggered via GitHub webhook' };
  }
  
  // Get deployment status
  async getDeploymentStatus(branch: string): Promise<any> {
    const response = await fetch(`${this.getBaseUrl()}/deployments`, {
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get deployments: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // Find latest deployment for branch
    const deployment = data.result.find((d: any) => 
      d.deployment_trigger?.metadata?.branch === branch
    );
    
    if (!deployment) {
      return { status: 'not_found', branch };
    }
    
    return {
      id: deployment.id,
      url: deployment.url,
      status: deployment.latest_stage?.status,
      branch,
      created_on: deployment.created_on,
      modified_on: deployment.modified_on,
    };
  }
  
  // List deployments
  async listDeployments(limit: number = 10): Promise<Deployment[]> {
    const response = await fetch(
      `${this.getBaseUrl()}/deployments?per_page=${limit}`,
      { headers: this.headers }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to list deployments: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    return data.result.map((d: any) => ({
      id: d.id,
      url: d.url,
      environment: d.environment,
      latest_stage: d.latest_stage,
    }));
  }
}
