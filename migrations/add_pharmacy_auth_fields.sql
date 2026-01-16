-- 약국 테이블에 인증 관련 필드 추가
-- 실행일: 2026-01-11

-- 계정 관련 필드 추가
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS pharmacy_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 유니크 제약 조건 추가 (IF NOT EXISTS는 PostgreSQL에서 지원되지 않으므로 DO 블록 사용)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_pharmacy_email' 
        AND conrelid = 'pharmacies'::regclass
    ) THEN
        ALTER TABLE pharmacies
        ADD CONSTRAINT unique_pharmacy_email UNIQUE (pharmacy_email);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_business_number' 
        AND conrelid = 'pharmacies'::regclass
    ) THEN
        ALTER TABLE pharmacies
        ADD CONSTRAINT unique_business_number UNIQUE (business_number);
    END IF;
END $$;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_pharmacy_email ON pharmacies(pharmacy_email);
CREATE INDEX IF NOT EXISTS idx_business_number ON pharmacies(business_number);

-- 코멘트 추가
COMMENT ON COLUMN pharmacies.pharmacy_email IS '약국 계정 이메일';
COMMENT ON COLUMN pharmacies.password_hash IS '비밀번호 해시';
COMMENT ON COLUMN pharmacies.business_number IS '사업자 등록번호';
COMMENT ON COLUMN pharmacies.is_active IS '계정 활성화 상태';
