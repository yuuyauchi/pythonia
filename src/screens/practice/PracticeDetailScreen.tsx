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
import { getPracticeChapter } from '../../lib/practiceLoader';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'PracticeDetail'>;

export default function PracticeDetailScreen({ route, navigation }: Props) {
  const { chapterId } = route.params as { chapterId: string };
  const chapter = getPracticeChapter(chapterId);
  const { isStepComplete } = useLessonProgressStore();

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Chapter not found</Text>
      </SafeAreaView>
    );
  }

  const handleStepPress = (stepId: string) => {
    navigation.navigate('PracticeStep', { chapterId, stepId });
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'project_intro':
        return '📋';
      case 'guided_step':
        return '✏️';
      case 'challenge':
        return '🎯';
      case 'free_practice':
        return '🚀';
      default:
        return '📝';
    }
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'project_intro':
        return 'プロジェクト紹介';
      case 'guided_step':
        return 'ガイド付き';
      case 'challenge':
        return 'チャレンジ';
      case 'free_practice':
        return '自由制作';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.projectTitle}>{chapter.projectTitle}</Text>
          <Text style={styles.description}>{chapter.description}</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>ステップ</Text>
          {chapter.steps.map((step, index) => {
            const completed = isStepComplete(step.id);
            return (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepCard, completed && styles.stepCardCompleted]}
                onPress={() => handleStepPress(step.id)}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepIcon}>{getStepIcon(step.type)}</Text>
                    <Text style={styles.stepTypeLabel}>{getStepTypeLabel(step.type)}</Text>
                  </View>
                  {completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓ 完了</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
  header: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chapterTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  projectTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepsContainer: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepCardCompleted: {
    backgroundColor: '#F0F9FF',
    borderColor: colors.primary + '40',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepTypeLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
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
});
