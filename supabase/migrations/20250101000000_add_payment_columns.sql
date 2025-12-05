-- 결제 정보 컬럼 추가
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled'));

-- 결제 상태 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

