<div align="center">

![header](https://capsule-render.vercel.app/api?type=rect&color=0:667eea,100:764ba2&height=250&text=Interactive%20Media%202025&fontSize=70&fontColor=ffffff&animation=fadeIn&desc=UTS%20Semester%202%20-%20Creative%20Coding%20Projects&descSize=24&descAlignY=75&fontAlign=50)

# 🎨 Interactive Media Assignment

**Language / 言語 / 언어**

<div align="center">

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=flat-square)](../README.en.md)
[![日本語](https://img.shields.io/badge/日本語-🇯🇵-red?style=flat-square&logoColor=white)](../README.ja.md) ← 現在の言語
[![한국어](https://img.shields.io/badge/한국어-🇰🇷-green?style=flat-square)](../README.ko.md)

</div>

**UTS 2025 Semester 2 - フルスタックインタラクティブメディアプロジェクトハブ**

モダンなUI/UXデザイン、サーバーレスバックエンド、完全なアクセシビリティ準拠を特徴とする、9つのインタラクティブp5.jsプロジェクトを含む包括的なウェブアプリケーション。

## 🚀 クイックスタート

<div align="center">

### 前提条件
- Node.js 18.0.0以上
- npm 8.0.0以上
- モダンなウェブブラウザ

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
# フロントエンドを起動
npm run dev:frontend

# バックエンドを起動（オプション）
npm run dev:backend
```

ブラウザで `frontend/index.html` を開くか、Live Serverを使用してください。

</div>

## 🎯 プロジェクト

<div align="center">

| プロジェクト | 名前 | 説明 |
|:------:|------|-------------|
| **A1A** | Basic Shapes | 基本的なp5.js図形描画 |
| **A1B** | Animated Shapes | 物理ベースのインタラクティブアニメーション |
| **A1C** | Pattern Generator | 複数モードのインタラクティブパターンジェネレーター |
| **A1D** | Urban Glide | 建物生成機能付きサイドスクロールゲーム |
| **A1E** | Sound-Painted Night Sky | オーディオ反応型ビジュアライゼーション |
| **A1G** | Interactive Pixel Sort | リアルタイムピクセル操作 |
| **A1H** | Corpus Comedian | テキスト分析とジョークジェネレーター |
| **A1I** | The Observant Shopper | コンピュータビジョンショッピングリスト |
| **A1J** | Dungeon Tile Painter | インタラクティブタイルベースゲーム |

</div>

## ✨ 主な機能

<div align="center">

- **マルチプロジェクト管理** - スムーズな遷移による動的プロジェクト切り替え
- **モダンなUI/UX** - Nielsenのヒューリスティック準拠のレスポンシブデザイン
- **アクセシビリティ優先** - WCAG 2.1 AA準拠、キーボードナビゲーション、ARIAラベル
- **サーバーレスバックエンド** - AWS Lambda対応Express.js API
- **キーボードショートカット** - `1-9` プロジェクト切り替え、`H` ヘルプ、`←` 戻る、`Esc` 閉じる

</div>

## 🛠️ 技術スタック

<div align="center">

**フロントエンド:** p5.js, Vanilla JavaScript (ES6+), CSS Grid/Flexbox  
**バックエンド:** Express.js, Node.js 18+  
**デプロイ:** Vercel/Netlify (サーバーレス)

</div>

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

## ➕ 新しいプロジェクトの追加

1. テンプレートをコピー: `cp frontend/js/_ProjectTemplate.js frontend/js/A1X.js`
2. プロジェクトID、名前、説明をカスタマイズ
3. `frontend/index.html` にスクリプトタグを追加
4. プロジェクトが自動的に表示されます！

## 📚 ドキュメント

- [QUICK-START.md](QUICK-START.md) - 詳細なセットアップガイド
- [SETUP.md](SETUP.md) - 完全なセットアップ手順
- [docs/](docs/) - 完全なドキュメント

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

---

![footer](https://capsule-render.vercel.app/api?type=wave&color=0:667eea,100:764ba2&height=150&section=footer&fontSize=50&fontColor=ffffff&animation=twinkling&text=p5.jsで作られたプロジェクト%20❤️&desc=UTS%20Interactive%20Media%202025&descSize=18&fontAlign=50)

</div>

