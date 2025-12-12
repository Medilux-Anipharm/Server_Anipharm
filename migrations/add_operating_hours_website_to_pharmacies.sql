-- 동물약국 테이블 컬럼 추가 (Service 기준)
-- 실행일: 2025-12-02
-- 동물병원 서비스와 동일한 컬럼 구조로 통일

-- 1. operating_hours 컬럼 추가 (CSV에서 가져온 운영시간 원본 데이터)
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS operating_hours TEXT;

COMMENT ON COLUMN pharmacies.operating_hours IS 'CSV에서 가져온 운영시간 원본 데이터';

-- 2. website 컬럼 추가 (홈페이지 URL)
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS website VARCHAR(500);

COMMENT ON COLUMN pharmacies.website IS '홈페이지 URL';

-- 3. is_24h 컬럼 추가 (24시간 운영 여부)
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS is_24h BOOLEAN DEFAULT false;

COMMENT ON COLUMN pharmacies.is_24h IS '24시간 운영 여부';

-- 4. is_emergency 컬럼 추가 (응급 약국 여부)
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT false;

COMMENT ON COLUMN pharmacies.is_emergency IS '응급 약국 여부';

-- 완료 메시지
SELECT 'Migration completed: pharmacies table updated to match veterinary_hospitals structure' AS status;

