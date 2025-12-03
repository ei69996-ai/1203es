-- ============================================
-- Clerk + Supabase 통합을 위한 RLS 정책 설정
-- ============================================
-- 
-- 이 마이그레이션은 2025년 권장 방식인 네이티브 통합을 사용합니다.
-- JWT 템플릿이 필요 없으며, Clerk 세션 토큰을 직접 사용합니다.
--
-- 사용 방법:
-- 1. Supabase Dashboard > SQL Editor에서 이 파일의 내용을 실행
-- 2. 또는 Supabase CLI를 사용하여 마이그레이션 실행
-- ============================================

-- ============================================
-- 1. Users 테이블 RLS 정책
-- ============================================

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;

-- 사용자는 자신의 데이터만 조회할 수 있음
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 삽입할 수 있음
CREATE POLICY "Users can insert their own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 수정할 수 있음
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

-- 사용자는 자신의 데이터만 삭제할 수 있음
CREATE POLICY "Users can delete their own data"
ON public.users
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- ============================================
-- 2. Tasks 테이블 예시 (선택사항)
-- ============================================
-- 
-- 이 부분은 예시입니다. 실제로 tasks 테이블이 필요하지 않다면
-- 이 섹션을 삭제하거나 주석 처리하세요.

-- Tasks 테이블 생성 (이미 있다면 건너뛰기)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL DEFAULT (SELECT auth.jwt()->>'sub'),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks 테이블 정책
CREATE POLICY "Users can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

CREATE POLICY "Users can insert their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- ============================================
-- 3. 설명
-- ============================================
--
-- auth.jwt()->>'sub' 함수는 Clerk 세션 토큰에서 사용자 ID를 추출합니다.
-- 이는 Clerk Dashboard에서 Supabase 통합을 활성화한 후에만 작동합니다.
--
-- 정책 작동 방식:
-- - TO authenticated: 인증된 사용자만 (Clerk로 로그인한 사용자)
-- - USING: SELECT, UPDATE, DELETE 시 조건 확인
-- - WITH CHECK: INSERT, UPDATE 시 조건 확인
--
-- 각 사용자는 자신의 clerk_id와 일치하는 데이터만 접근할 수 있습니다.

