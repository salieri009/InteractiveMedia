<div align="center">

![header](https://capsule-render.vercel.app/api?type=rect&color=0:667eea,100:764ba2&height=250&text=Interactive%20Media%202025&fontSize=70&fontColor=ffffff&animation=fadeIn&desc=UTS%20Semester%202%20-%20Creative%20Coding%20Projects&descSize=24&descAlignY=75&fontAlign=50)

# 🎨 Interactive Media Assignment

**Language / 言語 / 언어**

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=flat-square)](../README.en.md)
[![日本語](https://img.shields.io/badge/日本語-🇯🇵-red?style=flat-square)](../README.ja.md)
[![한국어](https://img.shields.io/badge/한국어-🇰🇷-green?style=flat-square&logoColor=white)](../README.ko.md) ← 현재 언어

**UTS 2025 Semester 2 - 풀스택 인터랙티브 미디어 프로젝트 허브**

9개의 인터랙티브 p5.js 프로젝트를 포함한 종합 웹 애플리케이션으로, 현대적인 UI/UX 디자인, 서버리스 백엔드, 완전한 접근성 준수를 특징으로 합니다.

</div>

---

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18.0.0 이상
- **npm** 8.0.0 이상
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)

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
# 프론트엔드 개발 서버 시작
npm run dev:frontend

# 백엔드 API 서버 시작 (선택사항)
npm run dev:backend
```

브라우저에서 `frontend/index.html`을 열거나 VS Code의 Live Server 확장을 사용하세요.

---

## 🎯 프로젝트

이 허브는 **9개의 인터랙티브 p5.js 프로젝트**를 포함합니다:

| 프로젝트 | 이름 | 설명 |
|:------:|:----:|:-----------:|
| **A1A** | Basic Shapes | 기본 p5.js 도형 그리기 |
| **A1B** | Animated Shapes | 물리 기반 인터랙티브 애니메이션 |
| **A1C** | Pattern Generator | 다중 모드 인터랙티브 패턴 생성기 |
| **A1D** | Urban Glide | 건물 생성이 있는 사이드 스크롤 게임 |
| **A1E** | Sound-Painted Night Sky | 오디오 반응형 시각화 |
| **A1G** | Interactive Pixel Sort | 실시간 픽셀 조작 |
| **A1H** | Corpus Comedian | 텍스트 분석 및 농담 생성기 |
| **A1I** | The Observant Shopper | 컴퓨터 비전 쇼핑 리스트 |
| **A1J** | Dungeon Tile Painter | 인터랙티브 타일 기반 게임 |

각 프로젝트는 서로 다른 창의적 코딩 개념과 인터랙티브 미디어 기법을 보여줍니다.

---

## ✨ 주요 기능

- **🎮 다중 프로젝트 관리**  
  부드러운 전환과 독립적인 프로젝트 환경을 통한 동적 프로젝트 전환

- **📱 현대적인 UI/UX**  
  Nielsen의 휴리스틱 100% 준수를 포함한 반응형 디자인

- **♿ 접근성 우선**  
  WCAG 2.1 AA 준수, 전체 키보드 네비게이션, ARIA 레이블

- **☁️ 서버리스 백엔드**  
  분석 추적 기능이 있는 AWS Lambda 준비 Express.js API

- **⌨️ 키보드 단축키**  
  `1-9` 프로젝트 전환, `H` 도움말, `←` 뒤로, `Esc` 닫기

---

## 🛠️ 기술 스택

**프론트엔드:**
- p5.js - 창의적 코딩 프레임워크
- Vanilla JavaScript (ES6+) - 모듈식 아키텍처
- CSS Grid/Flexbox - 반응형 레이아웃

**백엔드:**
- Express.js - 서버리스 API 프레임워크
- Node.js 18+ - 런타임 환경

**배포:**
- Vercel/Netlify - 서버리스 호스팅
- CDN - 글로벌 콘텐츠 전송

---

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

---

## ➕ 새 프로젝트 추가

1. **템플릿 복사:**
   ```bash
   cp frontend/js/_ProjectTemplate.js frontend/js/A1X.js
   ```

2. **프로젝트 커스터마이징:**
   - `[PROJECT_ID]`를 프로젝트 ID로 교체 (예: `a1x`)
   - `[PROJECT_NAME]`을 프로젝트 이름으로 교체
   - `[PROJECT_DESCRIPTION]`을 설명으로 교체

3. **HTML에 추가:**
   ```html
   <script src="js/A1X.js"></script>
   ```

4. **페이지 새로고침** - 새 프로젝트 버튼이 자동으로 나타납니다! 🎉

---

## 📚 문서

- **[QUICK-START.md](QUICK-START.md)** - 상세 설정 가이드
- **[SETUP.md](SETUP.md)** - 완전한 설정 지침
- **[docs/](docs/)** - 디자인 계획 및 아키텍처 가이드를 포함한 전체 문서

---

## 📄 라이선스

이 프로젝트는 **MIT License** 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

<div align="center">

![footer](https://capsule-render.vercel.app/api?type=wave&color=0:667eea,100:764ba2&height=150&section=footer&fontSize=50&fontColor=ffffff&animation=twinkling&text=p5.js로%20만든%20프로젝트%20❤️&desc=UTS%20Interactive%20Media%202025&descSize=18&fontAlign=50)

</div>
