import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { getCourseModuleData } from '../../lib/courseLoader';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ImplementationStepComponent from '../../components/courses/ImplementationStepComponent';
import ProblemDiscoveryComponent from '../../components/courses/ProblemDiscoveryComponent';
import PlanningComponent from '../../components/courses/PlanningComponent';
import ReflectionComponent from '../../components/courses/ReflectionComponent';

type Props = NativeStackScreenProps<any, 'CourseStep'>;

export default function CourseStepScreen({ route, navigation }: Props) {
  const { courseId, moduleId } = route.params as { courseId: string; moduleId: string };
  const moduleData = getCourseModuleData(courseId, moduleId);
  const { markStepComplete, isStepComplete } = useLessonProgressStore();
  const [isCompleted, setIsCompleted] = useState(isStepComplete(moduleId));

  if (!moduleData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ コンテンツが見つかりません</Text>
          <Text style={styles.errorMessage}>
            このコースのコンテンツは現在準備中です。{'\n'}
            しばらくお待ちください。
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { module, content, course } = moduleData;
  const currentModuleIndex = course.modules.findIndex((m) => m.id === moduleId);
  const hasNext = currentModuleIndex < course.modules.length - 1;
  const hasPrev = currentModuleIndex > 0;

  const handleComplete = () => {
    markStepComplete(moduleId);
    setIsCompleted(true);
  };

  const handleNext = () => {
    if (hasNext) {
      const nextModule = course.modules[currentModuleIndex + 1];
      navigation.replace('CourseStep', { courseId, moduleId: nextModule.id });
    } else {
      navigation.goBack();
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      const prevModule = course.modules[currentModuleIndex - 1];
      navigation.replace('CourseStep', { courseId, moduleId: prevModule.id });
    }
  };

  const renderContent = () => {
    switch (module.type) {
      case 'problem_discovery':
        return <ProblemDiscoveryComponent content={content as any} onComplete={handleComplete} />;
      case 'planning':
        return <PlanningComponent content={content as any} onComplete={handleComplete} />;
      case 'implementation':
        return <ImplementationStepComponent content={content as any} onComplete={handleComplete} />;
      case 'reflection':
        return <ReflectionComponent content={content as any} onComplete={handleComplete} />;
      default:
        return <Text>Unknown module type</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ 完了</Text>
            </View>
          )}
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            モジュール {currentModuleIndex + 1} / {course.modules.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentModuleIndex + 1) / course.modules.length) * 100}%` },
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

        <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.button,
    color: '#FFFFFF',
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
  courseTitle: {
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
