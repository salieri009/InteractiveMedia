# Interactive Media Assignment — UTS 2025
# 인터랙티브 미디어 과제 — UTS 2025

<div align="center">

![version](https://img.shields.io/badge/version-2.0.0-667eea?style=flat-square)
![typescript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript)
![vite](https://img.shields.io/badge/Vite-4.4-646cff?style=flat-square&logo=vite)
![license](https://img.shields.io/badge/license-MIT-ffd93d?style=flat-square)
![uts](https://img.shields.io/badge/UTS-2025-1a1a2e?style=flat-square)

</div>

---

## 빠른 시작 / Quick Start

### 사전 요구사항 / Prerequisites

- **Node.js** 18.0.0 이상 / or higher
- **npm** 8.0.0 이상 / or higher
- 최신 웹 브라우저 / Modern browser (Chrome, Firefox, Safari, Edge)

### 설치 / Installation

```bash
# 저장소 복제 / Clone repository
git clone https://github.com/salieri009/InteractiveMedia.git
cd InteractiveMedia

# 루트 의존성 설치 / Install root dependencies
npm install

# 프론트엔드 설치 / Install frontend dependencies
cd frontend && npm install && cd ..

# 백엔드 설치 / Install backend dependencies
cd backend && npm install && cd ..
```

### 개발 실행 / Run Development

```bash
# 프론트엔드 개발 서버 (Vite, TypeScript) / Frontend dev server
npm run dev:frontend        # http://localhost:3000

# 백엔드 API 서버 (선택) / Backend API server (optional)
npm run dev:backend         # http://localhost:3001
```

---

## 프로젝트 목록 / Projects

총 **9개**의 p5.js 인터랙티브 프로젝트가 포함되어 있습니다.  
This hub contains **9 interactive p5.js projects**.

| ID | 영어 이름 / EN Name | 한국어 이름 / KO Name | 설명 / Description |
|:--:|:---|:---|:---|
| A1A | Basic Shapes | 기본 도형 | p5.js 기본 도형 그리기 / Fundamental shape drawing |
| A1B | Animated Shapes | 움직이는 도형 | 물리 기반 애니메이션 / Physics-based animation |
| A1C | Pattern Generator | 패턴 생성기 | 다중 모드 인터랙티브 패턴 / Multi-mode interactive patterns |
| A1D | Urban Glide | 도시 활강 | 사이드스크롤 빌딩 게임 / Side-scrolling building game |
| A1E | Sound-Painted Night Sky | 소리로 그린 밤하늘 | 마이크 반응형 시각화 / Microphone-reactive visualization |
| A1G | Interactive Pixel Sort | 픽셀 정렬 | 실시간 픽셀 조작 / Real-time pixel manipulation |
| A1H | Corpus Comedian | 텍스트 코미디언 | 텍스트 분석 + 워드클라우드 / Text analysis + word cloud |
| A1I | The Observant Shopper | 관찰하는 쇼퍼 | ml5.js 객체 인식 쇼핑 목록 / ml5.js object detection |
| A1J | Dungeon Tile Painter | 던전 타일 페인터 | MVC 패턴 타일 게임 / MVC pattern tile game |

### 키보드 단축키 / Keyboard Shortcuts

| 키 / Key | 동작 / Action |
|:---:|:---|
| `1` – `9` | 프로젝트 전환 / Switch project |
| `H` | 도움말 열기/닫기 / Toggle help panel |
| `←` | 이전 프로젝트 / Go back |
| `Esc` | 도움말 닫기 / Close help |
| `Ctrl+R` | 현재 프로젝트 재시작 / Reload current project |

---

## 기술 스택 / Technology Stack

| 영역 / Layer | 기술 / Tech | 버전 / Version | 비고 / Notes |
|:---|:---|:---|:---|
| 프론트엔드 / Frontend | TypeScript | 5.4.5 | `strict: true` |
| 빌드 / Build | Vite | 4.4.9 | HMR + TS overlay |
| 크리에이티브 코딩 / Creative | p5.js | 1.6.0 | CDN (전역 모드 / global mode) |
| 사운드 / Sound | p5.sound | 1.6.0 | CDN |
| 머신러닝 / ML | ml5.js | 0.12.2 | CDN (COCO-SSD) |
| 스타일 / CSS | Custom (7:3:1) | — | 5개 모듈 파일 / 5 module files |
| 백엔드 / Backend | Express.js + TypeScript | 4.18 / 5.4.5 | Serverless |
| 데이터베이스 / DB | AWS DynamoDB | v2 SDK | 개발: 인메모리 폴백 / dev: in-memory fallback |
| 배포 / Deploy | AWS Lambda / Vercel | — | `serverless-http` |

---

## 아키텍처 / Architecture

```
InteractiveMedia/
├── frontend/
│   ├── src/
│   │   ├── types/
│   │   │   ├── vendor/
│   │   │   │   ├── p5.d.ts          ← CDN p5.js 앰비언트 타입 / CDN p5 ambient types
│   │   │   │   └── ml5.d.ts         ← CDN ml5.js 앰비언트 타입 / CDN ml5 ambient types
│   │   │   ├── project.ts           ← IProject, IProjectOptions
│   │   │   ├── api.ts               ← IApiResponse, IAnalytics
│   │   │   ├── ui.ts                ← INotification, NotificationType
│   │   │   └── index.ts             ← 배럴 익스포트 / barrel export
│   │   ├── core/
│   │   │   ├── ProjectManager.ts    ← p5 인스턴스 생명주기 / p5 instance lifecycle
│   │   │   ├── UIController.ts      ← DOM 버튼 + 패널 관리 / DOM buttons & panels
│   │   │   ├── APIClient.ts         ← REST API 클라이언트 / REST API client
│   │   │   └── UXEnhancements.ts    ← Nielsen 10 휴리스틱 / Nielsen 10 heuristics
│   │   ├── projects/
│   │   │   ├── _ProjectTemplate.ts  ← 새 프로젝트 보일러플레이트 / new project template
│   │   │   ├── A1A.ts … A1J.ts     ← 주간 과제 스케치 / weekly assignment sketches
│   │   ├── classes/
│   │   │   ├── CarClass.ts          ← A1D에서 사용 / used by A1D
│   │   │   ├── DiceRoller.ts        ← CSS 3D 주사위 / CSS 3D dice
│   │   │   └── OrderToChaos.ts      ← 엔트로피 파티클 시스템 / entropy particle system
│   │   └── utils/
│   │       └── AudioWorkletFix.ts   ← p5.sound 중복 등록 패치 / p5.sound duplicate fix
│   ├── css/
│   │   ├── design-tokens.css        ← 7:3:1 CSS 변수 / CSS custom properties
│   │   ├── layout.css               ← body, header, grid
│   │   ├── components.css           ← 버튼, 패널, 알림 / buttons, panels, notifications
│   │   ├── animations.css           ← @keyframes (중복 제거 / deduplicated)
│   │   └── responsive.css           ← @media 쿼리 / media queries
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── types/
│   │   │   ├── database.ts          ← IProjectRecord, IQueryFilters, IDatabaseResult
│   │   │   └── api.ts               ← IApiResponse, ICreateProjectRequest
│   │   ├── api/
│   │   │   └── index.ts             ← Express 라우트 / Express routes
│   │   └── utils/
│   │       ├── database.ts          ← DatabaseUtils (인메모리 폴백 / in-memory fallback)
│   │       └── database-aws.ts      ← DatabaseUtils (DynamoDB 전용 / DynamoDB only)
│   ├── tsconfig.json
│   └── package.json
│
├── CHANGELOG.md
├── README.md                        ← 이 파일 / this file
└── package.json                     ← 모노레포 워크스페이스 / monorepo workspaces
```

### 데이터 흐름 / Data Flow

```
브라우저 / Browser
  │
  ├─ CDN <script>  p5.js  ──────────────────────── window.p5 (전역 / global)
  ├─ CDN <script>  p5.sound ─────────────────────── window.p5.sound
  ├─ CDN <script>  ml5.js ───────────────────────── window.ml5
  │
  └─ <script type="module">
       ProjectManager.ts ── window.projectManager
       UIController.ts ──── window.uiController
       APIClient.ts ──────── window.apiClient
       UXEnhancements.ts ─── window.uxEnhancements
       A1A.ts … A1J.ts ───── projectManager.registerProject(...)
```

---

## 설치 상세 / Detailed Setup

### 1단계: 의존성 설치 / Step 1: Install Dependencies

```bash
# 프론트엔드 / Frontend
cd frontend
npm install
# typescript, vite-plugin-checker 포함 / includes typescript, vite-plugin-checker
cd ..

# 백엔드 / Backend
cd backend
npm install
# typescript, ts-node, @types/* 포함 / includes typescript, ts-node, @types/*
cd ..
```

### 2단계: 개발 실행 / Step 2: Start Development

```bash
# 터미널 1 — 프론트엔드 / Terminal 1 — Frontend
npm run dev:frontend

# 터미널 2 — 백엔드 (선택) / Terminal 2 — Backend (optional)
npm run dev:backend
```

### 3단계: 빌드 / Step 3: Build for Production

```bash
# 전체 빌드 / Full build
npm run build

# 타입 검사만 / Type-check only
cd frontend && npx tsc --noEmit && cd ..
cd backend  && npx tsc --noEmit && cd ..
```

---

## 새 프로젝트 추가 / Adding a New Project

1. **템플릿 복사 / Copy template:**
   ```bash
   cp frontend/src/projects/_ProjectTemplate.ts frontend/src/projects/A1X.ts
   ```

2. **보일러플레이트 수정 / Edit boilerplate:**
   - `[PROJECT_ID]` → 프로젝트 ID (예: `a1x`)
   - `[PROJECT_NAME]` → 표시 이름
   - `[PROJECT_DESCRIPTION]` → 설명

3. **index.html에 추가 / Add to index.html:**
   ```html
   <script type="module" src="./src/projects/A1X.ts"></script>
   ```

4. **페이지 새로고침** — 버튼이 자동으로 나타납니다 / Refresh — button appears automatically.

---

## 7:3:1 디자인 시스템 / Design System

외곽 UI에만 적용 — 캔버스 영역은 변경되지 않습니다.  
Applied to the outer shell UI only — canvas areas are untouched.

| 비율 / Ratio | 색상 / Color | 용도 / Usage |
|:---:|:---|:---|
| 70% | `#1a1a2e` Dark Navy | 배경, 헤더, 푸터 / Background, header, footer |
| 30% | `#667eea` Purple-Blue | 사이드바, 패널 / Sidebar, panels |
| 10% | `#ffd93d` Gold | 활성 버튼, CTA / Active buttons, CTAs |

---

## 변경 이력 / Changelog

[CHANGELOG.md](CHANGELOG.md) 참조 / See CHANGELOG.md

### v2.0.0 (2026-05-25) 주요 변경 / Highlights

- JavaScript → TypeScript (`strict: true`) 전체 마이그레이션
- `src/` 아키텍처 도입 (types / core / projects / classes / utils)
- 7:3:1 디자인 시스템 적용 (외곽 UI 전용)
- CSS 5개 모듈 파일로 분리
- 백엔드 TypeScript 변환 (DynamoDB + 인메모리 폴백)
- A1E 마이크, A1H DOM 정리 훅 추가
- 모든 UI에서 이모지 제거

---

## 라이선스 / License

[MIT License](LICENSE) — UTS Interactive Media Assignment 2025
