import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

export default function HandsOnPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>作る</Text>
      <Text style={styles.description}>
        ここでは、実務に近いミニプロジェクト（ハンズオン）に挑戦できます。
      </Text>
      <Text style={styles.comingSoon}>現在は開発中です。</Text>
      <Text style={styles.comingSoon}>次回アップデートをお楽しみに！</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  comingSoon: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
