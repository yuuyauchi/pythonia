import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface Props {
  content: any;
  onComplete: () => void;
}

export default function ReflectionComponent({ content, onComplete }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{content.title}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎉 達成したこと</Text>
          {content.summary.achievements.map((achievement: string, index: number) => (
            <View key={index} style={styles.achievementItem}>
              <Text style={styles.bullet}>✓</Text>
              <Text style={styles.text}>{achievement}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 改善効果</Text>
          <Text style={styles.improvement}>{content.beforeAfter.improvement}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 次のステップ</Text>
          <Text style={styles.text}>{content.nextChallenge.encouragement}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>完了!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  achievementItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  bullet: { ...typography.body, color: colors.primary, fontWeight: '700' },
  text: { ...typography.body, color: colors.textSecondary, flex: 1, lineHeight: 24 },
  improvement: { ...typography.h3, color: colors.primary, textAlign: 'center', padding: spacing.md, backgroundColor: colors.primary + '15', borderRadius: 8 },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 8, alignItems: 'center' },
  buttonText: { ...typography.button, color: '#FFFFFF' },
});
