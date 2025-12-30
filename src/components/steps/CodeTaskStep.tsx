import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { runPython } from '../../lib/pythonRunner';
import type { CodeTaskContent } from '../../types/lesson';

interface CodeTaskStepProps {
  content: CodeTaskContent;
}

export default function CodeTaskStep({ content }: CodeTaskStepProps) {
  const [code, setCode] = useState(content.initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    output: string;
    message: string;
  } | null>(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const result = await runPython(code);

      // Simple test: check if output matches expected
      const testCase = content.testCases[0]; // Use first test case for simplicity
      const output = result.stdout?.trim() || '';
      const expected = testCase.expectedOutput.trim();

      // Check if output contains expected (for flexible matching)
      const success = output.includes(expected) || output === expected;

      setTestResult({
        success,
        output: result.stdout || result.stderr || '(出力なし)',
        message: success
          ? '✓ テストに合格しました！'
          : `✗ 期待される出力: ${expected}`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        output: err instanceof Error ? err.message : String(err),
        message: 'エラーが発生しました',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Count number of lines for line numbers
  const lines = code.split('\n');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>{content.description}</Text>

      {/* Hint */}
      {content.hint && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintLabel}>💡 ヒント</Text>
          <Text style={styles.hintText}>{content.hint}</Text>
        </View>
      )}

      {/* Code Editor */}
      <View style={styles.editorContainer}>
        <Text style={styles.editorLabel}>コードエディタ</Text>
        <View style={styles.editor}>
          {/* Line Numbers */}
          <View style={styles.lineNumbers}>
            {lines.map((_, index) => (
              <Text key={index} style={styles.lineNumber}>
                {index + 1}
              </Text>
            ))}
          </View>

          {/* Code Input */}
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            multiline
            placeholder="コードを書いてください..."
            placeholderTextColor="#888888"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Test Button */}
      <TouchableOpacity
        style={[styles.testButton, isRunning && styles.testButtonDisabled]}
        onPress={handleRunTest}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.testButtonText}>テスト実行中...</Text>
          </>
        ) : (
          <>
            <Text style={styles.testIcon}>▶</Text>
            <Text style={styles.testButtonText}>テスト実行</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Test Result */}
      {testResult && (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultBox,
              testResult.success
                ? styles.resultBoxSuccess
                : styles.resultBoxError,
            ]}
          >
            <Text style={styles.resultMessage}>{testResult.message}</Text>
          </View>

          <View style={styles.outputContainer}>
            <Text style={styles.outputLabel}>実行結果</Text>
            <View style={styles.outputBox}>
              <Text style={styles.outputText}>{testResult.output}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  hintContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  hintLabel: {
    ...typography.caption,
    color: '#F57C00',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hintText: {
    ...typography.body,
    color: '#F57C00',
    lineHeight: 22,
  },
  editorContainer: {
    marginBottom: spacing.lg,
  },
  editorLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  editor: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 200,
  },
  lineNumbers: {
    backgroundColor: '#E8E8E8',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: '#D0D0D0',
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'right',
    minWidth: 30,
  },
  codeInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    padding: spacing.sm,
    minHeight: 200,
  },
  testButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  testButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  testIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  testButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  resultContainer: {
    marginTop: spacing.md,
  },
  resultBox: {
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resultBoxSuccess: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resultBoxError: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  resultMessage: {
    ...typography.body,
    fontWeight: '600',
  },
  outputContainer: {
    marginTop: spacing.sm,
  },
  outputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  outputBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: '#D4D4D4',
  },
});
