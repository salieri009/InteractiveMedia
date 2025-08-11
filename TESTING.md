# 🧪 테스트 가이드

## 📋 테스트 개요

배포 전에 프론트엔드와 백엔드를 독립적으로 테스트하는 방법을 안내합니다.

## 🎨 Frontend 테스트

### 1. 개발 환경 설정

```bash
# Frontend 폴더로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 시작 (방법 1 - Live Server)
npm run dev

# 또는 개발 서버 시작 (방법 2 - HTTP Server)
npm start
```

### 2. Frontend 기능 테스트 체크리스트

#### ✅ 기본 기능 테스트
- [ ] 브라우저에서 http://localhost:3000 접속 가능
- [ ] 프로젝트 선택 버튼들이 표시됨
- [ ] A1A, A1B, A1C 프로젝트 전환 가능
- [ ] p5.js 캔버스가 정상 렌더링됨

#### ✅ A1A 프로젝트 테스트
```javascript
// 브라우저 콘솔에서 실행하여 테스트
console.log('A1A 프로젝트 테스트:');
uiController.switchProject('a1a');
```
- [ ] 기본 도형들(선, 사각형, 원)이 표시됨
- [ ] 마우스 클릭 시 콘솔에 좌표 출력
- [ ] 키 입력 시 콘솔에 키 출력

#### ✅ A1B 프로젝트 테스트  
```javascript
// 브라우저 콘솔에서 실행
console.log('A1B 프로젝트 테스트:');
uiController.switchProject('a1b');
```
- [ ] 움직이는 원이 화면에서 튀어다님
- [ ] 마우스를 따라다니는 트레일 효과
- [ ] 스페이스바로 일시정지/재개 가능

#### ✅ A1C 프로젝트 테스트
```javascript
// 브라우저 콘솔에서 실행  
console.log('A1C 프로젝트 테스트:');
uiController.switchProject('a1c');
```
- [ ] 패턴이 애니메이션과 함께 표시됨
- [ ] 1-4 키로 패턴 변경 가능
- [ ] Q,W,E,T 키로 색상 모드 변경
- [ ] +/- 키로 크기 조절 가능
- [ ] 마우스 클릭으로 패턴 순환

### 3. 브라우저 개발자 도구 확인

```javascript
// 콘솔에서 실행할 수 있는 디버깅 명령어들

// 1. 등록된 프로젝트 목록 확인
console.log('등록된 프로젝트들:', projectManager.getAllProjects());

// 2. 현재 프로젝트 확인
console.log('현재 프로젝트:', projectManager.getCurrentProject());

// 3. UI 컨트롤러 상태 확인
console.log('UI 컨트롤러:', uiController);

// 4. p5.js 전역 변수 확인
console.log('p5.js 변수들:', {
  mouseX: typeof mouseX !== 'undefined' ? mouseX : 'undefined',
  mouseY: typeof mouseY !== 'undefined' ? mouseY : 'undefined',
  width: typeof width !== 'undefined' ? width : 'undefined',
  height: typeof height !== 'undefined' ? height : 'undefined'
});
```

## 🖥️ Backend 테스트

### 1. 개발 환경 설정

```bash
# Backend 폴더로 이동
cd backend

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 2. API 엔드포인트 테스트

#### ✅ Health Check
```bash
# PowerShell에서
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET

# 또는 브라우저에서 http://localhost:3001/api/health 접속
```

예상 응답:
```json
{
  "status": "OK",
  "timestamp": "2025-08-11T...",
  "uptime": 123.456,
  "environment": "development"
}
```

#### ✅ 프로젝트 목록 조회
```bash
# PowerShell에서
Invoke-RestMethod -Uri "http://localhost:3001/api/projects" -Method GET
```

예상 응답:
```json
{
  "success": true,
  "data": [
    {
      "id": "a1a",
      "name": "A1A - Basic Shapes",
      "description": "...",
      "views": 0,
      "likes": 0
    }
  ],
  "total": 3
}
```

#### ✅ 특정 프로젝트 조회
```bash
# PowerShell에서
Invoke-RestMethod -Uri "http://localhost:3001/api/projects/a1a" -Method GET
```

#### ✅ 프로젝트 좋아요
```bash
# PowerShell에서
Invoke-RestMethod -Uri "http://localhost:3001/api/projects/a1a/like" -Method POST
```

#### ✅ 분석 데이터 조회
```bash
# PowerShell에서
Invoke-RestMethod -Uri "http://localhost:3001/api/analytics" -Method GET
```

### 3. Backend 로그 확인

개발 서버 실행 시 콘솔에서 다음과 같은 로그를 확인할 수 있어야 합니다:

```
🚀 Server running on http://localhost:3001
📊 API endpoints available at http://localhost:3001/api
✅ Database connected (in-memory)
```

## 🔗 통합 테스트 (Frontend + Backend)

### 1. 두 서버 모두 실행

```bash
# Terminal 1: Backend 실행
cd backend
npm run dev

