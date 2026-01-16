-- 기존 약국 데이터에 계정 정보 추가
-- 비밀번호: Password123! (해시: $2a$10$Rx0U6ABcPjAUwqymj7mxH.x0ZLEgSIRdAUnw7Ep8GWdfVK2n1lC3a)

-- CTE를 사용하여 업데이트
WITH numbered_pharmacies AS (
    SELECT
        pharmacy_id,
        ROW_NUMBER() OVER (ORDER BY pharmacy_id) - 1 AS row_idx
    FROM pharmacies
    WHERE pharmacy_email IS NULL
)
UPDATE pharmacies p
SET
    pharmacy_email = 'pharmacy' || p.pharmacy_id || '@anipharm.com',
    password_hash = '$2a$10$Rx0U6ABcPjAUwqymj7mxH.x0ZLEgSIRdAUnw7Ep8GWdfVK2n1lC3a',
    business_number =
        LPAD((100 + np.row_idx)::text, 3, '0') || '-' ||
        LPAD((10 + (np.row_idx % 90))::text, 2, '0') || '-' ||
        LPAD((10000 + np.row_idx)::text, 5, '0'),
    is_active = true
FROM numbered_pharmacies np
WHERE p.pharmacy_id = np.pharmacy_id;

-- 결과 확인
SELECT
    COUNT(*) as total_pharmacies,
    COUNT(pharmacy_email) as with_email,
    COUNT(password_hash) as with_password,
    COUNT(business_number) as with_business_number
FROM pharmacies;

-- 샘플 데이터 확인 (처음 10개)
SELECT
    pharmacy_id,
    name,
    pharmacy_email,
    business_number,
    LEFT(password_hash, 20) || '...' as password_hash_preview,
    is_active
FROM pharmacies
ORDER BY pharmacy_id
LIMIT 10;

-- 마지막 10개 확인
SELECT
    pharmacy_id,
    name,
    pharmacy_email,
    business_number,
    is_active
FROM pharmacies
ORDER BY pharmacy_id DESC
LIMIT 10;
