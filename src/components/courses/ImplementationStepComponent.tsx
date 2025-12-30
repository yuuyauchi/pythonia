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
import type { Implementation } from '../../lib/courseLoader';
import CodeEditor from '../editor/CodeEditor';
import ConsoleView from '../editor/ConsoleView';
import { runPython } from '../../lib/pythonRunner';
import type { ConsoleOutput } from '../../store/editorStore';

interface Props {
  content: Implementation;
  onComplete: () => void;
}

export default function ImplementationStepComponent({ content, onComplete }: Props) {
  const [code, setCode] = useState(content.starterCode);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hasRun, setHasRun] = useState(false);

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
        } else {
          newOutput.push({
            type: 'info',
            text: '実行が完了しました（出力なし）',
            timestamp: Date.now(),
          });
        }

        if (!hasRun) {
          newOutput.push({
            type: 'info',
            text: '✓ コードを実行しました!',
            timestamp: Date.now(),
          });
          setHasRun(true);
          onComplete();
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

  const handleShowSolution = () => {
    setCode(content.solution);
    setShowSolution(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Step Info */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{content.title}</Text>
          <Text style={styles.objective}>目標: {content.objective}</Text>
          <Text style={styles.explanation}>{content.explanation}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>📝 手順</Text>
          {content.instructions.map((instruction) => (
            <View key={instruction.step} style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>
                  {instruction.step}
                </Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>
                  {instruction.title}
                </Text>
                <Text style={styles.instructionDescription}>
                  {instruction.description}
                </Text>
                {instruction.code && (
                  <View style={styles.codeExample}>
                    <Text style={styles.codeExampleText}>{instruction.code}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Key Points */}
        <View style={styles.keyPointsCard}>
          <Text style={styles.cardTitle}>💡 重要ポイント</Text>
          {content.keyPoints.map((point, index) => (
            <View key={index} style={styles.pointItem}>
              <Text style={styles.pointBullet}>•</Text>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Hints */}
        <View style={styles.hintsCard}>
          <TouchableOpacity
            style={styles.hintsHeader}
            onPress={() => setShowHints(!showHints)}
          >
            <Text style={styles.hintsTitle}>🔍 ヒント</Text>
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
            <Text style={styles.editorTitle}>コードエディタ</Text>
            <TouchableOpacity
              style={styles.solutionButton}
              onPress={handleShowSolution}
            >
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
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  objective: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  explanation: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  instructionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  codeExample: {
    backgroundColor: '#F5F5F5',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  codeExampleText: {
    ...typography.body,
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  keyPointsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  pointItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  pointBullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  pointText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontSize: 14,
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
    height: 350,
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
