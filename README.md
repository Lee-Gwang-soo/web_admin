# E-commerce 관리자 대시보드

Next.js 15 및 Supabase를 기반으로 한 실시간 이커머스 관리 플랫폼입니다. 실시간 데이터 모니터링, 상품/주문/사용자 관리, 다국어 지원 기능을 제공합니다.

## 🚀 주요 기능

### 1. 인증 시스템

- **이메일/비밀번호 로그인**: Supabase Auth 기반 안전한 인증
- **GitHub OAuth**: 소셜 로그인 지원
- **자동 세션 관리**: 토큰 자동 갱신 및 보안 처리
- **디버그 로깅**: localStorage 기반 인증 로그 추적

### 2. 실시간 대시보드

#### KPI 지표 (4개)

- 오늘 매출 (전일 대비 변화율)
- 오늘 주문 수 (전일 대비 변화율)
- 환불 수 (전일 대비 변화율)
- 반품 수 (전일 대비 변화율)

#### 실시간 차트 (4개)

- **시간별 매출 추이**: 24시간 라인 차트
- **주문 상태별 분포**: 도넛 차트
- **카테고리별 매출**: 바 차트
- **카테고리별 판매건수**: 바 차트 (신규)

#### 실시간 업데이트

- **자동 새로고침**: 1분마다 백그라운드 업데이트
- **부드러운 UX**: 자동 새로고침 시 skeleton UI 미표시
- **수동 새로고침**: 버튼 클릭으로 즉시 업데이트

#### 날짜 필터링

- 오늘
- 어제
- 최근 7일

### 3. 상품 관리

- **CRUD 작업**: 상품 등록, 수정, 삭제, 조회
- **이미지 관리**: Supabase Storage 연동 업로드
- **벌크 작업**: 다중 선택 일괄 수정/삭제
- **상품 복제**: 기존 상품 복사 기능
- **검색 & 필터링**: 상품명, 카테고리별 검색
- **Excel 내보내기**: 상품 목록 다운로드

### 4. 주문 관리

- **주문 조회**: 전체 주문 내역 확인
- **상태 관리**: 주문 상태 업데이트 (주문접수 → 배송완료)
- **상세 정보**: 주문 상품, 결제 정보 확인
- **검색**: 주문 ID, 고객 이메일로 검색
- **Excel 내보내기**: 주문 데이터 다운로드

### 5. 사용자 관리

- **사용자 조회**: 등록된 사용자 목록
- **주문 내역**: 사용자별 주문 내역 확인
- **검색**: 이름, 이메일로 검색

### 6. 다국어 지원

- **한국어/영어**: 전체 UI 다국어 지원
- **동적 전환**: 실시간 언어 변경
- **커스텀 i18n**: Zustand 기반 경량 구현

### 7. 테마 시스템

- **다크/라이트 모드**: 사용자 선호도 기반
- **시스템 설정 연동**: OS 테마 자동 감지
- **localStorage 저장**: 설정 영구 저장

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 15.4.1 (App Router + Turbopack)
- **React**: 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand 5.0.6
- **Charts**: Recharts 3.1.0, Chart.js 4.5.0
- **Data Fetching**: TanStack Query 5.83.0
- **Form Validation**: React Hook Form 7.60.0 + Zod 4.0.5
- **Animation**: Framer Motion 12.23.6
- **Icons**: Lucide React 0.525.0
- **Data Export**: xlsx 0.18.5

### Backend & Services

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + GitHub OAuth)
- **Storage**: Supabase Storage (이미지 업로드)
- **API**: Supabase REST API

### DevOps & Tools

- **Deployment**: Vercel (Seoul region - icn1)
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **Security**: CodeQL Analysis
- **Performance**: Lighthouse CI

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # 대시보드 페이지
│   ├── login/              # 로그인 페이지
│   ├── orders/             # 주문 관리
│   ├── products/           # 상품 관리
│   ├── users/              # 사용자 관리
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 랜딩 페이지
├── components/             # 컴포넌트 (Atomic Design)
│   ├── atoms/              # 기본 빌딩 블록
│   ├── molecules/          # 복합 컴포넌트
│   ├── organisms/          # 복잡한 섹션
│   ├── templates/          # 페이지 레이아웃
│   ├── layout/             # 레이아웃 래퍼
│   ├── common/             # 공유 컴포넌트
│   ├── dashboard/          # 대시보드 차트
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/                    # 유틸리티 및 설정
│   ├── supabase.ts         # Supabase 클라이언트 및 API
│   └── react-query.tsx     # TanStack Query 설정
├── store/                  # Zustand 스토어
│   ├── auth-store.ts       # 인증 상태
│   ├── dashboard-store.ts  # 대시보드 데이터
│   ├── theme-store.ts      # 테마 설정
│   ├── i18n-store.ts       # 다국어 설정
│   ├── products-store.ts   # 상품 관리
│   ├── orders-store.ts     # 주문 관리
│   └── users-store.ts      # 사용자 관리
├── locales/                # 다국어 번역 파일
│   ├── ko.json             # 한국어
│   └── en.json             # 영어
└── styles/                 # 글로벌 스타일
```

## 🔄 상태 관리 (Zustand)

### 7개의 전역 스토어

1. **auth-store**: 사용자 인증 및 세션 관리
2. **theme-store**: 다크/라이트 테마 관리
3. **i18n-store**: 다국어 지원 (커스텀 구현)
4. **dashboard-store**: KPI 지표 및 차트 데이터
5. **products-store**: 상품 목록, 페이지네이션, 필터링
6. **orders-store**: 주문 관리 및 상태 업데이트
7. **users-store**: 사용자 목록 및 주문 내역

### 사용 패턴

```typescript
// 세분화된 셀렉터로 불필요한 리렌더링 방지
const user = useAuthStore((state) => state.user);
const loading = useAuthStore((state) => state.loading);
```

## 🔧 개발 명령어

```bash
# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm run start

