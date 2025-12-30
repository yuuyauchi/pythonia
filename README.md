# Pythonia - Python学習アプリ

Pythonの基礎を学びながら、実際にコードを書いて実行できるiOS向け学習アプリです。

## プロジェクト概要

Pythoniaは、プログラミング未経験者から初級者をターゲットにした、インタラクティブなPython学習アプリケーションです。完全オフラインで動作し、WebView + Pyodideを使用してローカルでPythonコードを実行できます。

### 主な特徴

- **完全オフライン動作**: インターネット接続なしで学習・実行が可能
- **実践的な学習**: スライド、クイズ、コーディング課題を組み合わせた9章構成
- **リアルタイム実行**: Pyodideを使用したブラウザベースのPython実行環境
- **問題解決型コース**: 実際の問題を解決しながら学ぶ実践コース
- **パッケージ管理**: 必要なPythonライブラリの自動インストール
- **シンプルなUI**: React Navigationによる直感的な4タブ構成
- **改善されたコードエディタ**: 行番号表示、適切なレイアウト、複数ファイル対応

## 技術スタック

### フレームワーク・ライブラリ
- **React Native**: 0.81.5
- **Expo**: ~54.0.30
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### 主要な依存関係
- `@react-navigation/native` - ナビゲーション
- `@react-navigation/bottom-tabs` - タブナビゲーション
- `@react-navigation/native-stack` - スタックナビゲーション
- `zustand` - 状態管理
- `@react-native-async-storage/async-storage` - ローカルストレージ
- `react-native-webview` - Python実行環境（Pyodide）
- `date-fns` - 日付処理

## プロジェクト構造

```
pythonia/
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   │   ├── common/         # 共通コンポーネント（PythonWebView, PackageInstallerなど）
│   │   ├── courses/        # コース関連コンポーネント
│   │   ├── editor/         # エディタ関連コンポーネント
│   │   ├── lessons/        # レッスン関連コンポーネント
│   │   ├── practice/       # 練習問題関連コンポーネント
│   │   ├── profile/        # プロフィール関連コンポーネント
│   │   └── steps/          # ステップ型別コンポーネント
│   ├── constants/          # 定数・テーマ定義
│   ├── lib/                # ユーティリティ・ライブラリ
│   │   ├── pythonRunner.ts # Python実行ランナー
│   │   ├── courseLoader.ts # コースデータローダー
│   │   ├── lessonLoader.ts # レッスンデータローダー
│   │   └── practiceLoader.ts # 練習問題データローダー
│   ├── navigation/         # ナビゲーション設定
│   │   ├── BottomTabNavigator.tsx
│   │   ├── CoursesStackNavigator.tsx
│   │   ├── LessonsStackNavigator.tsx
│   │   └── PracticeStackNavigator.tsx
│   ├── screens/            # 画面コンポーネント
│   │   ├── courses/        # コースタブ
│   │   ├── editor/         # エディタタブ
│   │   ├── lessons/        # 学ぶタブ
│   │   ├── practice/       # 練習問題タブ
│   │   └── profile/        # プロフィールタブ
│   ├── store/              # Zustand状態管理
│   │   ├── editorStore.ts
│   │   ├── lessonProgressStore.ts
│   │   ├── packageStore.ts
│   │   ├── profileStore.ts
│   │   └── subscriptionStore.ts
│   ├── types/              # TypeScript型定義
│   └── utils/              # ユーティリティ関数
├── assets/                 # 静的アセット
│   ├── courses/           # コースデータ（JSON）
│   ├── lessons/           # レッスンデータ（JSON）
│   └── practice/          # 練習問題データ（JSON）
├── webview/                # Python実行用WebViewコンテンツ
├── .mcp.json              # MCPサーバー設定
├── App.tsx                # アプリケーションエントリポイント
└── package.json
```

## セットアップ

### 前提条件

- Node.js (v18以上推奨)
- npm または yarn
- Expo CLI
- iOS Simulator (macOS) または Android Studio (Androidの場合)

### インストール手順

