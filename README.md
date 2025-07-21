# E-commerce 플랫폼 실시간 대시보드

Next.js 14 app router 및 supabase를 기반으로 한 E-commerce 플랫폼을 위한 실시간 데이터 모니터링 및 비즈니스 인사이트 제공 대시보드입니다.

## 🚀 주요 기능

### 1. 기본 인증

- **로그인/로그아웃**: 이메일/비밀번호 기반 인증
- **Supabase Auth**: 안전한 사용자 인증 시스템
- **세션 관리**: 자동 세션 관리 및 보안

### 2. 메인 대시보드

- **KPI 카드 (4개)**:
  - 오늘 매출
  - 오늘 주문 수
  - 활성 사용자 수
  - 전환율

- **실시간 차트 (3개)**:
  - 시간별 매출 추이 (라인 차트)
  - 주문 상태별 분포 (도넛 차트)
  - 상품 카테고리별 판매 (바 차트)

### 3. 실시간 업데이트

- **자동 새로고침**: 1분마다 데이터 업데이트
- **차트 자동 갱신**: 실시간 데이터 반영
- **로딩 상태 표시**: 사용자 경험 최적화

### 4. 기본 필터링

- **날짜 선택**: 오늘, 어제, 최근 7일
- **차트 데이터 필터링**: 동적 데이터 조회

### 5. 데이터 관리

- **내보내기**: CSV, Excel 형태로 데이터 내보내기

### 6. 소셜 로그인 (구현 예정)

- Google 로그인
- GitHub 로그인

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Form**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **API**: Supabase REST API
- **Edge Functions**: Supabase Edge Functions

### DevOps & Tools

- **Deployment**: Vercel
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **Security**: CodeQL Analysis
- **Performance**: Lighthouse CI
- **Bundle Analysis**: Next.js Bundle Analyzer
- **Data Export**: SheetJS (xlsx)
- **Testing**: Jest + React Testing Library (구현 예정)

## 🔄 Git Hooks & CI/CD

### Pre-commit Hooks

- **ESLint**: 코드 품질 자동 검사
- **Prettier**: 코드 포맷팅 자동 적용
- **Type Check**: TypeScript 타입 검증

### Commit Message

다음 형식을 따라야 합니다:

```
type(scope): description

예시:
feat(products): add export functionality
fix: resolve navigation issue
docs: update README
```

### GitHub Actions 워크플로우

- **CI Pipeline**: 코드 품질 검사, 빌드, 타입 체크
- **Performance**: Lighthouse 성능 감사
- **Dependency Updates**: 자동 의존성 업데이트
- **Deployment**: Vercel 자동 배포

## 📊 대시보드 화면

### 홈페이지

- 어드민 페이지 첫 렌딩페이지지
- 로그인 페이지로 이동

### 로그인 페이지

- 이메일/비밀번호 로그인
- 소셜 로그인 버튼 (구현 예정)
- 반응형 디자인

### 메인 대시보드

- 4개의 KPI 카드로 핵심 지표 표시
- 3개의 실시간 차트
- 날짜 필터링 기능
- 데이터 내보내기 기능
- 실시간 업데이트 상태 표시

## 🔧 개발 가이드

### 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── dashboard/       # 대시보드 페이지
│   ├── login/          # 로그인 페이지
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 홈페이지
├── components/         # 재사용 가능한 컴포넌트
│   ├── ui/            # shadcn/ui 컴포넌트
│   └── dashboard/     # 대시보드 관련 컴포넌트
├── lib/               # 유틸리티 및 설정
├── store/             # Zustand 상태 관리
└── styles/            # 스타일 파일
```

### 상태 관리

- **Auth Store**: 사용자 인증 상태 관리
- **Dashboard Store**: 대시보드 데이터 및 실시간 업데이트 관리

### 컴포넌트 구조

- **KPICard**: 핵심 지표 카드 컴포넌트
- **RevenueChart**: 시간별 매출 라인 차트
- **OrderStatusChart**: 주문 상태 도넛 차트
- **CategoryChart**: 카테고리별 바 차트

## 🚀 배포

### Vercel 배포

1. Vercel 계정에 연결
2. 환경 변수 설정
3. 자동 배포 설정

### Supabase 설정

1. Supabase 프로젝트 생성
2. 데이터베이스 테이블 설정
3. 인증 설정
4. API 키 복사

## 📝 완료된 기능 및 향후 계획

### ✅ 완료된 기능

- [x] 실제 Supabase 데이터베이스 연동
- [x] 상품 관리 시스템 (CRUD, 이미지 업로드)
- [x] 벌크 작업 (일괄 삭제/수정)
- [x] 상품 복제 기능
- [x] Excel 데이터 내보내기
- [x] Git Hooks 설정 (Husky, lint-staged)
- [x] CI/CD 파이프라인 구성 (GitHub Actions)
- [x] 코드 품질 도구 (ESLint, Prettier)
- [x] 보안 스캔 (CodeQL)
- [x] 성능 감사 (Lighthouse)
- [x] 소셜 로그인 구현(Github)
- [x] 다국어 지원(Kor,Eng)
- [x] 주문 관리 시스템

### 🚧 진행 중

- [ ] 사용자 관리 고도화
- [ ] 실시간 알림 시스템

### 📋 향후 계획

- [ ] 유닛 테스트 추가
- [ ] 모바일 최적화
- [ ] 고급 분석 기능
- [ ] API 문서화
