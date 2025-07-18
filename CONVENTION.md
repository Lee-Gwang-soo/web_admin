## 🛠 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Git

### 프로젝트 설정

```bash
# 저장소 클론
git clone [repository-url]
cd admin_web

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 Supabase 설정 추가

# 개발 서버 실행
npm run dev
```

## 📝 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따라야 합니다:

```
type(scope): description

feat(products): add export functionality
fix: resolve navigation issue
docs: update README
style: fix linting errors
refactor(dashboard): improve chart components
test: add unit tests for auth
chore: update dependencies
```

### 타입별 설명

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스나 도구 변경

## 🔄 개발 워크플로우

### 1. 브랜치 생성

```bash
# 기능 개발
git checkout -b feat/feature-name

# 버그 수정
git checkout -b fix/bug-description

# 문서 작업
git checkout -b docs/documentation-update
```

### 2. 개발 과정

```bash
# 코드 작성 후 포맷팅 확인
npm run format:check

# 린트 에러 수정
npm run lint:fix

# 타입 체크
npm run type-check

# 빌드 테스트
npm run build
```

### 3. 커밋 및 푸시

```bash
# 스테이징 (lint-staged가 자동으로 실행됨)
git add .

# 커밋 (commit-msg hook이 메시지 형식 검증)
git commit -m "feat(products): add bulk operations"

# 푸시
git push origin feat/feature-name
```

### 4. Pull Request 생성

- 명확한 제목과 설명 작성
- 변경사항 요약
- 스크린샷 첨부 (UI 변경 시)
- 관련 이슈 링크

## 🧪 코드 품질 기준

### ESLint 규칙

- Next.js 권장 설정
- TypeScript 엄격 모드
- Prettier와 통합

### 커밋 전 자동 실행

- ESLint 자동 수정
- Prettier 포맷팅
- 타입 체크
- 빌드 검증

## 🚀 CI/CD 파이프라인

### Pull Request 시 실행

- 코드 품질 검사 (ESLint, Prettier)
- 타입 체크
- 빌드 테스트
- 보안 감사
- 미리보기 배포

### Main 브랜치 머지 시 실행

- 프로덕션 빌드
- 자동 배포 (Vercel)
- 성능 감사 (Lighthouse)
- 번들 크기 분석

## 📋 체크리스트

PR 생성 전 확인사항:

- [ ] 커밋 메시지가 규칙을 따름
- [ ] 린트 에러가 없음
- [ ] 타입 에러가 없음
- [ ] 빌드가 성공함
- [ ] 기능이 정상 작동함
- [ ] 문서가 업데이트됨 (필요시)

## 🆘 도움이 필요한 경우

- GitHub Issues에서 질문 등록
- 팀 Slack 채널 활용
- 코드 리뷰어에게 직접 문의

---

모든 기여자는 이 가이드라인을 준수해야 하며, 프로젝트의 품질과 일관성을 유지하는 데 도움을 줍니다.
