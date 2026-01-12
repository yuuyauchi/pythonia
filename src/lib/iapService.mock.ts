// モックIAPサービス（開発用）
import { Platform } from 'react-native';

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

class MockIAPService {
  private isInitialized = false;
  private products: Product[] = [
    {
      productId: PRODUCT_IDS.ALL_CONTENT,
      title: '全コンテンツアクセス',
      description: '買い切り - すべてのコースにアクセス',
      price: '¥1,000',
      priceAmountMicros: 1000000000,
      currency: 'JPY',
    },
  ];

  async initialize(): Promise<boolean> {
    console.log('🧪 Mock IAP: Initializing...');
    this.isInitialized = true;
    return true;
  }

  async loadProducts(): Promise<Product[]> {
    console.log('🧪 Mock IAP: Loading products...');
    return this.products;
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProduct(productId: ProductId): Product | undefined {
    return this.products.find(p => p.productId === productId);
  }

  async purchase(productId: ProductId): Promise<PurchaseResult> {
    console.log('🧪 Mock IAP: Simulating purchase for', productId);

    // シミュレーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      productId,
      transactionId: 'mock_transaction_' + Date.now(),
    };
  }

  async restorePurchases(): Promise<string[]> {
    console.log('🧪 Mock IAP: Simulating restore...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // デモ用に空の配列を返す（実際の復元なし）
    return [];
  }

  async disconnect(): Promise<void> {
    console.log('🧪 Mock IAP: Disconnecting...');
    this.isInitialized = false;
  }
}

export const iapService = new MockIAPService();
