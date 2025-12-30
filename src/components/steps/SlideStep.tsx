import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import type { SlideContent } from '../../types/lesson';

interface SlideStepProps {
  content: SlideContent;
}

export default function SlideStep({ content }: SlideStepProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{content.title}</Text>
      <View style={styles.bulletsContainer}>
        {content.bullets.map((bullet, index) => (
          <View key={index} style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  bulletsContainer: {
    gap: spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    ...typography.h3,
    color: colors.primary,
    marginRight: spacing.md,
    marginTop: 2,
  },
  bulletText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
});
