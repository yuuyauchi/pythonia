import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import type { ConsoleOutput } from '../../store/editorStore';

interface ConsoleViewProps {
  output: ConsoleOutput[];
  onClear: () => void;
}

export default function ConsoleView({ output, onClear }: ConsoleViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (output.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [output.length]);

  const getOutputStyle = (type: ConsoleOutput['type']) => {
    switch (type) {
      case 'stderr':
        return styles.errorText;
      case 'info':
        return styles.infoText;
      default:
        return styles.outputText;
    }
  };

  const getOutputPrefix = (type: ConsoleOutput['type']) => {
    switch (type) {
      case 'stderr':
        return '❌ ';
      case 'info':
        return 'ℹ️ ';
      default:
        return '▶ ';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>コンソール</Text>
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>クリア</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {output.length === 0 ? (
          <Text style={styles.emptyText}>
            コードを実行すると、結果がここに表示されます
          </Text>
        ) : (
          output.map((item, index) => (
            <View key={index} style={styles.outputLine}>
              <Text style={getOutputStyle(item.type)}>
                {getOutputPrefix(item.type)}
                {item.text}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#2D2D2D',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    ...typography.caption,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    color: '#888888',
    fontStyle: 'italic',
  },
  outputLine: {
    marginBottom: spacing.xs,
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#D4D4D4',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#F48771',
  },
  infoText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#4FC1FF',
  },
});
