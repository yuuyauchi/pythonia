import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import type { QuizFillContent } from '../../types/lesson';

interface QuizFillStepProps {
  content: QuizFillContent;
}

export default function QuizFillStep({ content }: QuizFillStepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswerChange = (blankId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [blankId]: text }));
  };

  const handleSubmit = () => {
    // Check if all blanks are filled
    const allFilled = content.blanks.every((blank) => answers[blank.id]?.trim());
    if (allFilled) {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResult(false);
  };

  const checkAnswer = (blankId: string) => {
    const blank = content.blanks.find((b) => b.id === blankId);
    if (!blank) return false;

    const userAnswer = answers[blankId]?.trim().toLowerCase() || '';
    const correctAnswer = blank.correctAnswer.toLowerCase();

    return userAnswer === correctAnswer;
  };

  const allCorrect = showResult && content.blanks.every((blank) => checkAnswer(blank.id));

  // Replace blanks in code template with input fields or user answers
  const renderCodeWithBlanks = () => {
    const parts = content.codeTemplate.split('______');
    const elements: JSX.Element[] = [];

    parts.forEach((part, index) => {
      // Add the code part
      if (part) {
        elements.push(
          <Text key={`part-${index}`} style={styles.codeText}>
            {part}
          </Text>
        );
      }

      // Add blank/input (except after the last part)
      if (index < content.blanks.length) {
        const blank = content.blanks[index];
        const isCorrect = showResult && checkAnswer(blank.id);
        const isIncorrect = showResult && !isCorrect;

        if (showResult) {
          elements.push(
            <Text
              key={`blank-${index}`}
              style={[
                styles.blankAnswer,
                isCorrect && styles.blankAnswerCorrect,
                isIncorrect && styles.blankAnswerIncorrect,
              ]}
            >
              {answers[blank.id] || '______'}
            </Text>
          );
        } else {
          elements.push(
            <TextInput
              key={`blank-${index}`}
              style={styles.blankInput}
              value={answers[blank.id] || ''}
              onChangeText={(text) => handleAnswerChange(blank.id, text)}
              placeholder="______"
              placeholderTextColor="#888888"
              autoCapitalize="none"
              autoCorrect={false}
            />
          );
        }
      }
    });

    return elements;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>{content.description}</Text>

      {/* Code Template with Blanks */}
      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>コード（空欄を埋めてください）</Text>
        <View style={styles.codeBlock}>
          <View style={styles.codeContent}>{renderCodeWithBlanks()}</View>
        </View>
      </View>

      {/* Hints */}
      {!showResult && content.blanks.some((b) => b.hint) && (
        <View style={styles.hintsContainer}>
          <Text style={styles.hintsLabel}>ヒント：</Text>
          {content.blanks.map((blank, index) => (
            blank.hint && (
              <Text key={blank.id} style={styles.hintText}>
                • {blank.hint}
              </Text>
            )
          ))}
        </View>
      )}

      {/* Submit Button */}
      {!showResult && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            !content.blanks.every((blank) => answers[blank.id]?.trim()) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            !content.blanks.every((blank) => answers[blank.id]?.trim())
          }
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
              allCorrect ? styles.resultBoxCorrect : styles.resultBoxIncorrect,
            ]}
          >
            <Text style={styles.resultTitle}>
              {allCorrect ? '✓ 正解です！' : '✗ 不正解です'}
            </Text>

            {!allCorrect && (
              <View style={styles.correctAnswersContainer}>
                <Text style={styles.correctAnswersTitle}>正解：</Text>
                {content.blanks.map((blank) => (
                  <Text key={blank.id} style={styles.correctAnswerText}>
                    • {blank.correctAnswer}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.resultExplanation}>{content.explanation}</Text>
          </View>

          {!allCorrect && (
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
  description: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  codeContainer: {
    marginBottom: spacing.lg,
  },
  codeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  codeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: '#D4D4D4',
  },
  blankInput: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFF',
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 80,
  },
  blankAnswer: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  blankAnswerCorrect: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  blankAnswerIncorrect: {
    color: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  hintsContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  hintsLabel: {
    ...typography.caption,
    color: '#F57C00',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hintText: {
    ...typography.caption,
    color: '#F57C00',
    marginLeft: spacing.sm,
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
  correctAnswersContainer: {
    marginBottom: spacing.md,
  },
  correctAnswersTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  correctAnswerText: {
    ...typography.body,
    fontFamily: 'monospace',
    marginLeft: spacing.sm,
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
