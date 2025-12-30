import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface Props {
  content: any;
  onComplete: () => void;
}

export default function PlanningComponent({ content, onComplete }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{content.title}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 開発計画</Text>
          {content.developmentPlan.steps.map((step: any) => (
            <View key={step.step} style={styles.stepItem}>
              <Text style={styles.stepNumber}>{step.step}</Text>
              <Text style={styles.stepText}>{step.title}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>実装を始める!</Text>
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
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  stepItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  stepNumber: { ...typography.button, color: colors.primary, fontWeight: '700' },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 8, alignItems: 'center' },
  buttonText: { ...typography.button, color: '#FFFFFF' },
});
