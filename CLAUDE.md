# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

Next.js 15 기반의 이커머스 관리자 대시보드. Supabase 백엔드를 사용하며, 실시간 데이터 모니터링, 상품/주문/사용자 관리, 다국어 지원(한국어/영어), GitHub OAuth 인증 기능을 제공합니다.

## 개발 명령어

```bash
# 개발
npm run dev              # Turbopack을 사용한 개발 서버 시작
npm run build           # 프로덕션 빌드
npm run start           # 프로덕션 서버 시작

# 코드 품질
npm run lint            # ESLint 실행
npm run lint:fix        # ESLint 문제 자동 수정
npm run format          # Prettier로 포맷팅
npm run format:check    # 포맷팅 검사
npm run type-check      # TypeScript 타입 검사

# Git Hooks
npm run prepare         # Husky hooks 설정
```

## 아키텍처

### 상태 관리 (Zustand + React Query)

애플리케이션은 **하이브리드 상태 관리 전략**을 사용합니다:

#### 🔄 React Query (TanStack Query v5) - 서버 상태

- **위치**: `src/hooks/use*Queries.ts`
- **역할**: API 데이터 fetching, 캐싱, 동기화
- **주요 기능**:
  - 자동 캐싱 및 백그라운드 재검증
  - 낙관적 업데이트 (Optimistic Updates)
  - 중복 요청 자동 제거
  - 에러 처리 및 재시도 로직
  - React Query Devtools 내장

**Query Hooks**:

- `useDashboardQueries.ts`: 대시보드 KPI, 차트 데이터
- `useProductsQueries.ts`: 상품 CRUD, 이미지 업로드
- `useOrdersQueries.ts`: 주문 관리, 상태 업데이트
- `useUsersQueries.ts`: 사용자 목록 조회

#### 🎨 Zustand - UI 상태

- **위치**: `src/store/*-store.ts`
- **역할**: 클라이언트 전용 UI 상태 관리
- **관리 항목**: 검색어, 필터, 정렬, 페이지네이션, 선택된 항목, 모달 상태

**Zustand 스토어**:

