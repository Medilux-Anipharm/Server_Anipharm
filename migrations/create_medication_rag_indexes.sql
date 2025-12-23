-- 약제품 RAG 검색 최적화 인덱스 생성
-- 실행일: 2025-12-23
-- RAG (Retrieval Augmented Generation) 검색 성능 향상을 위한 인덱스

-- 1. pg_trgm 확장 설치 (full-text search를 위한 확장)
-- 주의: 이 확장은 PostgreSQL superuser 권한이 필요합니다
-- Docker 환경에서는 컨테이너 초기화 시 설치하거나 수동으로 설치해야 합니다
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
    END IF;
END $$;

-- 2. search_text 필드에 대한 GIN 인덱스 생성 (pg_trgm 확장 필요)
-- 주의: pg_trgm 확장이 설치되지 않은 경우 이 인덱스 생성은 실패합니다
-- 실패 시 일반 인덱스로 대체하거나 확장을 먼저 설치해야 합니다
DO $$
BEGIN
    -- 기존 인덱스가 있는지 확인
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'pet_medications' 
        AND indexname = 'idx_pet_medications_search_text_gin'
    ) THEN
        -- pg_trgm 확장이 있는 경우에만 GIN 인덱스 생성 시도
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
            CREATE INDEX idx_pet_medications_search_text_gin 
            ON pet_medications 
            USING gin(search_text gin_trgm_ops);
            
            RAISE NOTICE 'GIN 인덱스 생성 완료 (pg_trgm 사용)';
        ELSE
            RAISE NOTICE 'pg_trgm 확장이 없어 GIN 인덱스를 생성하지 않습니다. 일반 인덱스를 사용합니다.';
        END IF;
    END IF;
END $$;

-- 3. 제품명과 검색 텍스트 복합 인덱스 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_pet_medications_name_search 
ON pet_medications(product_name, search_text);

-- 4. 효능효과 검색을 위한 부분 인덱스 (indication이 있는 경우만)
CREATE INDEX IF NOT EXISTS idx_pet_medications_indication 
ON pet_medications(indication) 
WHERE indication IS NOT NULL;

-- 5. 정상 허가된 약제품만 검색하는 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_pet_medications_approved 
ON pet_medications(product_name, search_text, approval_status) 
WHERE approval_status = '정상';

-- 완료 메시지
SELECT 'Migration completed: medication RAG indexes created' AS status;

