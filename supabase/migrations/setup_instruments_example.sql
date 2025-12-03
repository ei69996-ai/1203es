-- ============================================
-- Supabase 공식 문서 예제: Instruments 테이블
-- ============================================
-- 
-- 이 마이그레이션은 Supabase 공식 문서의 예제를 기반으로 합니다:
-- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
--
-- 사용 방법:
-- 1. Supabase Dashboard > SQL Editor에서 이 파일의 내용을 실행
-- 2. 또는 Supabase CLI를 사용하여 마이그레이션 실행
-- ============================================

-- Instruments 테이블 생성
CREATE TABLE IF NOT EXISTS public.instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO public.instruments (name)
VALUES
  ('violin'),
  ('viola'),
  ('cello')
ON CONFLICT DO NOTHING;

-- RLS 활성화
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (예제용 - 모든 사용자가 읽을 수 있음)
-- 프로덕션에서는 더 엄격한 정책을 사용하세요
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);

-- 인증된 사용자도 읽을 수 있도록 정책 추가
CREATE POLICY "authenticated can read instruments"
ON public.instruments
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 설명
-- ============================================
--
-- 이 테이블은 Supabase 공식 문서의 예제입니다.
-- /instruments 페이지에서 이 데이터를 조회할 수 있습니다.
--
-- 정책 설명:
-- - TO anon: 인증되지 않은 사용자도 읽기 가능 (예제용)
-- - TO authenticated: 인증된 사용자도 읽기 가능
--
-- 프로덕션 환경에서는:
-- - 더 엄격한 RLS 정책 사용
-- - 사용자별 데이터 접근 제한
-- - INSERT, UPDATE, DELETE 정책 추가

