import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { useSubscriptionStore, type SubscriptionPlan } from '../../store/subscriptionStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function SubscriptionScreen({ navigation }: Props) {
  const { subscribe, isActive, plan } = useSubscriptionStore();

  const plans = [
    {
      id: 'basic' as SubscriptionPlan,
      name: 'ベーシック',
      price: 500,
      features: ['初級コース3つまで', '基本的なライブラリ学習'],
      recommended: false,
    },
    {
      id: 'standard' as SubscriptionPlan,
      name: 'スタンダード',
      price: 1000,
      features: ['全コースアクセス', '新コース毎月追加', 'コミュニティ参加'],
      recommended: true,
    },
    {
      id: 'premium' as SubscriptionPlan,
      name: 'プレミアム',
      price: 2000,
      features: [
        '全コース + プロジェクト添削',
        '個別質問対応(月3回)',
        '先行アクセス',
      ],
      recommended: false,
    },
  ];

  const handleSubscribe = (selectedPlan: SubscriptionPlan) => {
    Alert.alert(
      `${selectedPlan}プランに登録`,
      'デモモードのため、実際の決済は行われません。登録しますか?',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '登録する',
          onPress: () => {
            subscribe(selectedPlan);
            Alert.alert(
              '登録完了!',
              `${selectedPlan}プランに登録されました。全てのコースをお楽しみください!`,
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>プレミアムプラン</Text>
          <Text style={styles.subtitle}>
            実践的な開発スキルを身につけよう
          </Text>
        </View>

        {isActive && (
          <View style={styles.currentPlanBanner}>
            <Text style={styles.currentPlanText}>
              現在のプラン: {plan}
            </Text>
          </View>
        )}

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>プレミアムの特典</Text>
          <View style={styles.benefitsList}>
            {[
              '実務で使えるライブラリを習得',
              '課題発見から実装までの実践',
              '毎月新しいコースを追加',
              '進捗管理とプロジェクト記録',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>プランを選択</Text>
          {plans.map((planItem) => (
            <View
              key={planItem.id}
              style={[
                styles.planCard,
                planItem.recommended && styles.recommendedPlan,
              ]}
            >
              {planItem.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>おすすめ</Text>
                </View>
              )}
              <Text style={styles.planName}>{planItem.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>¥{planItem.price}</Text>
                <Text style={styles.priceUnit}>/月</Text>
              </View>
              <View style={styles.featuresList}>
                {planItem.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  planItem.recommended && styles.subscribeButtonRecommended,
                  isActive &&
                    plan === planItem.id &&
                    styles.subscribeButtonDisabled,
                ]}
                onPress={() => handleSubscribe(planItem.id)}
                disabled={isActive && plan === planItem.id}
              >
                <Text
                  style={[
                    styles.subscribeButtonText,
                    planItem.recommended && styles.subscribeButtonTextRecommended,
                  ]}
                >
                  {isActive && plan === planItem.id ? '加入中' : '始める'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  currentPlanBanner: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  currentPlanText: {
    ...typography.body,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '600',
  },
  benefitsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitIcon: {
    ...typography.h3,
    color: colors.primary,
  },
  benefitText: {
    ...typography.body,
    color: colors.text,
  },
  plansSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recommendedPlan: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  planName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  price: {
    ...typography.h1,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  featuresList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureBullet: {
    ...typography.body,
    color: colors.textSecondary,
  },
  featureText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonRecommended: {
    backgroundColor: colors.primary,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  subscribeButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  subscribeButtonTextRecommended: {
    color: '#FFFFFF',
  },
});
