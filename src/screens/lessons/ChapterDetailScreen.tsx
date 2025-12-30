import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { getChapterById, getContentById } from '../../lib/lessonLoader';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { chapterId: string } }, 'params'>;
};

const STEP_TYPE_LABELS: Record<string, string> = {
  slide: 'スライド',
  code_read: 'コード解説',
  quiz_fill: '穴埋め問題',
  quiz_mcq: '四択問題',
  code_task: 'コーディング課題',
};

const STEP_TYPE_ICONS: Record<string, string> = {
  slide: '📖',
  code_read: '👀',
  quiz_fill: '✏️',
  quiz_mcq: '❓',
  code_task: '💻',
};

export default function ChapterDetailScreen({ navigation, route }: Props) {
  const { chapterId } = route.params;
  const chapter = getChapterById(chapterId);
  const { getChapterProgress, isStepComplete, setCurrentStep } =
    useLessonProgressStore();

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>章が見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stepIds = chapter.steps.map((s) => s.id);
  const progress = getChapterProgress(chapter.id, stepIds);

  const handleStepPress = (stepId: string, stepIndex: number) => {
    setCurrentStep(chapter.id, stepId);
    navigation.navigate('Step', {
      chapterId: chapter.id,
      stepId,
      stepIndex,
    });
  };

  const getStepTitle = (step: typeof chapter.steps[0]) => {
    const content = getContentById(step.contentId, step.type);

    if (!content) return step.contentId;

    // Get title based on content type
    if ('title' in content) {
      return content.title; // SlideContent
    }
    if ('question' in content) {
      return content.question; // QuizMCQContent
    }
    if ('description' in content) {
      // Extract first line of description
      const firstLine = content.description.split('\n')[0];
      return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
    }

    return step.contentId;
  };

  const renderStepItem = (step: typeof chapter.steps[0], index: number) => {
    const isComplete = isStepComplete(step.id);
    const typeLabel = STEP_TYPE_LABELS[step.type] || step.type;
    const typeIcon = STEP_TYPE_ICONS[step.type] || '📄';
    const stepTitle = getStepTitle(step);

    return (
      <TouchableOpacity
        key={step.id}
        style={[styles.stepCard, isComplete && styles.stepCardComplete]}
        onPress={() => handleStepPress(step.id, index)}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            {isComplete ? (
              <Text style={styles.stepNumberTextComplete}>✓</Text>
            ) : (
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>
              {stepTitle}
            </Text>
            <Text style={styles.stepType}>
              {typeIcon} {typeLabel}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Chapter Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹ 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{chapter.title}</Text>
          <Text style={styles.description}>{chapter.description}</Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.completed} / {progress.total} 完了
            </Text>
          </View>
        </View>

        {/* Step List */}
        <View style={styles.stepList}>
          <Text style={styles.sectionTitle}>ステップ一覧</Text>
          {chapter.steps.map((step, index) => renderStepItem(step, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontSize: 18,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepList: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepCardComplete: {
    backgroundColor: '#F1F8F4',
    borderColor: '#4CAF50',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  stepNumberTextComplete: {
    ...typography.caption,
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  stepType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepId: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  arrow: {
    ...typography.h2,
    color: colors.textSecondary,
  },
});
