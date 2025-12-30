import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { getCourse } from '../../lib/courseLoader';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import { usePackageStore } from '../../store/packageStore';
import { PackageInstaller } from '../../components/common/PackageInstaller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'CourseDetail'>;

export default function CourseDetailScreen({ route, navigation }: Props) {
  const { courseId } = route.params as { courseId: string };
  const course = getCourse(courseId);
  const { hasCourseAccess, subscribe } = useSubscriptionStore();
  const { isStepComplete } = useLessonProgressStore();
  const { isPackageInstalled } = usePackageStore();
  const [showPackageInstaller, setShowPackageInstaller] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    moduleId: string;
  } | null>(null);

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Course not found</Text>
      </SafeAreaView>
    );
  }

  const hasAccess = hasCourseAccess(courseId);

  const checkAndInstallPackages = (moduleId: string) => {
    // Check if course requires any packages
    const requiredPackages = course.libraries || [];

    if (requiredPackages.length === 0) {
      // No packages required, navigate directly
      navigation.navigate('CourseStep', { courseId, moduleId });
      return;
    }

    // Check if all packages are already installed
    const missingPackages = requiredPackages.filter(
      (pkg) => !isPackageInstalled(pkg)
    );

    if (missingPackages.length === 0) {
      // All packages already installed, navigate directly
      navigation.navigate('CourseStep', { courseId, moduleId });
      return;
    }

    // Need to install packages
    setPendingNavigation({ moduleId });
    setShowPackageInstaller(true);
  };

  const handlePackageInstallComplete = (success: boolean) => {
    setShowPackageInstaller(false);

    if (success && pendingNavigation) {
      // Navigate to the course step
      navigation.navigate('CourseStep', {
        courseId,
        moduleId: pendingNavigation.moduleId,
      });
    }

    setPendingNavigation(null);
  };

  const handlePackageInstallCancel = () => {
    setShowPackageInstaller(false);
    setPendingNavigation(null);
  };

  const handleModulePress = (moduleId: string) => {
    if (!hasAccess) {
      Alert.alert(
        'プレミアムコンテンツ',
        'このコースを受講するにはサブスクリプションが必要です。',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'プランを見る',
            onPress: () => navigation.navigate('Subscription'),
          },
        ]
      );
      return;
    }

    checkAndInstallPackages(moduleId);
  };

  const handleStartCourse = () => {
    if (!hasAccess) {
      Alert.alert(
        'サブスクリプション登録',
        'デモモードのため、スタンダードプランに自動登録します',
        [
          {
            text: 'OK',
            onPress: () => {
              subscribe('standard');
              const firstModule = course.modules[0];
              if (firstModule) {
                checkAndInstallPackages(firstModule.id);
              }
            },
          },
        ]
      );
      return;
    }

    const firstModule = course.modules[0];
    if (firstModule) {
      checkAndInstallPackages(firstModule.id);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'problem_discovery':
        return '🔍';
      case 'planning':
        return '📋';
      case 'implementation':
        return '💻';
      case 'reflection':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getModuleTypeLabel = (type: string) => {
    switch (type) {
      case 'problem_discovery':
        return '課題発見';
      case 'planning':
        return '設計';
      case 'implementation':
        return '実装';
      case 'reflection':
        return '振り返り';
      default:
        return '';
    }
  };

  const completedModules = course.modules.filter((m) => isStepComplete(m.id)).length;
  const progress = (completedModules / course.modules.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Course Header */}
        <View style={styles.courseHeader}>
          <Text style={styles.courseThumbnail}>{course.thumbnail}</Text>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={styles.courseMeta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{course.difficulty}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
          </View>
          <Text style={styles.courseDescription}>{course.description}</Text>
        </View>

        {/* Learning Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 学習目標</Text>
          {course.learningGoals.map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <Text style={styles.goalBullet}>✓</Text>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>

        {/* Libraries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 使用ライブラリ</Text>
          <View style={styles.librariesList}>
            {course.libraries.map((lib, index) => (
              <View key={index} style={styles.libraryTag}>
                <Text style={styles.libraryText}>{lib}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress */}
        {hasAccess && completedModules > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 進捗</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedModules} / {course.modules.length} モジュール完了
            </Text>
          </View>
        )}

        {/* Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 カリキュラム</Text>
          {course.modules.map((module, index) => {
            const completed = isStepComplete(module.id);
            const locked = !hasAccess && index > 0; // First module is free preview

            return (
              <TouchableOpacity
                key={module.id}
                style={[
                  styles.moduleCard,
                  completed && styles.moduleCardCompleted,
                  locked && styles.moduleCardLocked,
                ]}
                onPress={() => handleModulePress(module.id)}
                disabled={locked}
              >
                <View style={styles.moduleNumber}>
                  <Text style={styles.moduleNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.moduleContent}>
                  <View style={styles.moduleHeader}>
                    <Text style={styles.moduleIcon}>{getModuleIcon(module.type)}</Text>
                    <Text style={styles.moduleType}>
                      {getModuleTypeLabel(module.type)}
                    </Text>
                  </View>
                  {locked && (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>🔒 要サブスク</Text>
                    </View>
                  )}
                  {completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓ 完了</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Start Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartCourse}
          >
            <Text style={styles.startButtonText}>
              {hasAccess ? 'コースを始める' : 'サブスクして始める'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Package Installer Modal */}
      <PackageInstaller
        visible={showPackageInstaller}
        packages={course.libraries || []}
        onComplete={handlePackageInstallComplete}
        onCancel={handlePackageInstallCancel}
      />
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
  courseHeader: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  courseThumbnail: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  courseTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  courseDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  goalBullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  goalText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  librariesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  libraryTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  libraryText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  moduleCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moduleCardCompleted: {
    backgroundColor: '#E8F5E9',
  },
  moduleCardLocked: {
    opacity: 0.6,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
  },
  moduleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moduleIcon: {
    fontSize: 20,
  },
  moduleType: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  lockedBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lockedText: {
    ...typography.caption,
    color: '#F57C00',
    fontSize: 11,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  startButtonContainer: {
    padding: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 18,
  },
});
