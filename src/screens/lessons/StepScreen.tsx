import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { getChapterById, getContentById } from '../../lib/lessonLoader';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

// Import step components
import SlideStep from '../../components/steps/SlideStep';
import CodeReadStep from '../../components/steps/CodeReadStep';
import QuizMCQStep from '../../components/steps/QuizMCQStep';
import QuizFillStep from '../../components/steps/QuizFillStep';
import CodeTaskStep from '../../components/steps/CodeTaskStep';

import type {
  SlideContent,
  CodeReadContent,
  QuizMCQContent,
  QuizFillContent,
  CodeTaskContent,
} from '../../types/lesson';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    { params: { chapterId: string; stepId: string; stepIndex: number } },
    'params'
  >;
};

export default function StepScreen({ navigation, route }: Props) {
  const { chapterId, stepId, stepIndex } = route.params;
  const chapter = getChapterById(chapterId);
  const { markStepComplete } = useLessonProgressStore();

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>章が見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const step = chapter.steps[stepIndex];
  if (!step) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ステップが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const content = getContentById(step.contentId, step.type);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === chapter.steps.length - 1;

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = chapter.steps[stepIndex - 1];
      navigation.replace('Step', {
        chapterId,
        stepId: prevStep.id,
        stepIndex: stepIndex - 1,
      });
    }
  };

  const handleNext = () => {
    markStepComplete(stepId);
    if (!isLastStep) {
      const nextStep = chapter.steps[stepIndex + 1];
      navigation.replace('Step', {
        chapterId,
        stepId: nextStep.id,
        stepIndex: stepIndex + 1,
      });
    } else {
      // Last step, go back to chapter detail
      navigation.goBack();
    }
  };

  const renderStepContent = () => {
    if (!content) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>コンテンツが見つかりません</Text>
        </View>
      );
    }

    switch (step.type) {
      case 'slide':
        return <SlideStep content={content as SlideContent} />;
      case 'code_read':
        return <CodeReadStep content={content as CodeReadContent} />;
      case 'quiz_mcq':
        return <QuizMCQStep content={content as QuizMCQContent} />;
      case 'quiz_fill':
        return <QuizFillStep content={content as QuizFillContent} />;
      case 'code_task':
        return <CodeTaskStep content={content as CodeTaskContent} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              未対応のステップタイプ: {step.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ {chapter.title}</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>
          {stepIndex + 1} / {chapter.steps.length}
        </Text>
      </View>

      {/* Content Area */}
      <View style={styles.content}>{renderStepContent()}</View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, isFirstStep && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstStep}
        >
          <Text
            style={[
              styles.navButtonText,
              isFirstStep && styles.navButtonTextDisabled,
            ]}
          >
            ‹ 前へ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>
            {isLastStep ? '完了' : '次へ ›'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  stepCounter: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  navButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  navButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
