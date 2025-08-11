# Interactive Media Assignment - Frontend

## 🎨 프로젝트 개요

UTS 2025 Interactive Media Assignment의 프론트엔드 부분입니다. p5.js를 사용한 인터랙티브 프로젝트들을 포함합니다.

## 📁 파일 구조

```
frontend/
├── index.html              # 메인 HTML 파일
├── package.json            # 프론트엔드 의존성 관리
├── README.md              # 이 파일
├── js/                    # JavaScript 파일들
│   ├── ProjectManager.js   # 프로젝트 관리
│   ├── UIController.js     # UI 컨트롤러
│   ├── APIClient.js        # API 클라이언트
│   ├── A1A.js             # 프로젝트 A1A
│   ├── A1B.js             # 프로젝트 A1B
│   └── A1C.js             # 프로젝트 A1C
├── css/                   # 스타일시트
│   └── style.css          # 메인 CSS
└── assets/                # 정적 자산
    ├── fonts/             # 폰트 파일들
    ├── images/            # 이미지 파일들
    └── sounds/            # 오디오 파일들
```

## 🚀 개발 환경 설정

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. 개발 서버 시작
```bash
# Live Server로 실행 (자동 새로고침)
npm run dev

# 또는 HTTP Server로 실행
npm start
```

### 3. 브라우저에서 확인
- 개발 서버: http://localhost:3000
- Live Server: 자동으로 브라우저가 열립니다

## 🎮 포함된 프로젝트들

### A1A - Basic Shapes Demo
- 기본 도형 그리기 데모
- p5.js 기본 함수 사용법

### A1B - Interactive Animation  
- 움직이는 원과 마우스 인터랙션
- 애니메이션 기본 개념

### A1C - Pattern Generator
- 인터랙티브 패턴 생성기
- 키보드 컨트롤과 복잡한 그래픽

#### A1C 조작법:
- **1-4**: 패턴 변경
- **Q, W, E, T**: 색상 모드 변경
- **+/-**: 크기 조절
- **스페이스**: 일시정지/재개
- **R**: 리셋
- **마우스 클릭**: 패턴 순환

## 🔧 기술 스택

- **p5.js**: 크리에이티브 코딩 라이브러리
- **Vanilla JavaScript**: ES6+ 모던 자바스크립트
- **CSS3**: 반응형 스타일링
- **HTML5**: 시맨틱 마크업

## 🌐 API 연동

프론트엔드는 백엔드 API와 연동되어 다음 기능을 제공합니다:

- 프로젝트 목록 조회
- 프로젝트 조회수 추적
- 좋아요 기능
- 분석 데이터 표시

### API 설정
`js/APIClient.js`에서 API 엔드포인트를 설정할 수 있습니다:

```javascript
const API_BASE_URL = 'http://localhost:3001/api'; // 개발환경
// const API_BASE_URL = 'https://your-api-gateway-url'; // 프로덕션
```

## 🧪 테스트

### 브라우저 개발자 도구 확인
1. F12를 눌러 개발자 도구 열기
2. Console 탭에서 오류 확인
3. Network 탭에서 API 호출 확인

### 기능 테스트 체크리스트
- [ ] 프로젝트 목록이 올바르게 표시되는가?
- [ ] 각 프로젝트가 정상적으로 로드되는가?
- [ ] 마우스/키보드 인터랙션이 작동하는가?
- [ ] API 호출이 성공하는가?
- [ ] 오류 메시지가 적절히 처리되는가?

## 📱 반응형 디자인

프론트엔드는 다양한 화면 크기에 대응합니다:
- 데스크톱: 1200px+
- 태블릿: 768px - 1199px  
- 모바일: 767px 이하

## 🔍 문제 해결

### 일반적인 문제들

1. **p5.js 로드 오류**
   - CDN 연결 확인
   - 인터넷 연결 상태 확인

2. **프로젝트가 표시되지 않음**
   - 콘솔에서 JavaScript 오류 확인
   - 파일 경로 확인

3. **API 연결 오류**
   - 백엔드 서버가 실행 중인지 확인
   - CORS 설정 확인
   - API URL 확인

### 디버깅 팁
```javascript
// 콘솔에서 확인할 수 있는 전역 변수들
console.log(projectManager.getAllProjects());
console.log(uiController);
```

## 🚀 배포 준비

프로덕션 배포 전 체크리스트:
- [ ] API URL을 프로덕션 URL로 변경
- [ ] 모든 프로젝트가 정상 작동 확인
- [ ] 브라우저 호환성 테스트
- [ ] 성능 최적화 확인

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능
