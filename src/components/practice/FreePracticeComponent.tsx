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
import type { FreePractice } from '../../lib/practiceLoader';
import CodeEditor from '../editor/CodeEditor';
import ConsoleView from '../editor/ConsoleView';
import { runPython } from '../../lib/pythonRunner';
import type { ConsoleOutput } from '../../store/editorStore';

interface Props {
  content: FreePractice;
  onComplete: () => void;
}

export default function FreePracticeComponent({ content, onComplete }: Props) {
  const [code, setCode] = useState(content.starterCode);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showTips, setShowTips] = useState(false);
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
            text: '素晴らしい!自由に工夫してみましょう。',
            timestamp: Date.now(),
          });
          setHasRun(true);
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

  const handleShowExample = () => {
    setCode(content.exampleSolution);
    setShowExample(true);
  };

  const handleMarkComplete = () => {
    if (!hasRun) {
      Alert.alert(
        '確認',
        '少なくとも一度はコードを実行してみましょう!',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      '完了',
      'このステップを完了としてマークしますか?',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '完了する',
          onPress: () => {
            onComplete();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Free Practice Info */}
        <View style={styles.practiceCard}>
          <View style={styles.practiceHeader}>
            <Text style={styles.practiceBadge}>🚀 自由制作</Text>
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>
        </View>

        {/* Prompt */}
        <View style={styles.promptCard}>
          <Text style={styles.promptTitle}>お題</Text>
          <Text style={styles.promptText}>{content.prompt}</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.tipsHeader}
            onPress={() => setShowTips(!showTips)}
          >
            <Text style={styles.tipsTitle}>💡 制作のヒント</Text>
            <Text style={styles.tipsToggle}>{showTips ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showTips && (
            <View style={styles.tipsList}>
              {content.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Code Editor */}
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorTitle}>あなたのオリジナルコード</Text>
            <TouchableOpacity style={styles.exampleButton} onPress={handleShowExample}>
              <Text style={styles.exampleButtonText}>参考例を見る</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.editorContainer}>
            <CodeEditor value={code} onChange={setCode} readOnly={false} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
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

          <TouchableOpacity
            style={[styles.completeButton, !hasRun && styles.completeButtonDisabled]}
            onPress={handleMarkComplete}
          >
            <Text style={styles.completeButtonText}>完了としてマーク</Text>
          </TouchableOpacity>
        </View>

        {/* Console */}
        {consoleOutput.length > 0 && (
          <View style={styles.consoleCard}>
            <ConsoleView output={consoleOutput} onClear={() => setConsoleOutput([])} />
          </View>
        )}

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            自由制作では正解はありません。学んだことを活かして、自分だけのプログラムを作ってみましょう!
          </Text>
        </View>
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
  practiceCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '50',
  },
  practiceHeader: {
    marginBottom: spacing.sm,
  },
  practiceBadge: {
    ...typography.caption,
    color: colors.primary,
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
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  promptTitle: {
    ...typography.button,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  promptText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  tipsTitle: {
    ...typography.button,
    color: colors.text,
  },
  tipsToggle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tipsList: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipBullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  tipText: {
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
  exampleButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exampleButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
  },
  editorContainer: {
    height: 300,
    backgroundColor: '#F5F5F5',
  },
  actionButtons: {
    gap: spacing.sm,
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
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  completeButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  consoleCard: {
    minHeight: 150,
  },
  encouragementCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  encouragementText: {
    ...typography.body,
    color: '#8B6914',
    textAlign: 'center',
    lineHeight: 22,
  },
});
