import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';

// Product IDs - これらはApp Store Connectで設定したIDと一致させる必要があります
export const PRODUCT_IDS = {
  ALL_CONTENT: 'com.pythonia.allcontent',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

class IAPService {
  private isInitialized = false;
  private products: Product[] = [];

  /**
   * IAPシステムを初期化
   */
  async initialize(): Promise<boolean> {
    try {
      // iOS以外では初期化しない
      if (Platform.OS !== 'ios') {
        console.log('IAP: Not iOS, skipping initialization');
        return false;
      }

      // 既に初期化済みならスキップ
      if (this.isInitialized) {
        console.log('IAP: Already initialized');
        return true;
      }

      // IAPに接続
      await InAppPurchases.connectAsync();
      console.log('IAP: Connected successfully');

      // 商品情報を取得
      await this.loadProducts();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('IAP: Initialization failed', error);
      return false;
    }
  }

  /**
   * 商品情報を取得
   */
  async loadProducts(): Promise<Product[]> {
    try {
      const productIds = Object.values(PRODUCT_IDS);

      const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        this.products = results as Product[];
        console.log('IAP: Loaded products', this.products.length);
        return this.products;
      } else {
        console.warn('IAP: Failed to load products', responseCode);
        return [];
      }
    } catch (error) {
      console.error('IAP: Error loading products', error);
      return [];
    }
  }

  /**
   * 商品を取得
   */
  getProducts(): Product[] {
    return this.products;
  }

  /**
   * 特定の商品を取得
   */
  getProduct(productId: ProductId): Product | undefined {
    return this.products.find(p => p.productId === productId);
  }

  /**
   * 購入を実行
   */
  async purchase(productId: ProductId): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('IAP: Initiating purchase for', productId);

      // 購入を開始
      await InAppPurchases.purchaseItemAsync(productId);

      // 購入履歴を取得して検証
      const history = await InAppPurchases.getPurchaseHistoryAsync();

      if (history.responseCode === InAppPurchases.IAPResponseCode.OK) {
        const purchase = history.results.find(
          (p: any) => p.productId === productId
        );

        if (purchase) {
          // 購入を確認（消費型でない場合は必要）
          await InAppPurchases.finishTransactionAsync(purchase, true);

          console.log('IAP: Purchase successful', productId);

          return {
            success: true,
            productId: purchase.productId,
            transactionId: purchase.transactionIdentifier || purchase.orderId,
          };
        }
      }

      return {
        success: false,
        error: 'Purchase not found in history',
      };
    } catch (error: any) {
      console.error('IAP: Purchase failed', error);

      // ユーザーがキャンセルした場合
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: 'User cancelled the purchase',
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed',
      };
    }
  }

  /**
   * 購入履歴を復元
   */
  async restorePurchases(): Promise<string[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('IAP: Restoring purchases');

      const history = await InAppPurchases.getPurchaseHistoryAsync();

      if (history.responseCode === InAppPurchases.IAPResponseCode.OK) {
        const productIds = history.results
          .map((p: any) => p.productId)
          .filter((id: string) => Object.values(PRODUCT_IDS).includes(id as ProductId));

        console.log('IAP: Restored purchases', productIds);
        return productIds;
      }

      return [];
    } catch (error) {
      console.error('IAP: Restore failed', error);
      return [];
    }
  }

  /**
   * 接続を切断
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isInitialized && Platform.OS === 'ios') {
        await InAppPurchases.disconnectAsync();
        this.isInitialized = false;
        console.log('IAP: Disconnected');
      }
    } catch (error) {
      console.error('IAP: Disconnect failed', error);
    }
  }
}

// シングルトンインスタンス
export const iapService = new IAPService();
