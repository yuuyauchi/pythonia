export interface PythonRunResult {
  stdout: string;
  stderr: string;
  success: boolean;
  executionTime?: number;
}

export interface PythonRunner {
  runPython: (code: string, input?: string) => Promise<PythonRunResult>;
  isReady: () => boolean;
  initialize: () => Promise<void>;
  cleanup?: () => void;
}

export interface PyodideMessage {
  type: 'ready' | 'result' | 'error' | 'log';
  id?: string;
  stdout?: string;
  stderr?: string;
  success?: boolean;
  message?: string;
  executionTime?: number;
}
