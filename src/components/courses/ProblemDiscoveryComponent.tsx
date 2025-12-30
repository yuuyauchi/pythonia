import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface Props {
  content: any;
  onComplete: () => void;
}

export default function ProblemDiscoveryComponent({ content, onComplete }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{content.title}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 シナリオ</Text>
          <Text style={styles.sectionText}>{content.scenario.description}</Text>
          <Text style={styles.timeSpent}>⏱️ {content.scenario.timeSpent}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 理想の状態</Text>
          <Text style={styles.sectionText}>{content.idealSolution.description}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>理解しました!</Text>
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
  sectionText: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  timeSpent: { ...typography.body, color: colors.primary, marginTop: spacing.sm, fontWeight: '600' },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 8, alignItems: 'center' },
  buttonText: { ...typography.button, color: '#FFFFFF' },
});
