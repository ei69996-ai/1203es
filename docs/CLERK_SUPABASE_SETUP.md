# Clerk + Supabase 통합 설정 가이드

이 가이드는 2025년 최신 모범 사례에 따라 Clerk와 Supabase를 통합하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [사전 준비사항](#사전-준비사항)
3. [1단계: Clerk 설정](#1단계-clerk-설정)
4. [2단계: Supabase 설정](#2단계-supabase-설정)
5. [3단계: 환경 변수 설정](#3단계-환경-변수-설정)
6. [4단계: RLS 정책 설정](#4단계-rls-정책-설정)
7. [5단계: 테스트](#5단계-테스트)
8. [문제 해결](#문제-해결)

## 개요

### 2025년 새로운 통합 방식

2025년 4월 1일부터 **JWT 템플릿 방식이 deprecated**되었고, **네이티브 third-party 통합**이 권장됩니다.

**장점:**
- ✅ JWT 템플릿 불필요
- ✅ Supabase JWT secret key를 Clerk에 공유할 필요 없음
- ✅ 더 간단한 설정
- ✅ 더 안전한 인증 흐름

### 작동 원리

1. 사용자가 Clerk로 로그인
2. Clerk가 세션 토큰 발급
3. Supabase 클라이언트가 Clerk 토큰을 자동으로 전달
4. Supabase가 Clerk를 third-party provider로 인식하여 토큰 검증
5. RLS 정책이 `auth.jwt()->>'sub'`로 사용자 ID 확인

## 사전 준비사항

- [ ] Clerk 계정 생성 (https://clerk.com)
- [ ] Supabase 계정 생성 (https://supabase.com)
- [ ] Next.js 프로젝트 설정 완료

## 1단계: Clerk 설정

### 1.1 Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com)에 로그인
2. 왼쪽 메뉴에서 **"Integrations"** 또는 **"Setup"** 클릭
3. **"Supabase"** 찾기
4. **"Activate Supabase integration"** 클릭
5. **Clerk domain** 복사 (예: `your-app.clerk.accounts.dev`)
   - 이 값은 나중에 Supabase에서 사용합니다

### 1.2 Clerk API 키 확인

1. Clerk Dashboard에서 **"API Keys"** 메뉴로 이동
2. 다음 키들을 복사해두세요:
   - **Publishable Key** (예: `pk_test_...`)
   - **Secret Key** (예: `sk_test_...`)

## 2단계: Supabase 설정

### 2.1 Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. **"New Project"** 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 지역 선택
4. 프로젝트 생성 완료 대기 (약 2분)

### 2.2 Clerk를 Third-Party Provider로 추가

1. Supabase Dashboard에서 프로젝트 선택
2. 왼쪽 메뉴에서 **"Authentication"** 클릭
3. **"Providers"** 또는 **"Sign In / Up"** 탭 선택
4. **"Add provider"** 또는 **"Third-party providers"** 섹션 찾기
5. **"Clerk"** 선택
6. 1단계에서 복사한 **Clerk domain** 붙여넣기
   - 예: `your-app.clerk.accounts.dev`
7. **"Save"** 클릭

### 2.3 Supabase API 키 확인

1. Supabase Dashboard에서 **"Project Settings"** 클릭
2. **"API"** 메뉴 선택
3. 다음 값들을 복사해두세요:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** 키 (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** 키 (서버 사이드 전용, 클라이언트에 노출 금지)

## 3단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Clerk 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_실제_키_입력
CLERK_SECRET_KEY=sk_test_여기에_실제_키_입력

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://여기에_프로젝트_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.여기에_실제_키_입력

# Supabase Service Role Key (서버 사이드 전용)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.여기에_실제_키_입력
```

**⚠️ 중요:**
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- 실제 키 값으로 교체해야 합니다
- `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트에서도 사용 가능합니다

## 4단계: RLS 정책 설정

### 4.1 데이터베이스 테이블 생성

Supabase Dashboard > SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- Users 테이블 (이미 있다면 건너뛰기)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

### 4.2 RLS 정책 적용

`supabase/migrations/setup_rls_policies.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

또는 다음 SQL을 직접 실행할 수 있습니다:

```sql
-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 삽입
CREATE POLICY "Users can insert their own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 수정
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);
```

## 5단계: 테스트

### 5.1 개발 서버 실행

터미널에서 다음 명령어를 실행하세요:

```bash
pnpm dev
```

### 5.2 인증 테스트 페이지 확인

1. 브라우저에서 `http://localhost:3000` 접속
2. **"Clerk + Supabase 인증 연동"** 버튼 클릭
3. Clerk로 로그인
4. 연결 상태가 "연결 성공!"으로 표시되는지 확인
5. 사용자 데이터가 올바르게 표시되는지 확인

### 5.3 데이터베이스 확인

1. Supabase Dashboard > Table Editor에서 `users` 테이블 확인
2. 로그인한 사용자의 데이터가 생성되었는지 확인
3. `clerk_id` 컬럼에 Clerk 사용자 ID가 저장되었는지 확인

## 문제 해결

### 문제 1: "연결 실패" 오류

**해결 방법:**
1. Clerk Dashboard에서 Supabase 통합이 활성화되었는지 확인
2. Supabase Dashboard에서 Clerk provider가 추가되었는지 확인
3. Clerk domain이 올바르게 입력되었는지 확인
4. 환경 변수가 올바르게 설정되었는지 확인

### 문제 2: "RLS policy violation" 오류

**해결 방법:**
1. RLS 정책이 올바르게 생성되었는지 확인
2. `auth.jwt()->>'sub'` 함수가 올바르게 작동하는지 확인
3. 테이블의 `clerk_id` 컬럼이 올바르게 설정되었는지 확인

### 문제 3: "Unauthorized" 오류

**해결 방법:**
1. Clerk 세션 토큰이 올바르게 전달되는지 확인
2. Supabase에서 Clerk provider 설정이 올바른지 확인
3. 브라우저 개발자 도구에서 네트워크 요청 확인

### 문제 4: 사용자 데이터가 생성되지 않음

**해결 방법:**
1. `SyncUserProvider`가 `app/layout.tsx`에 추가되었는지 확인
2. `hooks/use-sync-user.ts` 파일이 올바르게 작동하는지 확인
3. Supabase 테이블 권한이 올바르게 설정되었는지 확인

## Supabase 공식 문서 패턴

이 프로젝트는 Supabase 공식 문서의 모범 사례를 따릅니다:

- **Server Component**: `await createClient()` 패턴 사용
- **환경 변수**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` 또는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 지원
- **예제 페이지**: `/instruments` 페이지에서 Supabase 공식 문서 예제 확인 가능

자세한 내용은 [Supabase 공식 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)를 참고하세요.

## 추가 리소스

- [Clerk 공식 문서 - Supabase 통합](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase 공식 문서 - Third-party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase 공식 문서 - Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [프로젝트 README](../README.md)

## 다음 단계

통합이 완료되면 다음을 진행할 수 있습니다:

1. ✅ 추가 테이블 생성 및 RLS 정책 설정
2. ✅ Storage 기능 사용
3. ✅ Realtime 기능 사용
4. ✅ Edge Functions 사용

