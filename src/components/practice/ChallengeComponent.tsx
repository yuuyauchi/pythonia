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
import type { Challenge } from '../../lib/practiceLoader';
import CodeEditor from '../editor/CodeEditor';
import ConsoleView from '../editor/ConsoleView';
import { runPython } from '../../lib/pythonRunner';
import type { ConsoleOutput } from '../../store/editorStore';

interface Props {
  content: Challenge;
  onComplete: () => void;
}

export default function ChallengeComponent({ content, onComplete }: Props) {
  const [code, setCode] = useState(content.starterCode);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([]);

  const handleRunTests = async () => {
    if (!code.trim()) {
      Alert.alert('エラー', 'コードを入力してください');
      return;
    }

    setIsExecuting(true);
    setConsoleOutput([
      {
        type: 'info',
        text: 'テストを実行中...',
        timestamp: Date.now(),
      },
    ]);

    try {
      const result = await runPython(code);

      const newOutput: ConsoleOutput[] = [];
      const results: { passed: boolean; message: string }[] = [];

      if (result.success) {
        const output = result.stdout || '';

        // Run test cases
        for (const testCase of content.testCases) {
          const passed = checkTestCase(output, testCase);
          results.push({
            passed,
            message: testCase.description,
          });
        }

        setTestResults(results);

        // Display results
        const passedCount = results.filter((r) => r.passed).length;
        const totalCount = results.length;

        newOutput.push({
          type: 'info',
          text: `テスト結果: ${passedCount} / ${totalCount} 合格`,
          timestamp: Date.now(),
        });

        if (result.stdout) {
          newOutput.push({
            type: 'stdout',
            text: result.stdout,
            timestamp: Date.now(),
          });
        }

        if (passedCount === totalCount) {
          newOutput.push({
            type: 'info',
            text: '🎉 すべてのテストに合格しました!',
            timestamp: Date.now(),
          });
          onComplete();
        } else {
          newOutput.push({
            type: 'info',
            text: '一部のテストが失敗しました。ヒントを確認してみましょう。',
            timestamp: Date.now(),
          });
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

  const checkTestCase = (
    output: string,
    testCase: { checkType: string; expected: string | number }
  ): boolean => {
    const trimmedOutput = output.trim();

    switch (testCase.checkType) {
      case 'output_contains':
        return trimmedOutput.includes(String(testCase.expected));
      case 'exact_match':
        return trimmedOutput === String(testCase.expected);
      case 'line_count':
        return trimmedOutput.split('\n').length === Number(testCase.expected);
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
        {/* Challenge Info */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeBadge}>🎯 チャレンジ</Text>
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>課題</Text>
          <Text style={styles.instructionText}>{content.instruction}</Text>
        </View>

        {/* Test Cases */}
        <View style={styles.testCasesCard}>
          <Text style={styles.testCasesTitle}>✓ 合格条件</Text>
          <View style={styles.testCasesList}>
            {content.testCases.map((testCase, index) => {
              const result = testResults[index];
              return (
                <View key={index} style={styles.testCaseItem}>
                  {result ? (
                    <Text style={styles.testCaseIcon}>
                      {result.passed ? '✓' : '✗'}
                    </Text>
                  ) : (
                    <Text style={styles.testCaseIcon}>○</Text>
                  )}
                  <Text
                    style={[
                      styles.testCaseText,
                      result && (result.passed ? styles.testCasePassed : styles.testCaseFailed),
                    ]}
                  >
                    {testCase.description}
                  </Text>
                </View>
              );
            })}
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
            <Text style={styles.editorTitle}>あなたのコード</Text>
            <TouchableOpacity style={styles.solutionButton} onPress={handleShowSolution}>
              <Text style={styles.solutionButtonText}>解答例を見る</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.editorContainer}>
            <CodeEditor value={code} onChange={setCode} readOnly={false} />
          </View>
        </View>

        {/* Run Button */}
        <TouchableOpacity
          style={[styles.runButton, isExecuting && styles.runButtonDisabled]}
          onPress={handleRunTests}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.runButtonText}>テスト実行中...</Text>
            </>
          ) : (
            <>
              <Text style={styles.runIcon}>▶</Text>
              <Text style={styles.runButtonText}>テストを実行</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Console */}
        {consoleOutput.length > 0 && (
          <View style={styles.consoleCard}>
            <ConsoleView output={consoleOutput} onClear={() => setConsoleOutput([])} />
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
  challengeCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  challengeHeader: {
    marginBottom: spacing.sm,
  },
  challengeBadge: {
    ...typography.caption,
    color: '#F57C00',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  instructionTitle: {
    ...typography.button,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  testCasesCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  testCasesTitle: {
    ...typography.button,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  testCasesList: {
    gap: spacing.xs,
  },
  testCaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  testCaseIcon: {
    ...typography.body,
    fontWeight: '700',
    width: 20,
  },
  testCaseText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  testCasePassed: {
    color: '#4CAF50',
  },
  testCaseFailed: {
    color: '#F44336',
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
    height: 250,
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
