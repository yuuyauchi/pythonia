import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { PythonWebView } from './src/components/common/PythonWebView';

export default function App() {
  const [pythonReady, setPythonReady] = React.useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {/* Python WebView - Hidden but always running */}
      <PythonWebView
        onReady={() => {
          console.log('[App] Python runtime ready');
          setPythonReady(true);
        }}
        onError={(error) => {
          console.error('[App] Python runtime error:', error);
        }}
      />
      {/* Main App Navigation */}
      <RootNavigator />
    </SafeAreaProvider>
  );
}
