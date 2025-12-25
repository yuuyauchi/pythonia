import { PythonRunResult, PyodideMessage } from '../types/python';

type PendingExecution = {
  resolve: (result: PythonRunResult) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

class PythonRunnerService {
  private static instance: PythonRunnerService;
  private webViewRef: any = null;
  private ready: boolean = false;
  private initPromise: Promise<void> | null = null;
  private pendingExecutions: Map<string, PendingExecution> = new Map();
  private messageQueue: Array<{ code: string; input?: string; id: string }> = [];
  private executionCounter: number = 0;

  private constructor() {}

  static getInstance(): PythonRunnerService {
    if (!PythonRunnerService.instance) {
      PythonRunnerService.instance = new PythonRunnerService();
    }
    return PythonRunnerService.instance;
  }

  setWebViewRef(ref: any) {
    this.webViewRef = ref;
  }

  isReady(): boolean {
    return this.ready;
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Pyodide initialization timeout'));
      }, 30000); // 30 second timeout

      const checkReady = setInterval(() => {
        if (this.ready) {
          clearInterval(checkReady);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
    });

    return this.initPromise;
  }

  handleWebViewMessage(event: any) {
    try {
      const message: PyodideMessage = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'ready':
          this.ready = true;
          console.log('[PythonRunner] Pyodide is ready');
          // Process queued messages
          this.processMessageQueue();
          break;

        case 'result':
          if (message.id) {
            this.handleExecutionResult(message);
          }
          break;

        case 'error':
          console.error('[PythonRunner] Pyodide error:', message.message);
          break;

        case 'log':
          console.log('[PythonRunner] Pyodide log:', message.message);
          break;

        default:
          console.warn('[PythonRunner] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[PythonRunner] Error handling WebView message:', error);
    }
  }

  private handleExecutionResult(message: PyodideMessage) {
    const pending = this.pendingExecutions.get(message.id!);
    if (!pending) {
      console.warn('[PythonRunner] No pending execution for id:', message.id);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingExecutions.delete(message.id!);

    const result: PythonRunResult = {
      stdout: message.stdout || '',
      stderr: message.stderr || '',
      success: message.success || false,
      executionTime: message.executionTime,
    };

    pending.resolve(result);
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.ready) {
      const msg = this.messageQueue.shift();
      if (msg) {
        this.sendToWebView(msg.code, msg.id, msg.input);
      }
    }
  }

  private sendToWebView(code: string, id: string, input?: string) {
    if (!this.webViewRef) {
      throw new Error('WebView ref not set');
    }

    const message = JSON.stringify({ code, id, input });
    this.webViewRef.postMessage(message);
  }

  async runPython(code: string, input?: string): Promise<PythonRunResult> {
    if (!this.webViewRef) {
      throw new Error('PythonRunner not initialized. Call setWebViewRef first.');
    }

    // Generate unique execution ID
    const id = `exec_${++this.executionCounter}_${Date.now()}`;

    return new Promise<PythonRunResult>((resolve, reject) => {
      // Set timeout for execution (30 seconds)
      const timeout = setTimeout(() => {
        this.pendingExecutions.delete(id);
        reject(new Error('Python execution timeout (30 seconds)'));
      }, 30000);

      // Store the pending execution
      this.pendingExecutions.set(id, { resolve, reject, timeout });

      // Send to WebView or queue if not ready
      if (this.ready) {
        this.sendToWebView(code, id, input);
      } else {
        this.messageQueue.push({ code, id, input });
      }
    });
  }

  cleanup() {
    // Clear all pending executions
    this.pendingExecutions.forEach(({ timeout, reject }) => {
      clearTimeout(timeout);
      reject(new Error('PythonRunner cleanup'));
    });
    this.pendingExecutions.clear();
    this.messageQueue = [];
    this.ready = false;
    this.initPromise = null;
  }
}

// Export singleton instance
export const pythonRunner = PythonRunnerService.getInstance();

// Convenience function for running Python code
export async function runPython(code: string, input?: string): Promise<PythonRunResult> {
  return pythonRunner.runPython(code, input);
}

// Export for testing/debugging
export { PythonRunnerService };