# 코드 품질
npm run lint              # ESLint 실행
npm run lint:fix          # ESLint 자동 수정
npm run format            # Prettier 포맷팅
npm run format:check      # 포맷팅 검사
npm run type-check        # TypeScript 타입 검사

# Git Hooks
npm run prepare           # Husky 설정
```

## 📝 Git 컨벤션

### Commit Message 형식

```
type(scope): description

예시:
feat(products): add bulk delete functionality
fix(auth): resolve GitHub OAuth redirect issue
docs: update README
refactor(dashboard): improve chart rendering
```

**타입**: feat, fix, docs, style, refactor, test, chore

### Pre-commit Hooks

- ESLint 자동 수정 (`.{js,jsx,ts,tsx}` 파일)
- Prettier 포맷팅 (모든 파일)
- `git commit` 시 자동 실행

## 🚀 배포

### 환경 변수 설정 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel 배포

- **리전**: Seoul (icn1)
- **함수 타임아웃**: 60초
- **보안 헤더**: 자동 설정
- **자동 배포**: main 브랜치 push 시

### Supabase 설정

1. Supabase 프로젝트 생성
2. 데이터베이스 테이블 설정:
   - `admin_user`: 관리자 계정
   - `products`: 상품 정보
   - `orders`: 주문 정보
   - `order_items`: 주문 상품 상세
   - `commerce_user`: 일반 사용자
3. Storage 버킷 생성: `product-images`
4. GitHub OAuth 설정 (인증 > 공급자)

## 🎨 주요 기능 구현

### 1. 자동 새로고침 최적화

```typescript
// 수동 새로고침: loading 상태 표시
fetchDashboardData(false);

// 자동 새로고침: isRefreshing만 true (skeleton UI 없음)
fetchDashboardData(true);
```

### 2. 다국어 지원

```typescript
const { t } = useTranslation();
t('common.save'); // "저장"
t('greeting', { name: 'John' }); // 파라미터 치환
```

### 3. 이미지 업로드

```typescript
// Supabase Storage 직접 업로드
const imageUrl = await supabaseApi.uploadProductImage(file);
```

## 📊 완료된 기능

### ✅ 핵심 기능

- [x] Supabase 데이터베이스 연동
- [x] GitHub OAuth 소셜 로그인
- [x] 다국어 지원 (한국어/영어)
- [x] 실시간 대시보드 (자동 새로고침)
- [x] 상품 관리 시스템 (CRUD, 이미지 업로드)
- [x] 주문 관리 시스템 (상태 업데이트)
- [x] 사용자 관리 시스템
- [x] Excel 데이터 내보내기
- [x] 다크/라이트 테마
- [x] 반응형 디자인

### ✅ 개발 환경

- [x] Git Hooks (Husky, lint-staged)
- [x] CI/CD 파이프라인 (GitHub Actions)
- [x] 코드 품질 도구 (ESLint, Prettier)
- [x] 보안 스캔 (CodeQL)
- [x] 성능 감사 (Lighthouse)
- [x] TypeScript strict mode

## 🚧 향후 계획

- [ ] 유닛 테스트 추가 (Jest + React Testing Library)
- [ ] 실시간 알림 시스템
- [ ] 고급 분석 기능 (매출 예측, 트렌드 분석)
- [ ] API 문서화 (Swagger)
- [ ] 모바일 앱 최적화

## 📚 문서

- [CLAUDE.md](./CLAUDE.md) - AI 개발 가이드
- [CONVENTION.md](./CONVENTION.md) - 개발 워크플로우 및 PR 체크리스트

## 📄 라이선스

MIT License
