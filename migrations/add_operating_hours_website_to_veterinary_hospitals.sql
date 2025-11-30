-- 동물병원 테이블 컬럼 정리 (Service 기준)
-- 실행일: 2025-11-30
-- Service에서 사용하는 컬럼만 남기고 나머지는 제거

-- 1. operating_hours 컬럼 추가 (CSV에서 가져온 운영시간 원본 데이터)
ALTER TABLE veterinary_hospitals
ADD COLUMN IF NOT EXISTS operating_hours TEXT;

COMMENT ON COLUMN veterinary_hospitals.operating_hours IS 'CSV에서 가져온 운영시간 원본 데이터';

-- 2. website 컬럼 추가 (홈페이지 URL)
ALTER TABLE veterinary_hospitals
ADD COLUMN IF NOT EXISTS website VARCHAR(500);

COMMENT ON COLUMN veterinary_hospitals.website IS '홈페이지 URL';

-- 3. Service에서 사용하지 않는 컬럼 제거
ALTER TABLE veterinary_hospitals
DROP COLUMN IF EXISTS address_detail,
DROP COLUMN IF EXISTS nearest_station,
DROP COLUMN IF EXISTS station_distance,
DROP COLUMN IF EXISTS business_hours,
DROP COLUMN IF EXISTS is_open_now,
DROP COLUMN IF EXISTS has_parking,
DROP COLUMN IF EXISTS parking_info,
DROP COLUMN IF EXISTS treats_dogs,
DROP COLUMN IF EXISTS treats_cats;

-- 완료 메시지
SELECT 'Migration completed: veterinary_hospitals table updated based on Service requirements' AS status;
