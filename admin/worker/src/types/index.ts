export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'create_file' | 'modify_file' | 'delete_file' | 'explain';
  path: string;
  content?: string;
  description: string;
}

export interface DeploymentInfo {
  id: string;
  url: string;
  status: string;
  branch: string;
  previewUrl: string;
}

export interface GitHubBranch {
  name: string;
  sha: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  state: string;
}
