-- 픽업 시스템 테이블 생성 마이그레이션 (PostgreSQL)
-- 작성일: 2026-01-09

-- ==========================================
-- 1. ENUM 타입 생성
-- ==========================================

-- 픽업 상태 ENUM 타입
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pickup_status_enum') THEN
    CREATE TYPE pickup_status_enum AS ENUM (
      'REQUESTED',
      'REJECTED',
      'WAITING',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'COMPLETED',
      'CANCELED'
    );
  END IF;
END $$;

-- 취소 주체 ENUM 타입
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canceled_by_enum') THEN
    CREATE TYPE canceled_by_enum AS ENUM ('USER', 'PHARMACY', 'AUTO');
  END IF;
END $$;

-- ==========================================
-- 2. pickup_requests 테이블 생성
-- ==========================================

CREATE TABLE IF NOT EXISTS pickup_requests (
  "pickupId" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "pharmacyId" INTEGER NOT NULL,
  status pickup_status_enum NOT NULL DEFAULT 'REQUESTED',
  "totalAmount" INTEGER DEFAULT 0,
  "estimatedPickupDate" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "requestedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "preparedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "readyAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "canceledAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "autoCancelDate" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "customerMemo" TEXT DEFAULT NULL,
  "pharmacyMemo" TEXT DEFAULT NULL,
  "rejectionReason" TEXT DEFAULT NULL,
  "cancelReason" TEXT DEFAULT NULL,
  "canceledBy" canceled_by_enum DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 외래 키 제약조건
  CONSTRAINT fk_pickup_user FOREIGN KEY ("userId") REFERENCES users("userId") ON DELETE CASCADE,
  CONSTRAINT fk_pickup_pharmacy FOREIGN KEY ("pharmacyId") REFERENCES pharmacies("pharmacyId") ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pickup_userId ON pickup_requests("userId");
CREATE INDEX IF NOT EXISTS idx_pickup_pharmacyId ON pickup_requests("pharmacyId");
CREATE INDEX IF NOT EXISTS idx_pickup_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_autoCancelDate ON pickup_requests("autoCancelDate");
CREATE INDEX IF NOT EXISTS idx_pickup_requestedAt ON pickup_requests("requestedAt");

-- 테이블 코멘트
COMMENT ON TABLE pickup_requests IS '픽업 요청 테이블';
COMMENT ON COLUMN pickup_requests."pickupId" IS '픽업 요청 ID';
COMMENT ON COLUMN pickup_requests."userId" IS '픽업 요청 고객 ID';
COMMENT ON COLUMN pickup_requests."pharmacyId" IS '약국 ID';
COMMENT ON COLUMN pickup_requests.status IS '픽업 상태';
COMMENT ON COLUMN pickup_requests."totalAmount" IS '총 금액';
COMMENT ON COLUMN pickup_requests."estimatedPickupDate" IS '예상 픽업일';
COMMENT ON COLUMN pickup_requests."autoCancelDate" IS '자동 취소 예정 일시 (요청일 + 5일)';

-- ==========================================
-- 3. pickup_products 테이블 생성
-- ==========================================

CREATE TABLE IF NOT EXISTS pickup_products (
  id SERIAL PRIMARY KEY,
  "pickupId" INTEGER NOT NULL,
  "categoryId" VARCHAR(50) NOT NULL,
  "categoryName" VARCHAR(100) NOT NULL,
  "productName" VARCHAR(200) NOT NULL,
  manufacturer VARCHAR(100) DEFAULT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  "unitPrice" INTEGER DEFAULT NULL,
  "totalPrice" INTEGER DEFAULT NULL,
  "petName" VARCHAR(50) DEFAULT NULL,
  "petType" VARCHAR(20) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 외래 키 제약조건
  CONSTRAINT fk_product_pickup FOREIGN KEY ("pickupId") REFERENCES pickup_requests("pickupId") ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_pickupId ON pickup_products("pickupId");
CREATE INDEX IF NOT EXISTS idx_product_categoryId ON pickup_products("categoryId");

-- 테이블 코멘트
COMMENT ON TABLE pickup_products IS '픽업 요청 상품 테이블';
COMMENT ON COLUMN pickup_products.id IS '픽업 상품 ID';
COMMENT ON COLUMN pickup_products."pickupId" IS '픽업 요청 ID';
COMMENT ON COLUMN pickup_products."categoryId" IS '카테고리 ID (예: parasite_prevention)';
COMMENT ON COLUMN pickup_products."categoryName" IS '카테고리 이름 (예: 구충·예방 관리)';

-- ==========================================
-- 4. updatedAt 자동 업데이트 트리거
-- ==========================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- pickup_requests 테이블 트리거
DROP TRIGGER IF EXISTS trigger_pickup_requests_updated_at ON pickup_requests;
CREATE TRIGGER trigger_pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- pickup_products 테이블 트리거
DROP TRIGGER IF EXISTS trigger_pickup_products_updated_at ON pickup_products;
CREATE TRIGGER trigger_pickup_products_updated_at
  BEFORE UPDATE ON pickup_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. 데이터 확인 쿼리 (참고용)
-- ==========================================

-- 테이블 생성 확인
-- SELECT tablename FROM pg_tables WHERE tablename LIKE 'pickup_%';

-- pickup_requests 테이블 구조 확인
-- \d pickup_requests;

-- pickup_products 테이블 구조 확인
-- \d pickup_products;

-- 픽업 요청 통계 (테스트용)
-- SELECT status, COUNT(*) as count FROM pickup_requests GROUP BY status;
