import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import type { ProjectIntro } from '../../lib/practiceLoader';

interface Props {
  content: ProjectIntro;
  onComplete: () => void;
}

export default function ProjectIntroComponent({ content, onComplete }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>{content.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{content.description}</Text>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 学習目標</Text>
          <View style={styles.goalsList}>
            {content.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Text style={styles.goalBullet}>✓</Text>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final Output Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 完成イメージ</Text>
          <View style={styles.outputPreview}>
            <Text style={styles.outputText}>{content.finalOutput}</Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={onComplete}>
          <Text style={styles.startButtonText}>さあ、始めましょう!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  goalsList: {
    gap: spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  goalBullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  goalText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  outputPreview: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  outputText: {
    ...typography.body,
    fontFamily: 'monospace',
    color: colors.text,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
