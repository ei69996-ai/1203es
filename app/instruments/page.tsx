import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Instruments 예제 페이지
 * 
 * Supabase 공식 문서의 패턴을 따릅니다:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 이 페이지는 Server Component에서 Supabase 데이터를 조회하는 방법을 보여줍니다.
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">에러 발생</h3>
        <p className="text-sm text-red-700">{error.message}</p>
        <p className="text-xs text-red-600 mt-2">
          💡 <strong>해결 방법:</strong>
          <br />
          1. Supabase Dashboard에서 <code>instruments</code> 테이블이 생성되었는지 확인
          <br />
          2. RLS 정책이 올바르게 설정되었는지 확인
          <br />
          3. 환경 변수가 올바르게 설정되었는지 확인
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-gray-50">
        <p className="text-gray-600 mb-2">아직 악기 데이터가 없습니다.</p>
        <p className="text-sm text-gray-500">
          Supabase Dashboard에서 <code>instruments</code> 테이블에 데이터를 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">악기 목록</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: any) => (
          <li
            key={instrument.id}
            className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{instrument.name}</span>
              <span className="text-sm text-gray-500">ID: {instrument.id}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">💡 이 페이지의 작동 원리</h3>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>
            <strong>Server Component:</strong> 서버에서 데이터를 가져와 렌더링
          </li>
          <li>
            <strong>Suspense:</strong> 로딩 상태를 처리하는 React Suspense 사용
          </li>
          <li>
            <strong>Supabase Client:</strong> Server Component에서 Supabase 데이터 조회
          </li>
          <li>
            <strong>에러 처리:</strong> 데이터 조회 실패 시 사용자 친화적인 에러 메시지 표시
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Instruments 예제</h1>
        <p className="text-gray-600">
          Supabase 공식 문서의 패턴을 따르는 예제입니다. Server Component에서
          Supabase 데이터를 조회하는 방법을 보여줍니다.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center border rounded-lg bg-gray-50">
            <p className="text-gray-600">악기 데이터를 불러오는 중...</p>
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>

      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">📝 테이블 생성 방법</h3>
        <p className="text-sm text-yellow-900 mb-2">
          Supabase Dashboard의 SQL Editor에서 다음 SQL을 실행하세요:
        </p>
        <pre className="bg-white p-4 rounded border text-xs overflow-x-auto">
          {`-- instruments 테이블 생성
CREATE TABLE IF NOT EXISTS instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO instruments (name)
VALUES
  ('violin'),
  ('viola'),
  ('cello');

-- RLS 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (예제용)
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);`}
        </pre>
      </div>
    </div>
  );
}

