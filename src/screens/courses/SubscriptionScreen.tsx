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
import { useInAppPurchase } from '../../lib/useInAppPurchase';
import { PRODUCT_IDS } from '../../lib/iapService.mock';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function SubscriptionScreen({ navigation }: Props) {
  const { isActive, plan } = useSubscriptionStore();
  const {
    products,
    isLoading,
    isPurchasing,
    isRestoring,
    purchaseProduct,
    restorePurchases,
  } = useInAppPurchase();

  const purchaseOption = {
    id: 'premium' as SubscriptionPlan,
    productId: PRODUCT_IDS.ALL_CONTENT,
    name: '全コンテンツアクセス',
    price: 1000,
    features: [
      '全13コース完全アクセス',
      '初級から上級まで学び放題',
      'Web開発・機械学習・DB操作',
      '進捗管理・バッジ機能',
      '買い切り - 追加課金なし',
    ],
  };

  const handleSubscribe = async (productId: string) => {
    if (isPurchasing) return;
    
    await purchaseProduct(productId as any);
  };

  const handleRestore = async () => {
    if (isRestoring) return;
    
    await restorePurchases();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>全コンテンツアクセス</Text>
          <Text style={styles.subtitle}>
            ¥1,000買い切りですべてのコースが学び放題
          </Text>
        </View>

        {isActive && (
          <View style={styles.currentPlanBanner}>
            <Text style={styles.currentPlanText}>
              購入済み - すべてのコンテンツにアクセスできます
            </Text>
          </View>
        )}

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>含まれる内容</Text>
          <View style={styles.benefitsList}>
            {purchaseOption.features.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.plansSection}>
          <View style={styles.planCard}>
            <Text style={styles.planName}>{purchaseOption.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>¥{purchaseOption.price}</Text>
              <Text style={styles.priceUnit}>買い切り</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                styles.subscribeButtonRecommended,
                (isActive || isPurchasing) && styles.subscribeButtonDisabled,
              ]}
              onPress={() => handleSubscribe(purchaseOption.productId)}
              disabled={isActive || isPurchasing}
            >
              <Text
                style={[
                  styles.subscribeButtonText,
                  styles.subscribeButtonTextRecommended,
                ]}
              >
                {isPurchasing ? '処理中...' : (isActive ? '購入済み' : '購入する')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 購入復元ボタン */}
        <View style={styles.restoreSection}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            <Text style={styles.restoreButtonText}>
              {isRestoring ? '復元中...' : '購入を復元'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.restoreHint}>
            以前購入したコンテンツを復元できます
          </Text>
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
  restoreSection: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  restoreButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  restoreButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  restoreHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
