import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { runPython } from '../../lib/pythonRunner';
import type { CodeReadContent } from '../../types/lesson';

interface CodeReadStepProps {
  content: CodeReadContent;
}

export default function CodeReadStep({ content }: CodeReadStepProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);

    try {
      const result = await runPython(content.code);

      if (result.success) {
        setOutput(result.stdout || '(出力なし)');
      } else {
        setError(result.stderr || 'エラーが発生しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>{content.description}</Text>

      {/* Code Block */}
      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>コード</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{content.code}</Text>
        </View>
      </View>

      {/* Run Button */}
      <TouchableOpacity
        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
        onPress={handleRunCode}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.runButtonText}>実行中...</Text>
          </>
        ) : (
          <>
            <Text style={styles.runIcon}>▶</Text>
            <Text style={styles.runButtonText}>このコードを実行してみる</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Output */}
      {(output || error) && (
        <View style={styles.outputContainer}>
          <Text style={styles.outputLabel}>実行結果</Text>
          <View style={[styles.outputBox, error && styles.errorBox]}>
            <Text style={[styles.outputText, error && styles.errorText]}>
              {output || error}
            </Text>
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
  codeContainer: {
    marginBottom: spacing.lg,
  },
  codeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: '#D4D4D4',
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
    marginBottom: spacing.lg,
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
  outputContainer: {
    marginTop: spacing.md,
  },
  outputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  outputBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFCCCC',
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  errorText: {
    color: '#D32F2F',
  },
});
