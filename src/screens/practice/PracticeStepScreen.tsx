import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { getPracticeStepData, getPracticeChapter } from '../../lib/practiceLoader';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProjectIntroComponent from '../../components/practice/ProjectIntroComponent';
import GuidedStepComponent from '../../components/practice/GuidedStepComponent';
import ChallengeComponent from '../../components/practice/ChallengeComponent';
import FreePracticeComponent from '../../components/practice/FreePracticeComponent';

type Props = NativeStackScreenProps<any, 'PracticeStep'>;

export default function PracticeStepScreen({ route, navigation }: Props) {
  const { chapterId, stepId } = route.params as { chapterId: string; stepId: string };
  const stepData = getPracticeStepData(chapterId, stepId);
  const { markStepComplete, isStepComplete } = useLessonProgressStore();
  const [isCompleted, setIsCompleted] = useState(isStepComplete(stepId));

  if (!stepData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Step not found</Text>
      </SafeAreaView>
    );
  }

  const { step, content, chapter } = stepData;
  const currentStepIndex = chapter.steps.findIndex((s) => s.id === stepId);
  const hasNext = currentStepIndex < chapter.steps.length - 1;
  const hasPrev = currentStepIndex > 0;

  const handleComplete = () => {
    markStepComplete(stepId);
    setIsCompleted(true);
  };

  const handleNext = () => {
    if (hasNext) {
      const nextStep = chapter.steps[currentStepIndex + 1];
      navigation.replace('PracticeStep', { chapterId, stepId: nextStep.id });
    } else {
      navigation.goBack();
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      const prevStep = chapter.steps[currentStepIndex - 1];
      navigation.replace('PracticeStep', { chapterId, stepId: prevStep.id });
    }
  };

  const renderContent = () => {
    switch (step.type) {
      case 'project_intro':
        return <ProjectIntroComponent content={content as any} onComplete={handleComplete} />;
      case 'guided_step':
        return <GuidedStepComponent content={content as any} onComplete={handleComplete} />;
      case 'challenge':
        return <ChallengeComponent content={content as any} onComplete={handleComplete} />;
      case 'free_practice':
        return <FreePracticeComponent content={content as any} onComplete={handleComplete} />;
      default:
        return <Text>Unknown step type</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ 完了</Text>
            </View>
          )}
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            ステップ {currentStepIndex + 1} / {chapter.steps.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStepIndex + 1) / chapter.steps.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Navigation */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, !hasPrev && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={!hasPrev}
        >
          <Text style={[styles.navButtonText, !hasPrev && styles.navButtonTextDisabled]}>
            ← 前へ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {hasNext ? '次へ →' : '完了'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chapterTitle: {
    ...typography.h3,
    color: colors.text,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  navButtonDisabled: {
    borderColor: '#CCCCCC',
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  navButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: '#CCCCCC',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});
