# 🚀 배포 자동화 가이드

Interactive Media Assignment의 배포 프로세스가 완전히 자동화되었습니다.

## 📋 사전 요구사항

### AWS 설정
```bash
# AWS CLI 설치 (이미 설치되었다면 스킵)
# macOS: brew install awscli
# Windows: choco install awscliv2
# Linux: curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

# AWS 자격증명 구성
aws configure

# SAM CLI 설치 (필수)
# macOS: brew install aws-sam-cli
# Windows: choco install aws-sam-cli
# Linux: pip install aws-sam-cli
```

### Node.js & npm
```bash
node --version  # v18 이상 필요
npm --version   # 8 이상 필요
```

## 🔧 설정

### 1. 프로젝트 의존성 설치
```bash
# 루트에서 모든 워크스페이스의 의존성 설치
npm install
```

### 2. 개발 모드 실행
```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 프론트엔드만 실행 (http://localhost:3000)
npm run dev:frontend

# 백엔드만 실행
npm run dev:backend
```

### 3. 로컬 빌드 테스트
```bash
# 전체 빌드
npm run build

# 프론트엔드만 빌드 (dist/ 폴더 생성)
npm run build:frontend

# 백엔드 빌드
npm run build:backend
```

## 🚀 배포

### Node.js 기반 배포 (권장)
```bash
# 프로덕션 배포 (Linux/macOS/PowerShell)
npm run deploy:prod
```

### PowerShell 스크립트 기반 배포 (Windows)
```powershell
# PowerShell에서 실행
.\scripts\deploy.ps1

# dev 스테이지에 배포
.\scripts\deploy.ps1 -Stage dev

# 빌드 건너뛰고 배포만
.\scripts\deploy.ps1 -SkipBuild
```

## 📊 배포 프로세스 상세

배포 스크립트는 다음 5단계를 자동으로 실행합니다:

### 1️⃣ 프론트엔드 빌드
```bash
npm -w frontend run build
```
- Vite로 프론트엔드 최소화 및 번들화
- 결과: `frontend/dist/` 디렉토리

### 2️⃣ AWS 인프라 배포
```bash
sam deploy --stack-name interactive-media-prod \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Stage=prod
```
- CloudFormation 스택 생성/업데이트
- Lambda, API Gateway, DynamoDB, S3, CloudFront 배포

### 3️⃣ 스택 출력 검색
AWS CloudFormation 스택에서:
- S3 버킷 이름
- CloudFront Distribution ID

### 4️⃣ 프론트엔드를 S3에 동기화
```bash
aws s3 sync frontend/dist/ s3://<bucket-name>/ --delete
```
- `frontend/dist/`의 모든 파일을 S3에 업로드
- 불필요한 파일 삭제

### 5️⃣ CloudFront 캐시 무효화
```bash
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/*"
```
- 엣지 로케이션의 캐시 초기화
- 새 콘텐츠가 즉시 제공됨

## 📁 프로젝트 구조 (업데이트됨)

```
Interactive Media Assignment/
├── package.json                 # 루트 워크스페이스 설정
├── template.yaml               # AWS SAM 템플릿
├── frontend/
│   ├── package.json           # 프론트엔드 워크스페이스
│   ├── vite.config.js         # Vite 빌드 설정
│   ├── index.html             # 진입점
│   ├── js/                    # JavaScript 소스
│   ├── css/                   # 스타일시트
│   ├── assets/                # 리소스
│   └── dist/                  # 빌드 결과 (배포용)
├── backend/
│   ├── package.json           # 백엔드 워크스페이스
│   ├── api/
│   │   └── index.js          # Express 서버
│   └── utils/
│       └── database.js        # DB 유틸
├── scripts/
│   ├── deploy.js             # Node.js 배포 스크립트
│   └── deploy.ps1            # PowerShell 배포 스크립트
└── docs/                      # 문서
```

## 🔍 배포 결과 확인

배포 완료 후:

```
✅ 배포 성공!

📊 배포 요약:
  • 스택 이름: interactive-media-prod
  • S3 버킷: interactive-media-prod-static-assets
  • CloudFront: d123.cloudfront.net
  • 프론트엔드 위치: s3://interactive-media-prod-static-assets/

🔗 애플리케이션 접근:
  https://d123.cloudfront.net
```

## 🔄 배포 후 작업

### 1. 애플리케이션 테스트
```bash
# CloudFront URL에서 애플리케이션 확인
https://<distribution-id>.cloudfront.net
```

### 2. 로그 확인
```bash
# Lambda 로그 보기
sam logs -n InteractiveMediaAPI --stack-name interactive-media-prod -t

# 또는 AWS Console
# CloudWatch → Log Groups → /aws/lambda/interactive-media-prod-InteractiveMediaAPI-...
```

### 3. 모니터링
```bash
# CloudFormation 이벤트 확인
aws cloudformation describe-stack-events --stack-name interactive-media-prod

# API Gateway 메트릭 확인
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300
```

## 🔙 롤백 방법

### 이전 버전으로 롤백
```bash
# 배포 중단
aws cloudformation cancel-update-stack --stack-name interactive-media-prod

# 또는 이전 버전으로 직접 업데이트
sam deploy --stack-name interactive-media-prod \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Stage=prod
```

### 완전 삭제
```bash
# ⚠️ 모든 리소스 삭제 (되돌릴 수 없음)
aws cloudformation delete-stack --stack-name interactive-media-prod

# 삭제 확인
aws cloudformation wait stack-delete-complete --stack-name interactive-media-prod
```

## 🆘 문제 해결

### S3 동기화 실패
```bash
# AWS 자격증명 확인
aws sts get-caller-identity

# S3 버킷 권한 확인
aws s3 ls s3://<bucket-name>/
```

### CloudFront 캐시 문제
```bash
# 수동 무효화
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/*"

# 무효화 상태 확인
aws cloudfront list-invalidations --distribution-id <dist-id>
```

### Lambda 함수 오류
```bash
# 최근 로그 확인
sam logs -n InteractiveMediaAPI --stack-name interactive-media-prod -t

# 함수 구성 확인
aws lambda get-function-configuration \
  --function-name interactive-media-prod-InteractiveMediaAPI-...
```

## 📚 추가 리소스

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Vite Documentation](https://vitejs.dev/)
- [AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)

## 💡 성능 최적화 팁

### 프론트엔드
```bash
# 원본 소스맵 비활성화 (프로덕션)
# vite.config.js에서 이미 설정됨
build: {
  sourcemap: false,
  minify: 'terser'
}
```

### CloudFront 캐시 전략
- HTML: 캐시 비활성화 (max-age=0)
- JS/CSS: 1년 캐싱 (해시 기반 파일명)
- 이미지: 1개월 캐싱

### Lambda 최적화
```yaml
# template.yaml
Globals:
  Function:
    Timeout: 30           # 필요에 따라 조정
    MemorySize: 512       # 512MB ≈ 0.5 vCPU
```

---

**배포 자동화로 인해 수작업 오류가 줄어들고, 배포 시간이 단축되었습니다! 🎉**
