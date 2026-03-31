export class Logger {
  private requestId: string;
  
  constructor() {
    this.requestId = crypto.randomUUID();
  }
  
  info(message: string, data?: any) {
    console.log(JSON.stringify({
      level: 'info',
      requestId: this.requestId,
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  }
  
  error(message: string, error?: any) {
    console.error(JSON.stringify({
      level: 'error',
      requestId: this.requestId,
      message,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
  }
  
  warn(message: string, data?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      requestId: this.requestId,
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  }
}
