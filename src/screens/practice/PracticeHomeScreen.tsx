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
import { getPracticeChapters } from '../../lib/practiceLoader';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function PracticeHomeScreen({ navigation }: Props) {
  const chapters = getPracticeChapters();
  const { getChapterProgress, currentChapterId } = useLessonProgressStore();

  const handleChapterPress = (chapterId: string) => {
    navigation.navigate('PracticeDetail', { chapterId });
  };

  const renderChapterCard = (chapter: typeof chapters[0]) => {
    const stepIds = chapter.steps.map((s) => s.id);
    const progress = getChapterProgress(chapter.id, stepIds);
    const isInProgress = progress.completed > 0 && progress.completed < progress.total;
    const isCompleted = progress.completed === progress.total;
    const isCurrent = currentChapterId === chapter.id;

    let statusText = '未着手';
    let statusColor = colors.textSecondary;
    if (isCompleted) {
      statusText = '完了';
      statusColor = '#4CAF50';
    } else if (isInProgress) {
      statusText = '進行中';
      statusColor = colors.primary;
    }

    return (
      <TouchableOpacity
        key={chapter.id}
        style={[styles.chapterCard, isCurrent && styles.currentChapterCard]}
        onPress={() => handleChapterPress(chapter.id)}
      >
        <View style={styles.chapterHeader}>
          <View style={styles.chapterTitleContainer}>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
            <Text style={styles.projectTitle}>{chapter.projectTitle}</Text>
          </View>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
        <Text style={styles.chapterDescription}>{chapter.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completed} / {progress.total}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>書く</Text>
          <Text style={styles.subtitle}>実践プロジェクト</Text>
          <Text style={styles.description}>
            学んだことを活かして、実際にプログラムを作ってみましょう!
          </Text>
        </View>

        {/* Current Progress Card */}
        {currentChapterId && (
          <View style={styles.continueCard}>
            <Text style={styles.continueTitle}>続きから始める</Text>
            <Text style={styles.continueChapter}>
              {chapters.find((ch) => ch.id === currentChapterId)?.projectTitle}
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => handleChapterPress(currentChapterId)}
            >
              <Text style={styles.continueButtonText}>続きを作る</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Chapter List */}
        <View style={styles.chapterList}>
          <Text style={styles.sectionTitle}>全9プロジェクト</Text>
          {chapters.map(renderChapterCard)}
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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  continueCard: {
    backgroundColor: colors.primary + '15',
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  continueTitle: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  continueChapter: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  chapterList: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chapterCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currentChapterCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  chapterTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  chapterTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  projectTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  chapterDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
});