1. リポジトリのクローン
```bash
git clone <repository-url>
cd pythonia
```

2. 依存関係のインストール
```bash
npm install
```

3. アプリの起動
```bash
# 開発サーバーの起動
npm start

# iOSシミュレータで実行
npm run ios

# Androidエミュレータで実行
npm run android

# Webブラウザで実行
npm run web
```

## MCPサーバー統合

このプロジェクトではClaude Code開発時に以下のMCPサーバーを使用しています：

### 設定済みMCPサーバー

1. **Serena** - コード分析とセマンティック検索
   - Language Server Protocol (LSP) 統合
   - 20以上のプログラミング言語をサポート

2. **Context7** - コンテキスト管理とドキュメント検索
   - 開発者ツールの統合

3. **Playwright** - ブラウザ自動化とテスト
   - Webアプリケーションのテスト

### MCPサーバーの設定

`.mcp.json`ファイルにプロジェクトスコープで設定されています：

```json
{
  "mcpServers": {
    "serena": {
      "type": "stdio",
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Claude Codeセッション内で自動的に利用可能です。

## 機能一覧

### 1. 学ぶタブ（Lessons）

8章構成のPython基礎レッスン。各章には以下の形式のステップが含まれます：

- **slide**: テキストと箇条書きによる説明スライド
- **code_read**: コードの読解と実行デモ
- **quiz_fill**: 穴埋め問題
- **quiz_mcq**: 四択問題
- **code_task**: コーディング課題

#### レッスン構成
1. 変数とprint
2. 条件分岐（if文）
3. 繰り返し（for/while）
4. リストと辞書
5. 関数の基本
6. モジュールとインポート
7. ファイル操作
8. クラスとオブジェクト

### 2. 書くタブ（Editor）

自由にPythonコードを書いて実行できるエディタ画面。

- `main.py` の編集・保存（AsyncStorageに永続化）
- リアルタイムコード実行
- コンソール出力表示（stdout/stderr）
- サンプルコードの閲覧

### 3. 作るタブ（Courses）

実践的な開発コースで、問題解決型の学習を提供します。

#### コース構成
各コースは4つのモジュールタイプで構成：

- **problem_discovery（課題発見）**: 実際の問題シナリオを分析
- **planning（設計）**: 解決策の設計と技術選定
- **implementation（実装）**: ステップバイステップでコーディング
- **reflection（振り返り）**: 成果の確認と改善点の検討

#### 利用可能なコース
1. **天気通知ボットを作ろう**（初級）- API連携の基礎
2. 自動ファイル整理ツール（準備中）
3. 簡単なタスク管理アプリ（準備中）
4. Excelデータ分析ツール（準備中）
5. Webスクレイピングで価格比較（準備中）
6. チャットボット開発（準備中）

#### パッケージ管理機能
- コース内で使用するPythonパッケージの自動インストール
- `micropip`を使用したWebAssembly環境でのパッケージ管理
- 標準ライブラリの自動識別とスキップ

#### サブスクリプション機能
- 無料プラン: 一部のコースが利用可能
- プレミアムプラン: 全コース受講可能
- 個別コース購入オプション

### 4. プロフィールタブ（Profile）

学習進捗の確認:
- クリアした章数
- 完了したステップ数
- 連続学習日数
- 総学習時間

## アーキテクチャ

### Python実行環境

Python実行は以下の仕組みで実現されています：

1. **PythonWebView** (`src/components/common/PythonWebView.tsx`)
   - WebViewコンポーネントでPyodideを読み込み
   - 常に裏で動作し、Python実行要求を受け付け

2. **PythonRunnerService** (`src/lib/pythonRunner.ts`)
   - シングルトンパターンで実装
   - WebViewとReact Nativeアプリ間のメッセージブリッジ
   - 実行キュー管理とタイムアウト処理

3. **インターフェース**
```typescript
type PythonRunResult = {
  stdout: string;
  stderr: string;
  success: boolean;
  executionTime?: number;
};

