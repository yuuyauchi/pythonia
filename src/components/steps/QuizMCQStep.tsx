import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import type { QuizMCQContent } from '../../types/lesson';

interface QuizMCQStepProps {
  content: QuizMCQContent;
}

export default function QuizMCQStep({ content }: QuizMCQStepProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleChoicePress = (choiceId: string) => {
    if (showResult) return; // Already answered
    setSelectedChoice(choiceId);
  };

  const handleSubmit = () => {
    if (selectedChoice) {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setSelectedChoice(null);
    setShowResult(false);
  };

  const isCorrect = selectedChoice === content.correctChoiceId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.question}>{content.question}</Text>

      {/* Code Block (if exists) */}
      {content.code && (
        <View style={styles.codeContainer}>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{content.code}</Text>
          </View>
        </View>
      )}

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {content.choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const isCorrectChoice = choice.id === content.correctChoiceId;
          const showCorrect = showResult && isCorrectChoice;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={choice.id}
              style={[
                styles.choiceButton,
                isSelected && !showResult && styles.choiceButtonSelected,
                showCorrect && styles.choiceButtonCorrect,
                showIncorrect && styles.choiceButtonIncorrect,
              ]}
              onPress={() => handleChoicePress(choice.id)}
              disabled={showResult}
            >
              <View style={styles.choiceContent}>
                <View
                  style={[
                    styles.choiceRadio,
                    isSelected && !showResult && styles.choiceRadioSelected,
                    showCorrect && styles.choiceRadioCorrect,
                    showIncorrect && styles.choiceRadioIncorrect,
                  ]}
                >
                  {showCorrect && <Text style={styles.checkMark}>✓</Text>}
                  {showIncorrect && <Text style={styles.crossMark}>✗</Text>}
                </View>
                <Text
                  style={[
                    styles.choiceText,
                    isSelected && !showResult && styles.choiceTextSelected,
                  ]}
                >
                  {choice.text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit Button */}
      {!showResult && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedChoice && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedChoice}
        >
          <Text style={styles.submitButtonText}>答え合わせ</Text>
        </TouchableOpacity>
      )}

      {/* Result */}
      {showResult && (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultBox,
              isCorrect ? styles.resultBoxCorrect : styles.resultBoxIncorrect,
            ]}
          >
            <Text style={styles.resultTitle}>
              {isCorrect ? '✓ 正解です！' : '✗ 不正解です'}
            </Text>
            <Text style={styles.resultExplanation}>{content.explanation}</Text>
          </View>

          {!isCorrect && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>もう一度挑戦</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  question: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 28,
  },
  codeContainer: {
    marginBottom: spacing.lg,
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: '#D4D4D4',
  },
  choicesContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  choiceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  choiceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  choiceButtonCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  choiceButtonIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceRadioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  choiceRadioCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  choiceRadioIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#F44336',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  crossMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  choiceText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  choiceTextSelected: {
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  resultContainer: {
    marginTop: spacing.md,
  },
  resultBox: {
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  resultBoxCorrect: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resultBoxIncorrect: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  resultTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  resultExplanation: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});
