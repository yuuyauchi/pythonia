import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { pythonRunner } from '../../lib/pythonRunner';
import { colors } from '../../constants/theme';

interface PythonWebViewProps {
  onReady?: () => void;
  onError?: (error: string) => void;
}

export const PythonWebView: React.FC<PythonWebViewProps> = ({ onReady, onError }) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (webViewRef.current) {
      pythonRunner.setWebViewRef(webViewRef.current);
    }

    return () => {
      pythonRunner.cleanup();
    };
  }, []);

  const handleMessage = (event: any) => {
    pythonRunner.handleWebViewMessage(event);

    // Check if Pyodide is ready
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'ready') {
        setIsLoading(false);
        onReady?.();
      } else if (message.type === 'error') {
        setError(message.message);
        setIsLoading(false);
        onError?.(message.message);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('Failed to load Python runtime');
    setIsLoading(false);
    onError?.('Failed to load Python runtime');
  };

  // HTML source embedded as string
  const pyodideHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pyodide Python Runner</title>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #status {
      padding: 10px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="status">Loading Python runtime...</div>
  <script>
    let pyodide = null;
    let isReady = false;
    let pendingMessages = [];

    async function initPyodide() {
      try {
        document.getElementById('status').textContent = 'Loading Pyodide...';
        pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        // Load commonly used packages
        await pyodide.loadPackage(['micropip']);

        await pyodide.runPythonAsync(\`
import sys
import io
import micropip

class OutputCapture:
    def __init__(self):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()

    def reset(self):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()

    def get_stdout(self):
        return self.stdout.getvalue()

    def get_stderr(self):
        return self.stderr.getvalue()

output_capture = OutputCapture()
        \`);

        isReady = true;
        document.getElementById('status').textContent = 'Python runtime ready';

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        }

        while (pendingMessages.length > 0) {
          const msg = pendingMessages.shift();
          await handleMessage(msg);
        }
      } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        document.getElementById('status').textContent = 'Failed to load Python runtime';

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: 'Failed to initialize Pyodide: ' + error.message
          }));
        }
      }
    }

    async function handleMessage(event) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const { code, id, input } = data;

        if (!id || !code) {
          console.error('Invalid message format:', data);
          return;
        }

        if (!isReady) {
          pendingMessages.push(event);
          return;
        }

        const startTime = Date.now();
        await pyodide.runPythonAsync('output_capture.reset()');
        await pyodide.runPythonAsync(\`
sys.stdout = output_capture.stdout
sys.stderr = output_capture.stderr
        \`);

        try {
          const result = await pyodide.runPythonAsync(code);
          const stdout = await pyodide.runPythonAsync('output_capture.get_stdout()');
          const stderr = await pyodide.runPythonAsync('output_capture.get_stderr()');
          const executionTime = Date.now() - startTime;

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'result',
              id: id,
              stdout: stdout || '',
              stderr: stderr || '',
              success: true,
              executionTime: executionTime
            }));
          }
        } catch (error) {
          const stdout = await pyodide.runPythonAsync('output_capture.get_stdout()');
          const stderr = await pyodide.runPythonAsync('output_capture.get_stderr()');
          const executionTime = Date.now() - startTime;

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'result',
              id: id,
              stdout: stdout || '',
              stderr: (stderr || '') + '\\n' + error.message,
              success: false,
              executionTime: executionTime
            }));
          }
        }

        await pyodide.runPythonAsync(\`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
        \`);
      } catch (error) {
        console.error('Error handling message:', error);

        if (window.ReactNativeWebView && data && data.id) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'result',
            id: data.id,
            stdout: '',
            stderr: 'Internal error: ' + error.message,
            success: false
          }));
        }
      }
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);
    initPyodide();
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: pyodideHTML }}
        onMessage={handleMessage}
        onError={handleError}
        style={styles.hidden}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Python環境を読み込んでいます...</Text>
          <Text style={styles.loadingSubtext}>初回起動時は1分程度かかることがあります</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ エラー</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  hidden: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -50 }],
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    transform: [{ translateY: -50 }],
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text,
  },
});
