<div align="center">

![header](https://capsule-render.vercel.app/api?type=rect&color=0:667eea,100:764ba2&height=250&text=Interactive%20Media%202025&fontSize=70&fontColor=ffffff&animation=fadeIn&desc=UTS%20Semester%202%20-%20Creative%20Coding%20Projects&descSize=24&descAlignY=75&fontAlign=50)

# 🎨 Interactive Media Assignment

**Language / 言語 / 언어**

<div align="center">

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=flat-square)](../README.en.md)
[![日本語](https://img.shields.io/badge/日本語-🇯🇵-red?style=flat-square)](../README.ja.md)
[![한국어](https://img.shields.io/badge/한국어-🇰🇷-green?style=flat-square&logoColor=white)](../README.ko.md) ← 현재 언어

</div>

**UTS 2025 Semester 2 - 풀스택 인터랙티브 미디어 프로젝트 허브**

9개의 인터랙티브 p5.js 프로젝트를 포함한 종합 웹 애플리케이션으로, 현대적인 UI/UX 디자인, 서버리스 백엔드, 완전한 접근성 준수를 특징으로 합니다.

## 🚀 빠른 시작

<div align="center">

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 8.0.0 이상
- 최신 웹 브라우저

### 설치

```bash
# 저장소 클론
git clone https://github.com/salieri009/InteractiveMedia.git
cd InteractiveMedia

# 의존성 설치
npm run setup
```

### 개발

```bash
# 프론트엔드 시작
npm run dev:frontend

# 백엔드 시작 (선택사항)
npm run dev:backend
```

브라우저에서 `frontend/index.html`을 열거나 Live Server를 사용하세요.

</div>

## 🎯 프로젝트

<div align="center">

| 프로젝트 | 이름 | 설명 |
|:------:|------|-------------|
| **A1A** | Basic Shapes | 기본 p5.js 도형 그리기 |
| **A1B** | Animated Shapes | 물리 기반 인터랙티브 애니메이션 |
| **A1C** | Pattern Generator | 다중 모드 인터랙티브 패턴 생성기 |
| **A1D** | Urban Glide | 건물 생성이 있는 사이드 스크롤 게임 |
| **A1E** | Sound-Painted Night Sky | 오디오 반응형 시각화 |
| **A1G** | Interactive Pixel Sort | 실시간 픽셀 조작 |
| **A1H** | Corpus Comedian | 텍스트 분석 및 농담 생성기 |
| **A1I** | The Observant Shopper | 컴퓨터 비전 쇼핑 리스트 |
| **A1J** | Dungeon Tile Painter | 인터랙티브 타일 기반 게임 |

</div>

## ✨ 주요 기능

<div align="center">

- **다중 프로젝트 관리** - 부드러운 전환과 함께 프로젝트 전환
- **현대적인 UI/UX** - Nielsen의 휴리스틱 준수를 포함한 반응형 디자인
- **접근성 우선** - WCAG 2.1 AA 준수, 키보드 네비게이션, ARIA 레이블
- **서버리스 백엔드** - AWS Lambda 준비 Express.js API
- **키보드 단축키** - `1-9` 프로젝트 전환, `H` 도움말, `←` 뒤로, `Esc` 닫기

</div>

## 🛠️ 기술 스택

<div align="center">

**프론트엔드:** p5.js, Vanilla JavaScript (ES6+), CSS Grid/Flexbox  
**백엔드:** Express.js, Node.js 18+  
**배포:** Vercel/Netlify (서버리스)

</div>

## 📁 프로젝트 구조

```
InteractiveMedia/
├── frontend/          # p5.js 프로젝트 및 UI
│   ├── js/           # 프로젝트 파일 (A1A.js, A1B.js, ...)
│   ├── css/          # 스타일
│   └── assets/       # 미디어 리소스
├── backend/          # 서버리스 API
│   ├── api/          # Express.js 엔드포인트
│   └── utils/        # 데이터베이스 유틸리티
└── docs/             # 문서
```

## ➕ 새 프로젝트 추가

1. 템플릿 복사: `cp frontend/js/_ProjectTemplate.js frontend/js/A1X.js`
2. 프로젝트 ID, 이름, 설명 커스터마이징
3. `frontend/index.html`에 스크립트 태그 추가
4. 프로젝트가 자동으로 나타납니다!

## 📚 문서

- [QUICK-START.md](QUICK-START.md) - 상세 설정 가이드
- [SETUP.md](SETUP.md) - 완전한 설정 지침
- [docs/](docs/) - 전체 문서

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE)를 참조하세요.

---

![footer](https://capsule-render.vercel.app/api?type=wave&color=0:667eea,100:764ba2&height=150&section=footer&fontSize=50&fontColor=ffffff&animation=twinkling&text=p5.js로%20만든%20프로젝트%20❤️&desc=UTS%20Interactive%20Media%202025&descSize=18&fontAlign=50)

</div>

