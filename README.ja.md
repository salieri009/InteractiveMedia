<div align="center">

![header](https://capsule-render.vercel.app/api?type=rect&color=0:667eea,100:764ba2&height=250&text=Interactive%20Media%202025&fontSize=70&fontColor=ffffff&animation=fadeIn&desc=UTS%20Semester%202%20-%20Creative%20Coding%20Projects&descSize=24&descAlignY=75&fontAlign=50)

# 🎨 Interactive Media Assignment

**Language / 言語 / 언어**

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=flat-square)](../README.en.md)
[![日本語](https://img.shields.io/badge/日本語-🇯🇵-red?style=flat-square&logoColor=white)](../README.ja.md) ← 現在の言語
[![한국어](https://img.shields.io/badge/한국어-🇰🇷-green?style=flat-square)](../README.ko.md)

**UTS 2025 Semester 2 - フルスタックインタラクティブメディアプロジェクトハブ**

モダンなUI/UXデザイン、サーバーレスバックエンド、完全なアクセシビリティ準拠を特徴とする、9つのインタラクティブp5.jsプロジェクトを含む包括的なウェブアプリケーション。

</div>

---

## 🚀 クイックスタート

### 前提条件

- **Node.js** 18.0.0以上
- **npm** 8.0.0以上
- モダンなウェブブラウザ (Chrome, Firefox, Safari, Edge)

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/salieri009/InteractiveMedia.git
cd InteractiveMedia

# 依存関係をインストール
npm run setup
```

### 開発

```bash
# フロントエンド開発サーバーを起動
npm run dev:frontend

# バックエンドAPIサーバーを起動（オプション）
npm run dev:backend
```

ブラウザで `frontend/index.html` を開くか、VS CodeのLive Server拡張機能を使用してください。

---

## 🎯 プロジェクト

このハブには **9つのインタラクティブp5.jsプロジェクト** が含まれています：

| プロジェクト | 名前 | 説明 |
|:------:|:----:|:-----------:|
| **A1A** | Basic Shapes | 基本的なp5.js図形描画 |
| **A1B** | Animated Shapes | 物理ベースのインタラクティブアニメーション |
| **A1C** | Pattern Generator | 複数モードのインタラクティブパターンジェネレーター |
| **A1D** | Urban Glide | 建物生成機能付きサイドスクロールゲーム |
| **A1E** | Sound-Painted Night Sky | オーディオ反応型ビジュアライゼーション |
| **A1G** | Interactive Pixel Sort | リアルタイムピクセル操作 |
| **A1H** | Corpus Comedian | テキスト分析とジョークジェネレーター |
| **A1I** | The Observant Shopper | コンピュータビジョンショッピングリスト |
| **A1J** | Dungeon Tile Painter | インタラクティブタイルベースゲーム |

各プロジェクトは、異なるクリエイティブコーディングの概念とインタラクティブメディアの技術を実演しています。

---

## ✨ 主な機能

- **🎮 マルチプロジェクト管理**  
  スムーズな遷移と独立したプロジェクト環境による動的プロジェクト切り替え

- **📱 モダンなUI/UX**  
  Nielsenのヒューリスティック100%準拠のレスポンシブデザイン

- **♿ アクセシビリティ優先**  
  WCAG 2.1 AA準拠、完全なキーボードナビゲーション、ARIAラベル

- **☁️ サーバーレスバックエンド**  
  分析追跡機能付きAWS Lambda対応Express.js API

- **⌨️ キーボードショートカット**  
  `1-9` プロジェクト切り替え、`H` ヘルプ、`←` 戻る、`Esc` 閉じる

---

## 🛠️ 技術スタック

**フロントエンド:**
- p5.js - クリエイティブコーディングフレームワーク
- Vanilla JavaScript (ES6+) - モジュラーアーキテクチャ
- CSS Grid/Flexbox - レスポンシブレイアウト

**バックエンド:**
- Express.js - サーバーレスAPIフレームワーク
- Node.js 18+ - ランタイム環境

**デプロイ:**
- Vercel/Netlify - サーバーレスホスティング
- CDN - グローバルコンテンツ配信

---

## 📁 プロジェクト構造

```
InteractiveMedia/
├── frontend/          # p5.jsプロジェクトとUI
│   ├── js/           # プロジェクトファイル (A1A.js, A1B.js, ...)
│   ├── css/          # スタイル
│   └── assets/       # メディアリソース
├── backend/          # サーバーレスAPI
│   ├── api/          # Express.jsエンドポイント
│   └── utils/        # データベースユーティリティ
└── docs/             # ドキュメント
```

---

## ➕ 新しいプロジェクトの追加

1. **テンプレートをコピー:**
   ```bash
   cp frontend/js/_ProjectTemplate.js frontend/js/A1X.js
   ```

2. **プロジェクトをカスタマイズ:**
   - `[PROJECT_ID]`をプロジェクトIDで置き換え（例：`a1x`）
   - `[PROJECT_NAME]`をプロジェクト名で置き換え
   - `[PROJECT_DESCRIPTION]`を説明で置き換え

3. **HTMLに追加:**
   ```html
   <script src="js/A1X.js"></script>
   ```

4. **ページを更新** - 新しいプロジェクトボタンが自動的に表示されます！🎉

---

## 📚 ドキュメント

- **[QUICK-START.md](QUICK-START.md)** - 詳細なセットアップガイド
- **[SETUP.md](SETUP.md)** - 完全なセットアップ手順
- **[docs/](docs/)** - デザイン計画とアーキテクチャガイドを含む完全なドキュメント

---

## 📄 ライセンス

このプロジェクトは **MIT License** の下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

<div align="center">

![footer](https://capsule-render.vercel.app/api?type=wave&color=0:667eea,100:764ba2&height=150&section=footer&fontSize=50&fontColor=ffffff&animation=twinkling&text=p5.jsで作られたプロジェクト%20❤️&desc=UTS%20Interactive%20Media%202025&descSize=18&fontAlign=50)

</div>
