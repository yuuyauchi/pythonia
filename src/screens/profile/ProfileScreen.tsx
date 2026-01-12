import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '../../store/profileStore';
import { useLessonProgressStore } from '../../store/lessonProgressStore';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';

export default function ProfileScreen() {
  const {
    userName,
    avatarUri,
    setUserName,
    setAvatarUri,
    getCurrentStreak,
    getLongestStreak,
    getTotalStudyTime,
    getStudyDaysCount,
  } = useProfileStore();

  const { completedSteps } = useLessonProgressStore();

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(userName);

  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const totalStudyTime = getTotalStudyTime();
  const studyDaysCount = getStudyDaysCount();
  const completedStepsCount = completedSteps.size;

  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    } else {
      setTempName(userName);
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        '権限が必要です',
        '画像を選択するには、写真ライブラリへのアクセス権限が必要です。'
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {userName ? userName.charAt(0).toUpperCase() : '?'}
                </Text>
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>📷</Text>
            </View>
          </TouchableOpacity>

          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="名前を入力"
                autoFocus
                maxLength={20}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleSaveName}
                >
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>
                {userName || 'ゲスト'}
              </Text>
              <TouchableOpacity
                style={styles.editNameButton}
                onPress={() => setIsEditingName(true)}
              >
                <Text style={styles.editNameButtonText}>編集</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学習統計</Text>
          
          {/* Streak Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.streakCard]}>
              <Text style={styles.statLabel}>現在の連続日数</Text>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statUnit}>日</Text>
            </View>
            <View style={[styles.statCard, styles.streakCard]}>
              <Text style={styles.statLabel}>最長連続日数</Text>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statUnit}>日</Text>
            </View>
          </View>

          {/* Study Time and Days Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.timeCard]}>
              <Text style={styles.statLabel}>総学習時間</Text>
              <Text style={styles.statValue}>
                {Math.floor(totalStudyTime / 60)}
              </Text>
              <Text style={styles.statUnit}>時間</Text>
            </View>
            <View style={[styles.statCard, styles.timeCard]}>
              <Text style={styles.statLabel}>学習日数</Text>
              <Text style={styles.statValue}>{studyDaysCount}</Text>
              <Text style={styles.statUnit}>日</Text>
            </View>
          </View>

          {/* Completed Steps Card */}
          <View style={[styles.statCard, styles.fullWidthCard]}>
            <Text style={styles.statLabel}>完了したステップ</Text>
            <Text style={styles.statValue}>{completedStepsCount}</Text>
            <Text style={styles.statUnit}>ステップ</Text>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>実績</Text>
          <View style={styles.achievementsContainer}>
            {currentStreak >= 7 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>🔥</Text>
                <Text style={styles.achievementText}>7日連続</Text>
              </View>
            )}
            {longestStreak >= 30 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>⭐</Text>
                <Text style={styles.achievementText}>30日達成</Text>
              </View>
            )}
            {completedStepsCount >= 50 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>🎯</Text>
                <Text style={styles.achievementText}>50ステップ</Text>
              </View>
            )}
            {totalStudyTime >= 600 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>📚</Text>
                <Text style={styles.achievementText}>10時間学習</Text>
              </View>
            )}
            {currentStreak === 0 && completedStepsCount === 0 && (
              <Text style={styles.noAchievements}>
                学習を続けて実績をアンロックしましょう！
              </Text>
            )}
          </View>
        </View>

        {/* Motivational Message */}
        {currentStreak > 0 && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              🎉 素晴らしい！{currentStreak}日連続で学習を続けています！
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.textLight,
    fontSize: 48,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarEditText: {
    fontSize: 16,
  },
  nameContainer: {
    alignItems: 'center',
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  editNameButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editNameButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
  nameEditContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameInput: {
    ...typography.h3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    textAlign: 'center',
    width: '80%',
  },
  editButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.textLight,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  streakCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  timeCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  fullWidthCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '700',
  },
  statUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  achievementBadge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 100,
    ...shadows.small,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  achievementText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  noAchievements: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.lg,
  },
  motivationCard: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.medium,
  },
  motivationText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '600',
  },
});
