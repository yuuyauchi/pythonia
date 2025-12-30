import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { getCoursesByCategory, hasCourseContent } from '../../lib/courseLoader';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CourseCategory } from '../../lib/courseLoader';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function CoursesHomeScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('beginner');
  const { isActive, plan } = useSubscriptionStore();

  const categories: Array<{ key: CourseCategory; label: string }> = [
    { key: 'beginner', label: '初級' },
    { key: 'intermediate', label: '中級' },
    { key: 'advanced', label: '上級' },
  ];

  const courses = getCoursesByCategory(selectedCategory);

  const handleCoursePress = (courseId: string) => {
    navigation.navigate('CourseDetail', { courseId });
  };

  const handleSubscribe = () => {
    // TODO: Navigate to subscription screen
    navigation.navigate('Subscription');
  };

  const renderCourseCard = (course: typeof courses[0]) => {
    const hasContent = hasCourseContent(course.id);

    return (
      <TouchableOpacity
        key={course.id}
        style={styles.courseCard}
        onPress={() => handleCoursePress(course.id)}
      >
        <View style={styles.courseThumbnail}>
          <Text style={styles.courseThumbnailEmoji}>{course.thumbnail}</Text>
        </View>
        <View style={styles.courseInfo}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={styles.courseBadges}>
              {!hasContent && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>準備中</Text>
                </View>
              )}
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{course.difficulty}</Text>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{course.duration}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {course.description}
          </Text>
          <View style={styles.courseTags}>
            {course.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.courseLibraries}>
            <Text style={styles.librariesLabel}>使用ライブラリ: </Text>
            <Text style={styles.librariesText}>
              {course.libraries.join(', ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>作る</Text>
          <Text style={styles.subtitle}>実践的な開発コース</Text>
        </View>

        {/* Subscription Status */}
        {!isActive ? (
          <TouchableOpacity
            style={styles.subscriptionBanner}
            onPress={handleSubscribe}
          >
            <Text style={styles.bannerTitle}>🎯 プレミアムプランで全コース受講</Text>
            <Text style={styles.bannerText}>
              月額1,000円で全ての実践コースが受け放題!
            </Text>
            <View style={styles.subscribeButton}>
              <Text style={styles.subscribeButtonText}>詳細を見る</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerText}>
              ✨ {plan}プラン加入中 - 全コース利用可能
            </Text>
          </View>
        )}

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryTab,
                selectedCategory === cat.key && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === cat.key && styles.categoryTabTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Course List */}
        <View style={styles.courseList}>
          {courses.map(renderCourseCard)}
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
    ...typography.body,
    color: colors.textSecondary,
  },
  subscriptionBanner: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
  },
  bannerTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  bannerText: {
    ...typography.body,
    color: '#FFFFFF',
    marginBottom: spacing.md,
    opacity: 0.95,
  },
  subscribeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  subscribeButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  activeBanner: {
    backgroundColor: '#E8F5E9',
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  activeBannerText: {
    ...typography.body,
    color: '#2E7D32',
    textAlign: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryTabText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  courseList: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: 100,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseThumbnailEmoji: {
    fontSize: 48,
  },
  courseInfo: {
    flex: 1,
    padding: spacing.md,
  },
  courseHeader: {
    marginBottom: spacing.xs,
  },
  courseTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  courseBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  comingSoonBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F57C00',
  },
  comingSoonText: {
    ...typography.caption,
    color: '#F57C00',
    fontSize: 11,
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  durationBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  courseDescription: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  courseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  courseLibraries: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  librariesLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  librariesText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
