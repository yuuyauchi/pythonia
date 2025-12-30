import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface CodeEditorProps {
  value: string;
  onChange: (text: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const lines = value.split('\n');
  const lineCount = lines.length;

  return (
    <View style={styles.container}>
      {/* Line Numbers */}
      <ScrollView
        style={styles.lineNumbers}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((_, index) => (
          <Text key={index} style={styles.lineNumber}>
            {index + 1}
          </Text>
        ))}
      </ScrollView>

      {/* Code Input */}
      <View style={styles.editorScroll}>
        <TextInput
          style={[styles.editor, readOnly && styles.editorReadOnly]}
          value={value}
          onChangeText={onChange}
          multiline
          editable={!readOnly}
          placeholder={readOnly ? '' : 'ここにPythonコードを書いてください...'}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          textAlignVertical="top"
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  lineNumbers: {
    backgroundColor: '#E8E8E8',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: '#D0D0D0',
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'right',
    minWidth: 30,
  },
  editorScroll: {
    flex: 1,
  },
  editor: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    padding: spacing.sm,
    flex: 1,
  },
  editorReadOnly: {
    backgroundColor: '#FAFAFA',
    color: colors.textSecondary,
  },
});
