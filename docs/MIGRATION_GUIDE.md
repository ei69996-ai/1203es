# Supabase 마이그레이션 실행 가이드

## 문제 상황

에러 메시지: `Could not find the table 'public.products' in the schema cache`

이 에러는 `products` 테이블이 Supabase 데이터베이스에 생성되지 않았을 때 발생합니다.

## 해결 방법

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **마이그레이션 파일 내용 복사**
   - 프로젝트의 `supabase/migrations/update_shopping_mall_schema.sql` 파일 열기
   - 전체 내용 복사

4. **SQL 실행**
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭
   - 성공 메시지 확인

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 실행
supabase db push
```

## 확인 방법

마이그레이션이 성공적으로 실행되었는지 확인:

1. Supabase Dashboard > Table Editor
2. `products` 테이블이 보이는지 확인
3. 샘플 데이터 20개가 들어가 있는지 확인

## 생성되는 테이블

마이그레이션 실행 후 다음 테이블들이 생성됩니다:

- `products` - 상품 정보
- `cart_items` - 장바구니 아이템
- `orders` - 주문 정보
- `order_items` - 주문 상세 아이템

## 주의사항

- 마이그레이션은 한 번만 실행하면 됩니다
- 이미 테이블이 있는 경우 `CREATE TABLE IF NOT EXISTS`로 인해 에러 없이 넘어갑니다
- 샘플 데이터는 `ON CONFLICT DO NOTHING`으로 중복 삽입을 방지합니다