async function runPython(code: string, input?: string): Promise<PythonRunResult>
```

### 状態管理（Zustand）

5つのストアで状態を管理：

1. **lessonProgressStore** - レッスンの進捗状況
2. **editorStore** - エディタの内容とコンソール出力
3. **profileStore** - ユーザープロフィールと学習統計
4. **packageStore** - Pythonパッケージのインストール状態
5. **subscriptionStore** - サブスクリプション・購入状態

### データ構造

#### レッスンデータ（`assets/lessons/`）

レッスンはJSON形式で定義されています：

```json
{
  "chapters": [
    {
      "id": "ch1",
      "title": "変数とprint",
      "description": "Pythonの最初の一歩",
      "steps": [
        { "id": "ch1_s1", "type": "slide", "contentId": "slide_ch1_s1" },
        { "id": "ch1_s2", "type": "code_read", "contentId": "code_ch1_hello" }
      ]
    }
  ]
}
```

各ステップタイプの詳細データは別ファイル：
- `ch1_slides.json` - スライドコンテンツ
- `ch1_quizzes.json` - クイズ（穴埋め・四択）
- `ch1_tasks.json` - コーディング課題

## 開発ガイド

### 新しいレッスンの追加

1. `assets/lessons/` にJSON形式でレッスンデータを作成
2. `chapters.json` に章情報を追加
3. ステップタイプに応じたコンテンツファイルを作成

### 新しいステップタイプの追加

1. `src/types/lesson.ts` に型定義を追加
2. `src/components/steps/` に新しいコンポーネントを作成
3. `src/screens/lessons/StepScreen.tsx` でレンダリング処理を追加

### Python実行機能のカスタマイズ

`src/lib/pythonRunner.ts` の `PythonRunnerService` を拡張してください。
例：
- タイムアウト時間の調整
- カスタムインプット処理
- 実行履歴の保存

## デバッグ

### Python実行のデバッグ

```typescript
// pythonRunnerから直接インスタンスにアクセス
import { pythonRunner } from './src/lib/pythonRunner';

// 準備状態の確認
console.log(pythonRunner.isReady());

// テスト実行
const result = await pythonRunner.runPython('print("Hello")');
console.log(result);
```

### レッスン進捗のリセット

```typescript
import { useLessonProgressStore } from './src/store/lessonProgressStore';

// ストアをリセット
useLessonProgressStore.getState().resetProgress();
```

## ビルドとデプロイ

### iOS向けビルド

```bash
# EASビルド（Expo Application Services）
expo build:ios

# または
eas build --platform ios
```

### Android向けビルド

```bash
eas build --platform android
```

## パフォーマンス最適化

### Pyodide初期化の高速化

- WebViewは起動時にバックグラウンドで読み込み
- 初回実行時のみロード時間が発生

### AsyncStorageの最適化

- エディタの内容は変更時に自動保存（デバウンス処理）
- 進捗データは章クリア時にまとめて保存

## トラブルシューティング

### Pyodideが読み込まれない

1. WebViewのネットワーク接続を確認
2. `webview/index.html` のPyodide URLが正しいか確認
3. コンソールログで初期化エラーを確認

### レッスンデータが表示されない

1. `assets/lessons/` のJSONファイルが正しいか確認
2. Metro bundlerを再起動: `npx expo start -c`

## 今後の拡張予定

- [x] コース機能の実装（問題解決型学習）
- [x] パッケージ管理機能
- [x] サブスクリプション機能
- [x] コードエディタの改善
- [ ] ダークモード対応
- [ ] より高度なコードエディタ（シンタックスハイライト強化）
- [ ] 追加コースコンテンツの作成
- [ ] 練習問題機能の拡張
- [ ] ソーシャル機能（進捗シェア）
- [ ] 多言語対応
- [ ] オフライン対応の強化
- [ ] パフォーマンス最適化
- [ ] より詳細な学習分析

## ライセンス

このプロジェクトはプライベートです。

## 貢献

現在は非公開プロジェクトのため、外部からの貢献は受け付けていません。

## サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。