1. **auth-store.ts**: 사용자 인증 및 세션 관리
   - Supabase Auth를 통한 이메일/비밀번호 및 GitHub OAuth 처리
   - URL 파라미터(#access_token)를 통한 OAuth 콜백 자동 감지
   - localStorage에 저장되는 포괄적인 디버그 로깅 (최대 100개 항목)

2. **theme-store.ts**: 다크/라이트/시스템 테마 관리
   - document root에 'dark' 클래스 적용
   - 미디어 쿼리를 통한 시스템 설정 변경 감지

3. **i18n-store.ts**: 커스텀 다국어 지원
   - import()를 통한 동적 로케일 파일 로딩
   - 파라미터 치환: `t('key', { name: 'John' })`

4. **dashboard-store.ts**: UI 상태 (날짜 필터, 자동 새로고침 인터벌)

5. **products-store.ts**: UI 상태 (검색, 카테고리 필터, 정렬, 선택, 페이지네이션)

6. **orders-store.ts**: UI 상태 (검색, 상태 필터, 정렬, 선택, 페이지네이션)

7. **users-store.ts**: UI 상태 (검색, 선택된 사용자)

**사용 패턴**:

```typescript
// UI 상태 (Zustand)
const searchTerm = useProductsStore((state) => state.searchTerm);
const setSearchTerm = useProductsStore((state) => state.setSearchTerm);

// 서버 데이터 (React Query)
const { data: products, isLoading } = useProducts(searchTerm);
```

📖 **상세 가이드**: `REACT_QUERY_MIGRATION.md` 참조

### 컴포넌트 아키텍처 (Atomic Design)

```
src/components/
├── atoms/          # 기본 빌딩 블록 (LoadingSpinner, StatusBadge)
├── molecules/      # 복합 컴포넌트 (SearchBar, Pagination)
├── organisms/      # 복잡한 섹션 (DataTable, ProductFormModal)
├── templates/      # 페이지 레이아웃 (AdminPageTemplate, DashboardTemplate)
├── layout/         # 레이아웃 래퍼 (사이드바가 있는 AdminLayout)
├── common/         # 공유 컴포넌트 (ThemeToggle, LanguageSelector)
├── dashboard/      # 대시보드 전용 컴포넌트
└── ui/             # shadcn/ui 기본 컴포넌트
```

**AdminLayout**: 모든 대시보드 페이지를 감싸는 보호된 레이아웃

- 인증 상태를 확인하고 미인증 시 `/login`으로 리다이렉트
- 초기화 중 로딩 스피너 표시
- 사이드바 네비게이션 포함

### Supabase 통합

**위치**: `src/lib/supabase.ts`

환경 기반 폴백이 있는 단일 클라이언트 인스턴스. 모든 데이터베이스 작업은 `supabaseApi` 객체를 통해 이루어집니다:

```typescript
// 데이터베이스 테이블
users           # id, email, created_at, updated_at
products        # id, name, category, price, stock, image_url, timestamps
orders          # id, user_id, status, total_amount, customer info, timestamps
order_items     # id, order_id, product_id, quantity, price
```

**데이터 흐름**:

```
Supabase REST API
       ↓
supabaseApi functions (lib/supabase.ts)
       ↓
React Query Hooks (자동 캐싱, 재검증, 낙관적 업데이트)
       ↓
Components ← → Zustand Stores (UI 상태)
```

**캐싱 전략**:

- **staleTime**: 1-2분 (데이터가 fresh한 상태로 유지)
- **gcTime**: 5-10분 (캐시 데이터 메모리 유지 시간)
- **자동 재검증**: 네트워크 재연결 시
- **낙관적 업데이트**: 모든 mutations에 적용

### 초기화 흐름

**Root Layout** (`src/app/layout.tsx`):

```typescript
useEffect(() => {
  // 순서가 중요: Theme → i18n → Auth
  initializeTheme(); // 테마 설정 로드
  initializeI18n(); // 로케일 및 번역 로드
  initializeAuth(); // 세션 확인 및 리스너 설정
}, []);
```

**인증 초기화**:

1. 기존 세션 확인
2. URL의 OAuth 콜백 감지 (#access_token)
3. `onAuthStateChange` 리스너 설정
4. GitHub 사용자 테이블 생성 처리
5. localStorage에 디버그 로그 저장

### 다국어 지원

Zustand 기반 커스텀 i18n (next-intl 미들웨어 아님):

- 로케일 파일: `src/locales/{ko,en}.json`
- 점 표기법으로 평탄화된 동적 import
- `useTranslation()` 훅이 `t()` 함수 제공
- 개발 환경에서 누락된 번역 경고

```typescript
// 사용법
const { t } = useTranslation();
t('common.save'); // "저장"
t('greeting', { name: 'John' }); // 파라미터 치환
```

### API Routes

최소한의 API 라우트 - 주로 Supabase JS 클라이언트를 통한 클라이언트 사이드 fetching.

- `src/app/api/debug/route.ts`: 환경 확인 엔드포인트

### 환경 변수

`.env.local`에 필요:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 주요 개발 패턴

### Path Alias

import에 `@/` 사용:

```typescript
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
```

### 커밋 메시지 형식

컨벤셔널 커밋 준수:

```
type(scope): description

예시:
feat(products): add bulk delete functionality
fix(auth): resolve GitHub OAuth redirect issue
docs: update CLAUDE.md
refactor(dashboard): improve chart rendering
```

타입: feat, fix, docs, style, refactor, test, chore

### Git Hooks

Pre-commit (Husky + lint-staged):

- `.{js,jsx,ts,tsx}` 파일에 ESLint 자동 수정
- 모든 파일에 Prettier 포맷팅
- `git commit` 시 자동 실행

### 브랜치 네이밍

```bash
feat/feature-name       # 새 기능
fix/bug-description     # 버그 수정
docs/doc-update         # 문서
```

## 중요 파일

- **next.config.ts**: 이미지 최적화, Supabase storage, Turbopack 설정
- **tsconfig.json**: Path alias `@/*` → `./src/*`, strict 모드 활성화
- **vercel.json**: Seoul 리전 (icn1), 보안 헤더, 60초 함수 타임아웃
- **CONVENTION.md**: 전체 개발 워크플로우 및 PR 체크리스트

## 일반 작업

### 새로운 보호된 페이지 추가

1. `src/app/your-page/page.tsx`에 페이지 생성
2. 콘텐츠를 `<AdminLayout>`으로 감싸기
3. 사이드바 컴포넌트에 네비게이션 링크 추가

### 새로운 Zustand Store 추가

1. `src/store/your-store.ts` 파일 생성
2. TypeScript 인터페이스와 함께 기존 패턴 따르기
3. 훅 export: `export const useYourStore = create<YourStore>((set, get) => ({ ... }))`
4. 컴포넌트에서 세분화된 셀렉터 사용

### Supabase 작업

1. `lib/supabase.ts`의 `supabaseApi` 객체에 테이블 작업 추가
2. 데이터 타입에 대한 TypeScript 인터페이스 정의
3. 스토어 액션 또는 컴포넌트에서 직접 사용
4. try-catch로 에러 처리

### 번역 추가

1. `src/locales/ko.json`과 `src/locales/en.json` 모두에 키 추가
2. 정리를 위해 중첩된 객체 사용
3. 컴포넌트에서 `t('path.to.key')`로 접근
4. 파라미터 치환에는 `{{paramName}}` 사용

## CI/CD

GitHub Actions 워크플로우 (`.github/workflows/`):

- **CI Pipeline**: PR에서 코드 품질 검사, 빌드, 타입 체크
- **Deployment**: Seoul 리전으로 Vercel 자동 배포
- **Security**: CodeQL 분석
- **Performance**: Lighthouse 감사

## 기술 스택 요약

- **Framework**: Next.js 15.4.1 with App Router + Turbopack
- **React**: 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand 5.0.6
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password + GitHub OAuth)
- **i18n**: Custom Zustand store with next-intl 4.1.0
- **Forms**: React Hook Form 7.60.0 + Zod 4.0.5
- **Data Fetching**: TanStack Query 5.83.0
- **Charts**: Recharts 3.1.0, Chart.js 4.5.0
- **Animation**: Framer Motion 12.23.6
- **Data Export**: xlsx 0.18.5
- **Icons**: Lucide React 0.525.0
- **Deployment**: Vercel (Seoul region)

## 문제 해결

### 인증 문제

- 브라우저 콘솔에서 디버그 로그 확인: `localStorage.getItem('auth_debug_logs')`
- `.env.local`에서 Supabase 자격 증명 확인
- Supabase 대시보드에서 OAuth 리다이렉트 URL 확인

### 빌드 에러

- TypeScript 에러는 `npm run type-check` 실행
- ESLint 문제는 `npm run lint` 확인
- 모든 환경 변수가 설정되었는지 확인

### i18n 로딩 안됨

- `src/locales/`에 로케일 파일이 있는지 확인
- 브라우저 콘솔에서 import 에러 확인
- 로케일 코드가 파일명과 일치하는지 확인 (ko.json, en.json)
