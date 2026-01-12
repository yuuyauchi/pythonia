import { useState, useEffect, useCallback } from 'react';
import { iapService, Product, ProductId, PurchaseResult } from './iapService.mock';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Alert } from 'react-native';

export function useInAppPurchase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { subscribe, purchaseCourse } = useSubscriptionStore();

  /**
   * IAPを初期化して商品を読み込み
   */
  useEffect(() => {
    let mounted = true;

    const initializeIAP = async () => {
      setIsLoading(true);
      try {
        const initialized = await iapService.initialize();
        if (initialized && mounted) {
          const loadedProducts = iapService.getProducts();
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error('Failed to initialize IAP', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeIAP();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * 商品を購入
   */
  const purchaseProduct = useCallback(
    async (productId: ProductId): Promise<boolean> => {
      setIsPurchasing(true);

      try {
        const result: PurchaseResult = await iapService.purchase(productId);

        if (result.success && result.productId) {
          // 購入成功 - プレミアムプランを有効化
          subscribe('premium');

          Alert.alert(
            '購入完了',
            'すべてのコンテンツにアクセスできるようになりました！',
            [{ text: 'OK' }]
          );

          return true;
        } else {
          // 購入失敗
          if (result.error && result.error !== 'User cancelled the purchase') {
            Alert.alert(
              '購入エラー',
              result.error || '購入に失敗しました。もう一度お試しください。',
              [{ text: 'OK' }]
            );
          }

          return false;
        }
      } catch (error: any) {
        console.error('Purchase error', error);
        Alert.alert(
          '購入エラー',
          '予期しないエラーが発生しました。',
          [{ text: 'OK' }]
        );
        return false;
      } finally {
        setIsPurchasing(false);
      }
    },
    [subscribe]
  );

  /**
   * 購入を復元
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);

    try {
      const restoredProductIds = await iapService.restorePurchases();

      if (restoredProductIds.length > 0) {
        // 購入を復元
        subscribe('premium');

        Alert.alert(
          '復元完了',
          'すべてのコンテンツにアクセスできるようになりました。',
          [{ text: 'OK' }]
        );

        return true;
      } else {
        Alert.alert(
          '復元結果',
          '復元可能な購入が見つかりませんでした。',
          [{ text: 'OK' }]
        );

        return false;
      }
    } catch (error) {
      console.error('Restore error', error);
      Alert.alert(
        '復元エラー',
        '購入の復元に失敗しました。',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [subscribe]);

  /**
   * 商品情報を取得
   */
  const getProduct = useCallback(
    (productId: ProductId): Product | undefined => {
      return products.find(p => p.productId === productId);
    },
    [products]
  );

  return {
    products,
    isLoading,
    isPurchasing,
    isRestoring,
    purchaseProduct,
    restorePurchases,
    getProduct,
  };
}
