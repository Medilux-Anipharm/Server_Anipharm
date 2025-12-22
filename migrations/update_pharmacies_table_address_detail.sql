-- 동물약국 테이블 컬럼 수정 (Pharmacy 모델 기준)
-- 실행일: 2025-12-22
-- 모델 변경사항 반영: address_detail 추가, is_24h/is_emergency 제거

-- 1. address_detail 컬럼 추가 (상세 주소)
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS address_detail VARCHAR(255);

COMMENT ON COLUMN pharmacies.address_detail IS '상세 주소';

-- 2. is_24h 컬럼 제거 (모델에서 제거됨, 동적으로 계산)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pharmacies' 
        AND column_name = 'is_24h'
    ) THEN
        ALTER TABLE pharmacies DROP COLUMN is_24h;
    END IF;
END $$;

-- 3. is_emergency 컬럼 제거 (모델에서 제거됨, 동적으로 계산)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pharmacies' 
        AND column_name = 'is_emergency'
    ) THEN
        ALTER TABLE pharmacies DROP COLUMN is_emergency;
    END IF;
END $$;

-- 완료 메시지
SELECT 'Migration completed: pharmacies table updated - address_detail added, is_24h/is_emergency removed' AS status;

