-- 반려동물 약제품 테이블 생성
-- 실행일: 2025-12-23
-- 약제품 정보 및 RAG 검색을 위한 테이블

-- 1. pet_medications 테이블 생성
CREATE TABLE IF NOT EXISTS pet_medications (
    medication_id BIGSERIAL PRIMARY KEY,
    original_id VARCHAR(200) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    brand_name VARCHAR(200),
    company VARCHAR(200),
    approval_date DATE,
    approval_status VARCHAR(200),
    product_type VARCHAR(200),
    manufacturing_type VARCHAR(200),
    indication TEXT,
    dosage TEXT,
    side_effects TEXT,
    precautions TEXT,
    storage TEXT,
    full_text TEXT,
    keywords TEXT,
    search_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 테이블 코멘트
COMMENT ON TABLE pet_medications IS '반려동물 약제품 정보';
COMMENT ON COLUMN pet_medications.medication_id IS '약제품 ID (PK)';
COMMENT ON COLUMN pet_medications.original_id IS 'CSV/JSON 파일의 원본 ID';
COMMENT ON COLUMN pet_medications.product_name IS '제품명';
COMMENT ON COLUMN pet_medications.brand_name IS '브랜드명';
COMMENT ON COLUMN pet_medications.company IS '제조사';
COMMENT ON COLUMN pet_medications.approval_date IS '허가일';
COMMENT ON COLUMN pet_medications.approval_status IS '허가 상태';
COMMENT ON COLUMN pet_medications.product_type IS '품목정보 (동물용의약품/의약외품)';
COMMENT ON COLUMN pet_medications.manufacturing_type IS '제조 타입';
COMMENT ON COLUMN pet_medications.indication IS '효능효과';
COMMENT ON COLUMN pet_medications.dosage IS '용법용량';
COMMENT ON COLUMN pet_medications.side_effects IS '부작용';
COMMENT ON COLUMN pet_medications.precautions IS '주의사항';
COMMENT ON COLUMN pet_medications.storage IS '보관방법';
COMMENT ON COLUMN pet_medications.full_text IS '원본 데이터 전체 텍스트';
COMMENT ON COLUMN pet_medications.keywords IS '검색 키워드';
COMMENT ON COLUMN pet_medications.search_text IS '검색용 텍스트 (제품명 + 효능효과 + 키워드)';

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pet_medications_product_name ON pet_medications(product_name);
CREATE INDEX IF NOT EXISTS idx_pet_medications_company ON pet_medications(company);
CREATE INDEX IF NOT EXISTS idx_pet_medications_product_type ON pet_medications(product_type);
CREATE INDEX IF NOT EXISTS idx_pet_medications_approval_status ON pet_medications(approval_status);
CREATE INDEX IF NOT EXISTS idx_pet_medications_search_text ON pet_medications(search_text);

-- 4. 검색 성능 향상을 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_pet_medications_status_type ON pet_medications(approval_status, product_type);

-- 완료 메시지
SELECT 'Migration completed: pet_medications table created' AS status;

