import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import type { GuidedStep } from '../../lib/practiceLoader';
import CodeEditor from '../editor/CodeEditor';
import ConsoleView from '../editor/ConsoleView';
import { runPython } from '../../lib/pythonRunner';
import type { ConsoleOutput } from '../../store/editorStore';

interface Props {
  content: GuidedStep;
  onComplete: () => void;
}

export default function GuidedStepComponent({ content, onComplete }: Props) {
  const [code, setCode] = useState(content.starterCode);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) {
      Alert.alert('エラー', 'コードを入力してください');
      return;
    }

    setIsExecuting(true);
    setConsoleOutput([
      {
        type: 'info',
        text: '実行中...',
        timestamp: Date.now(),
      },
    ]);

    try {
      const result = await runPython(code);

      const newOutput: ConsoleOutput[] = [];

      if (result.success) {
        if (result.stdout) {
          newOutput.push({
            type: 'stdout',
            text: result.stdout,
            timestamp: Date.now(),
          });

          // Check if output matches expected
          if (checkOutput(result.stdout)) {
            newOutput.push({
              type: 'info',
              text: '✓ 正解です!次のステップに進めます。',
              timestamp: Date.now(),
            });
            onComplete();
          } else {
            newOutput.push({
              type: 'info',
              text: 'もう一度確認してみましょう。ヒントを見ることもできます。',
              timestamp: Date.now(),
            });
          }
        }
      } else {
        if (result.stderr) {
          newOutput.push({
            type: 'stderr',
            text: result.stderr,
            timestamp: Date.now(),
          });
        }
      }

      setConsoleOutput(newOutput);
    } catch (error) {
      setConsoleOutput([
        {
          type: 'stderr',
          text: `エラー: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const checkOutput = (output: string): boolean => {
    const trimmedOutput = output.trim();

    switch (content.checkType) {
      case 'output_contains':
        return trimmedOutput.includes(String(content.checkValue));
      case 'exact_match':
        return trimmedOutput === String(content.checkValue);
      case 'line_count':
        return trimmedOutput.split('\n').length === Number(content.checkValue);
      default:
        return false;
    }
  };

  const handleShowSolution = () => {
    setCode(content.solution);
    setShowSolution(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Instruction */}
        <View style={styles.instructionCard}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.instruction}>{content.instruction}</Text>
        </View>

        {/* Expected Output */}
        <View style={styles.expectedCard}>
          <Text style={styles.expectedTitle}>期待される出力:</Text>
          <View style={styles.expectedOutput}>
            <Text style={styles.expectedOutputText}>{content.expectedOutput}</Text>
          </View>
        </View>

        {/* Hints */}
        <View style={styles.hintsCard}>
          <TouchableOpacity
            style={styles.hintsHeader}
            onPress={() => setShowHints(!showHints)}
          >
            <Text style={styles.hintsTitle}>💡 ヒント</Text>
            <Text style={styles.hintsToggle}>{showHints ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showHints && (
            <View style={styles.hintsList}>
              {content.hints.map((hint, index) => (
                <View key={index} style={styles.hintItem}>
                  <Text style={styles.hintBullet}>{index + 1}.</Text>
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Code Editor */}
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorTitle}>コードを書いてみよう</Text>
            <TouchableOpacity style={styles.solutionButton} onPress={handleShowSolution}>
              <Text style={styles.solutionButtonText}>解答を見る</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.editorContainer}>
            <CodeEditor value={code} onChange={setCode} readOnly={false} />
          </View>
        </View>

        {/* Run Button */}
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

        {/* Console */}
        {consoleOutput.length > 0 && (
          <View style={styles.consoleCard}>
            <ConsoleView
              output={consoleOutput}
              onClear={() => setConsoleOutput([])}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instruction: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  expectedCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  expectedTitle: {
    ...typography.button,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  expectedOutput: {
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: 8,
  },
  expectedOutputText: {
    ...typography.body,
    fontFamily: 'monospace',
    color: colors.text,
  },
  hintsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  hintsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  hintsTitle: {
    ...typography.button,
    color: colors.text,
  },
  hintsToggle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  hintsList: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.sm,
  },
  hintItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hintBullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  hintText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  editorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  editorTitle: {
    ...typography.button,
    color: colors.text,
  },
  solutionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  solutionButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
  },
  editorContainer: {
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  runButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
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
  consoleCard: {
    minHeight: 150,
  },
});
