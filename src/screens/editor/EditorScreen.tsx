import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { useEditorStore } from '../../store/editorStore';
import { runPython } from '../../lib/pythonRunner';
import CodeEditor from '../../components/editor/CodeEditor';
import ConsoleView from '../../components/editor/ConsoleView';

const FILE_TABS = [
  { name: 'main.py', label: 'main.py', editable: true },
  { name: 'sample_hello.py', label: 'Hello', editable: false },
  { name: 'sample_variable.py', label: '変数', editable: false },
];

export default function EditorScreen() {
  const {
    currentFile,
    files,
    consoleOutput,
    isExecuting,
    setCurrentFile,
    updateFileContent,
    addConsoleOutput,
    clearConsole,
    setIsExecuting,
  } = useEditorStore();

  const currentContent = files[currentFile] || '';
  const isCurrentFileEditable = currentFile === 'main.py';

  const handleFileChange = (text: string) => {
    updateFileContent(currentFile, text);
  };

  const handleRunCode = async () => {
    if (!currentContent.trim()) {
      Alert.alert('エラー', 'コードを入力してください');
      return;
    }

    setIsExecuting(true);
    clearConsole();

    addConsoleOutput({
      type: 'info',
      text: `実行中: ${currentFile}`,
      timestamp: Date.now(),
    });

    try {
      const result = await runPython(currentContent);

      if (result.success) {
        if (result.stdout) {
          addConsoleOutput({
            type: 'stdout',
            text: result.stdout,
            timestamp: Date.now(),
          });
        }
        if (!result.stdout && !result.stderr) {
          addConsoleOutput({
            type: 'info',
            text: '実行が完了しました（出力なし）',
            timestamp: Date.now(),
          });
        }
      } else {
        if (result.stderr) {
          addConsoleOutput({
            type: 'stderr',
            text: result.stderr,
            timestamp: Date.now(),
          });
        }
      }

      if (result.executionTime) {
        addConsoleOutput({
          type: 'info',
          text: `実行時間: ${result.executionTime.toFixed(2)}ms`,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      addConsoleOutput({
        type: 'stderr',
        text: `エラー: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>書く</Text>
        <Text style={styles.subtitle}>Pythonコードを自由に書いて実行</Text>
      </View>

      {/* File Tabs */}
      <View style={styles.fileTabs}>
        {FILE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.fileTab,
              currentFile === tab.name && styles.fileTabActive,
            ]}
            onPress={() => setCurrentFile(tab.name)}
          >
            <Text
              style={[
                styles.fileTabText,
                currentFile === tab.name && styles.fileTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {!tab.editable && (
              <Text style={styles.readOnlyBadge}>読取専用</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Editor Area */}
      <View style={styles.editorContainer}>
        <CodeEditor
          value={currentContent}
          onChange={handleFileChange}
          readOnly={!isCurrentFileEditable}
        />
      </View>

      {/* Execute Button */}
      <View style={styles.controlBar}>
        <TouchableOpacity
          style={[styles.runButton, isExecuting && styles.runButtonDisabled]}
          onPress={handleRunCode}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.runButtonText}>実行中...</Text>
            </>
          ) : (
            <>
              <Text style={styles.runIcon}>▶</Text>
              <Text style={styles.runButtonText}>実行</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Console */}
      <View style={styles.consoleContainer}>
        <ConsoleView output={consoleOutput} onClear={clearConsole} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fileTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: spacing.md,
  },
  fileTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fileTabActive: {
    borderBottomColor: colors.primary,
  },
  fileTabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  fileTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  readOnlyBadge: {
    ...typography.caption,
    fontSize: 10,
    color: '#888888',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  editorContainer: {
    flex: 1,
    padding: spacing.md,
  },
  controlBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  runButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  runButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  runIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  runButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  consoleContainer: {
    height: 200,
    padding: spacing.md,
    paddingTop: 0,
  },
});