# Terminal 2: Frontend 실행  
cd frontend
npm run dev
```

### 2. API 연동 테스트

Frontend에서 브라우저 콘솔을 열고:

```javascript
// API 클라이언트 테스트
if (typeof EnhancedUIController !== 'undefined') {
  console.log('API 연동 테스트 시작...');
  
  // 프로젝트 목록 가져오기 테스트
  uiController.loadProjectsFromAPI()
    .then(() => console.log('✅ API 연동 성공'))
    .catch(err => console.error('❌ API 연동 실패:', err));
}
```

### 3. Network 탭에서 API 호출 확인

브라우저 개발자 도구의 Network 탭에서 다음 요청들이 성공하는지 확인:

- `GET /api/projects` - 상태코드 200
- `GET /api/analytics` - 상태코드 200  
- `GET /api/projects/a1a` (프로젝트 클릭 시) - 상태코드 200

## 🧪 AWS Lambda 로컬 테스트

### 1. SAM CLI 설치 확인

```bash
sam --version
```

### 2. Lambda 함수 로컬 실행

```bash
# SAM 빌드
sam build

# 로컬 API 서버 시작
sam local start-api --port 3001
```

### 3. 테스트 이벤트로 함수 호출

```bash
# Health check 테스트
sam local invoke InteractiveMediaAPI --event events/test-health.json

# Projects API 테스트  
sam local invoke InteractiveMediaAPI --event events/test-projects.json
```

## 🚨 일반적인 문제 해결

### Frontend 문제들

1. **프로젝트가 로드되지 않음**
   ```javascript
   // 콘솔에서 확인
   console.log('ProjectManager 상태:', projectManager);
   console.log('등록된 프로젝트 수:', projectManager.getAllProjects().length);
   ```

2. **p5.js 오류**
   ```javascript
   // p5.js 로드 확인
   console.log('p5.js 로드됨:', typeof p5 !== 'undefined');
   console.log('createCanvas 사용 가능:', typeof createCanvas !== 'undefined');
   ```

3. **API 연결 오류**
   - Backend 서버가 실행 중인지 확인
   - CORS 설정 확인
   - 브라우저 콘솔에서 네트워크 오류 확인

### Backend 문제들

1. **포트 충돌**
   ```bash
   # 포트 사용 중인 프로세스 확인 (Windows)
   netstat -ano | findstr :3001
   
   # 프로세스 종료
   taskkill /PID <PID번호> /F
   ```

2. **모듈 오류**
   ```bash
   # node_modules 삭제 후 재설치
   Remove-Item node_modules -Recurse -Force
   npm install
   ```

## ✅ 테스트 완료 체크리스트

배포 전 모든 항목이 체크되었는지 확인:

### Frontend
- [ ] 모든 프로젝트(A1A, A1B, A1C)가 정상 작동
- [ ] 마우스/키보드 인터랙션 작동
- [ ] 브라우저 콘솔에 오류 없음
- [ ] 다양한 브라우저에서 테스트 완료

### Backend  
- [ ] 모든 API 엔드포인트 응답 정상
- [ ] 서버 로그에 오류 없음
- [ ] CORS 설정 정상 작동
- [ ] 데이터베이스 연결 정상

### 통합
- [ ] Frontend에서 Backend API 호출 성공
- [ ] 프로젝트 조회수 증가 확인
- [ ] 분석 데이터 표시 정상
- [ ] 좋아요 기능 작동

모든 테스트가 통과하면 배포를 진행할 수 있습니다! 🚀
