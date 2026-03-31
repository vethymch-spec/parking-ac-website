import type { Env } from '../index';

type AIProvider = 'openai' | 'anthropic' | 'kimi';

interface AICompleteOptions {
  system: string;
  user: string;
  max_tokens?: number;
  temperature?: number;
}

export class AIGateway {
  private env: Env;
  private provider: AIProvider;
  
  constructor(env: Env, provider: AIProvider) {
    this.env = env;
    this.provider = provider;
  }
  
  async complete(options: AICompleteOptions): Promise<string> {
    // Use Cloudflare AI Gateway if available
    if (this.env.AI_GATEWAY_ID) {
      return this.callAIGateway(options);
    }
    
    // Direct API calls
    switch (this.provider) {
      case 'openai':
        return this.callOpenAI(options);
      case 'anthropic':
        return this.callAnthropic(options);
      case 'kimi':
        return this.callKimi(options);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }
  
  private async callAIGateway(options: AICompleteOptions): Promise<string> {
    const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${this.env.CF_ACCOUNT_ID}/${this.env.AI_GATEWAY_ID}/${this.provider}`;
    
    let body: object;
    
    if (this.provider === 'openai') {
      body = {
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
      };
    } else if (this.provider === 'anthropic') {
      body = {
        model: 'claude-3-sonnet-20240229',
        system: options.system,
        messages: [{ role: 'user', content: options.user }],
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
      };
    } else {
      body = {
        model: 'kimi-latest',
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
      };
    }
    
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getApiKey()}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Gateway error: ${error}`);
    }
    
    const data = await response.json();
    return this.extractResponse(data);
  }
  
  private async callOpenAI(options: AICompleteOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  private async callAnthropic(options: AICompleteOptions): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        system: options.system,
        messages: [{ role: 'user', content: options.user }],
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  }
  
  private async callKimi(options: AICompleteOptions): Promise<string> {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-latest',
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Kimi error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  private getApiKey(): string {
    switch (this.provider) {
      case 'openai':
        return this.env.OPENAI_API_KEY;
      case 'anthropic':
        return this.env.ANTHROPIC_API_KEY;
      case 'kimi':
        return this.env.KIMI_API_KEY;
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }
  
  private extractResponse(data: any): string {
    switch (this.provider) {
      case 'openai':
      case 'kimi':
        return data.choices[0].message.content;
      case 'anthropic':
        return data.content[0].text;
      default:
        return JSON.stringify(data);
    }
  }
}
