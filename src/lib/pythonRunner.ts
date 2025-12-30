import { PythonRunResult, PyodideMessage } from '../types/python';
import { usePackageStore } from '../store/packageStore';

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

  /**
   * Install a Python package using micropip
   */
  async installPackage(packageName: string): Promise<{ success: boolean; error?: string }> {
    const packageStore = usePackageStore.getState();

    // Check if already installed
    if (packageStore.isPackageInstalled(packageName)) {
      return { success: true };
    }

    // Check if currently installing
    if (packageStore.isPackageInstalling(packageName)) {
      // Wait for installation to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (packageStore.isPackageInstalled(packageName)) {
            clearInterval(checkInterval);
            resolve({ success: true });
          } else if (!packageStore.isPackageInstalling(packageName)) {
            // Installation failed
            clearInterval(checkInterval);
            resolve({ success: false, error: 'Package installation failed' });
          }
        }, 100);
      });
    }

    // Mark as installing
    packageStore.markPackageAsInstalling(packageName);

    try {
      // Install using micropip
      const installCode = `
import micropip
await micropip.install('${packageName}')
print('Package ${packageName} installed successfully')
`;

      const result = await this.runPython(installCode);

      if (result.success) {
        // Mark as installed
        packageStore.markPackageAsInstalled(packageName);
        return { success: true };
      } else {
        // Mark as error
        packageStore.markPackageInstallError(packageName, result.stderr || 'Unknown error');
        packageStore.clearInstallingPackage(packageName);
        return { success: false, error: result.stderr || 'Installation failed' };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      packageStore.markPackageInstallError(packageName, errorMsg);
      packageStore.clearInstallingPackage(packageName);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Install multiple packages
   */
  async installPackages(packageNames: string[]): Promise<{
    success: boolean;
    results: Array<{ package: string; success: boolean; error?: string }>;
  }> {
    // Python standard library modules that should not be installed via micropip
    const STANDARD_LIBRARY = [
      'abc', 'aifc', 'argparse', 'array', 'ast', 'asynchat', 'asyncio', 'asyncore',
      'atexit', 'audioop', 'base64', 'bdb', 'binascii', 'binhex', 'bisect', 'builtins',
      'bz2', 'calendar', 'cgi', 'cgitb', 'chunk', 'cmath', 'cmd', 'code', 'codecs',
      'codeop', 'collections', 'colorsys', 'compileall', 'concurrent', 'configparser',
      'contextlib', 'contextvars', 'copy', 'copyreg', 'cProfile', 'crypt', 'csv',
      'ctypes', 'curses', 'dataclasses', 'datetime', 'dbm', 'decimal', 'difflib',
      'dis', 'distutils', 'doctest', 'email', 'encodings', 'enum', 'errno', 'faulthandler',
      'fcntl', 'filecmp', 'fileinput', 'fnmatch', 'fractions', 'ftplib', 'functools',
      'gc', 'getopt', 'getpass', 'gettext', 'glob', 'graphlib', 'grp', 'gzip',
      'hashlib', 'heapq', 'hmac', 'html', 'http', 'imaplib', 'imghdr', 'imp', 'importlib',
      'inspect', 'io', 'ipaddress', 'itertools', 'json', 'keyword', 'lib2to3', 'linecache',
      'locale', 'logging', 'lzma', 'mailbox', 'mailcap', 'marshal', 'math', 'mimetypes',
      'mmap', 'modulefinder', 'msilib', 'msvcrt', 'multiprocessing', 'netrc', 'nis',
      'nntplib', 'numbers', 'operator', 'optparse', 'os', 'ossaudiodev', 'parser',
      'pathlib', 'pdb', 'pickle', 'pickletools', 'pipes', 'pkgutil', 'platform',
      'plistlib', 'poplib', 'posix', 'posixpath', 'pprint', 'profile', 'pstats',
      'pty', 'pwd', 'py_compile', 'pyclbr', 'pydoc', 'queue', 'quopri', 'random',
      're', 'readline', 'reprlib', 'resource', 'rlcompleter', 'runpy', 'sched',
      'secrets', 'select', 'selectors', 'shelve', 'shlex', 'shutil', 'signal',
      'site', 'smtpd', 'smtplib', 'sndhdr', 'socket', 'socketserver', 'spwd', 'sqlite3',
      'ssl', 'stat', 'statistics', 'string', 'stringprep', 'struct', 'subprocess',
      'sunau', 'symtable', 'sys', 'sysconfig', 'syslog', 'tabnanny', 'tarfile',
      'telnetlib', 'tempfile', 'termios', 'test', 'textwrap', 'threading', 'time',
      'timeit', 'tkinter', 'token', 'tokenize', 'tomllib', 'trace', 'traceback',
      'tracemalloc', 'tty', 'turtle', 'turtledemo', 'types', 'typing', 'unicodedata',
      'unittest', 'urllib', 'uu', 'uuid', 'venv', 'warnings', 'wave', 'weakref',
      'webbrowser', 'winreg', 'winsound', 'wsgiref', 'xdrlib', 'xml', 'xmlrpc',
      'zipapp', 'zipfile', 'zipimport', 'zlib', '_thread',
    ];

    const results = [];

    // Filter out standard library packages
    const packagesToInstall = packageNames.filter(
      (packageName) => !STANDARD_LIBRARY.includes(packageName.toLowerCase())
    );

    // Add skipped standard library packages as successful
    for (const packageName of packageNames) {
      if (STANDARD_LIBRARY.includes(packageName.toLowerCase())) {
        results.push({
          package: packageName,
          success: true,
          error: undefined,
        });
      }
    }

    // Install remaining packages
    for (const packageName of packagesToInstall) {
      const result = await this.installPackage(packageName);
      results.push({
        package: packageName,
        success: result.success,
        error: result.error,
      });
    }

    const allSuccess = results.every((r) => r.success);

    return {
      success: allSuccess,
      results,
    };
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

// Convenience function for installing a package
export async function installPackage(packageName: string): Promise<{ success: boolean; error?: string }> {
  return pythonRunner.installPackage(packageName);
}

// Convenience function for installing multiple packages
export async function installPackages(packageNames: string[]): Promise<{
  success: boolean;
  results: Array<{ package: string; success: boolean; error?: string }>;
}> {
  return pythonRunner.installPackages(packageNames);
}

// Export for testing/debugging
export { PythonRunnerService };
