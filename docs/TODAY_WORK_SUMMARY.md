# 오늘의 작업 요약 (2025-12-02)

## 📋 개요
오늘은 주로 프론트엔드와 백엔드 간의 연결 문제를 해결하고, 지도 기능을 개선하는 작업을 진행했습니다.

---

## 🔧 주요 작업 내용

### 1. API 연결 문제 해결

#### 문제 상황
- 웹 환경에서 `localhost:3000`으로 API 요청 시 연결 실패
- 에러 메시지: `서버에 연결할 수 없습니다. 네트워크를 확인해주세요.`

#### 원인
웹 브라우저에서 `localhost`는 브라우저가 실행되는 컴퓨터를 의미합니다. 하지만 Docker 컨테이너에서 실행 중인 서버는 실제 IP 주소로 접근해야 합니다.

#### 해결 방법
```typescript
// 수정 전
const API_BASE_URL = "http://localhost:3000/api"

// 수정 후
const API_BASE_URL = "http://192.168.0.57:3000/api"
```

**설명**: 
- `localhost`는 "이 컴퓨터"를 의미
- Docker 컨테이너는 별도의 네트워크에서 실행되므로 실제 IP 주소가 필요
- `192.168.0.57`은 현재 개발 환경의 실제 IP 주소

---

### 2. 동물병원/동물약국 데이터 조회 방식 통일

#### 문제 상황
- 동물병원과 동물약국 검색 시 일부는 Naver API를 사용하고 있었음
- 일관성 없는 데이터 소스로 인한 혼란

#### 해결 방법
동물병원과 동물약국은 **항상 데이터베이스(DB)에서 조회**하도록 통일했습니다.

**이유**:
- DB에 저장된 데이터는 더 정확하고 관리하기 쉬움
- Naver API는 외부 서비스이므로 네트워크 상태에 따라 불안정할 수 있음
- DB 데이터는 우리가 직접 관리할 수 있음

**코드 위치**: `Client_Anipharm/src/screens/Main/HomeScreen.tsx`
- `loadPlaces` 함수: 카테고리별 데이터 로딩
- `handleSearch` 함수: 검색어로 필터링

---

### 3. 전체/펫호텔/미용 카테고리 지도 기능 추가

#### 추가된 기능
1. **지도/리스트 전환 버튼**: 전체, 펫호텔, 미용 카테고리에서도 지도와 리스트를 전환할 수 있음
2. **리스트 뷰**: 검색된 장소들을 리스트로 표시
3. **지도 마커**: 각 장소의 위치를 지도에 마커로 표시
4. **정보 카드**: 마커나 리스트 항목 클릭 시 상세 정보 표시

#### 코드 구조
```typescript
// 뷰 모드 전환 버튼 표시 조건
{(selectedCategory === 'hospital' && hospitals.length > 0) || 
 (selectedCategory === 'pharmacy' && pharmacies.length > 0) ||
 ((selectedCategory === 'all' || selectedCategory === 'hotel' || 
   selectedCategory === 'grooming' || selectedCategory === 'petshop') && 
  places.length > 0) && (
  // 지도/리스트 전환 버튼 UI
)}
```

**설명**:
- `selectedCategory`: 현재 선택된 카테고리 (전체, 병원, 약국, 펫호텔 등)
- `hospitals`, `pharmacies`, `places`: 각 카테고리별 데이터 배열
- `mapViewMode`: 'map' 또는 'list' - 현재 보기 모드

---

### 4. Docker 환경 변수 설정 문제 해결

#### 문제 상황
- `.env` 파일에 환경 변수가 있음에도 불구하고 서버에서 "인증 정보가 설정되지 않았습니다" 에러 발생
- Docker 컨테이너 재시작 후에도 문제 지속

#### 원인
- `docker-compose.yml` 파일을 사용하고 있었지만, 실제로는 `docker-compose.dev.yml` 파일을 사용해야 함
- `docker-compose.dev.yml`에는 환경 변수 설정이 있었지만, 잘못된 파일을 사용하고 있었음

#### 해결 방법
```bash
# 올바른 Docker Compose 파일 사용
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

**설명**:
- `-f` 옵션: 사용할 compose 파일 지정
- `docker-compose.dev.yml`: 개발 환경용 설정 파일
- 환경 변수는 `.env` 파일에서 읽어와서 컨테이너에 전달됨

---

### 5. 데이터베이스 스키마 수정

#### 문제 상황 1: 컬럼 누락
- `operating_hours` (운영시간) 컬럼이 데이터베이스에 없음
- `website` (홈페이지) 컬럼이 데이터베이스에 없음

#### 해결 방법
```sql
-- 데이터베이스에 컬럼 추가
ALTER TABLE veterinary_hospitals 
ADD COLUMN IF NOT EXISTS operating_hours TEXT;

ALTER TABLE veterinary_hospitals 
ADD COLUMN IF NOT EXISTS website VARCHAR(500);
```

#### 문제 상황 2: 컬럼 길이 부족
- `pharmacies` 테이블의 `phone` 컬럼이 `VARCHAR(20)`으로 설정되어 있음
- 일부 전화번호가 20자를 초과하여 저장 실패

#### 해결 방법
```sql
-- 컬럼 길이 확장
ALTER TABLE pharmacies 
ALTER COLUMN phone TYPE VARCHAR(50);
```

**설명**:
- `VARCHAR(20)`: 최대 20자까지 저장 가능
- `VARCHAR(50)`: 최대 50자까지 저장 가능
- 전화번호는 지역번호, 하이픈 등을 포함하면 20자를 초과할 수 있음

---

## 📁 수정된 파일 목록

### 프론트엔드
1. `Client_Anipharm/src/config/api.config.ts`
   - API Base URL을 실제 IP 주소로 변경

2. `Client_Anipharm/src/screens/Main/HomeScreen.tsx`
   - 전체/펫호텔/미용 카테고리의 지도/리스트 기능 추가
   - `handlePlaceSelect` 함수 추가
   - 뷰 모드 전환 버튼 표시 조건 확장

### 백엔드
1. `Server_Anipharm/src/services/veterinaryHospitalService.js`
   - `operatingHours`, `website` 컬럼 조회 추가

2. `Server_Anipharm/docker-compose.dev.yml`
   - NAVER API 환경 변수 설정 확인

---

## 🎯 핵심 개념 설명

### 1. API Base URL이란?
- **API**: Application Programming Interface (애플리케이션 프로그래밍 인터페이스)
- **Base URL**: 모든 API 요청의 기본 주소
- 예: `http://192.168.0.57:3000/api`
  - `http://`: 프로토콜 (통신 규칙)
  - `192.168.0.57`: 서버 IP 주소
  - `3000`: 포트 번호 (서버의 문 번호)
  - `/api`: API 경로

### 2. Docker Compose 파일
- **Docker**: 컨테이너 기반 가상화 기술
- **Docker Compose**: 여러 컨테이너를 한 번에 관리하는 도구
- **docker-compose.dev.yml**: 개발 환경용 설정 파일
  - 데이터베이스 컨테이너 설정
  - 애플리케이션 컨테이너 설정
  - 환경 변수 설정
  - 네트워크 설정

### 3. 데이터베이스 스키마
- **스키마**: 데이터베이스의 구조 (테이블, 컬럼 등)
- **컬럼**: 테이블의 각 필드 (예: name, phone, address)
- **데이터 타입**: 컬럼에 저장할 수 있는 데이터의 종류
  - `VARCHAR(n)`: 가변 길이 문자열 (최대 n자)
  - `TEXT`: 긴 텍스트 (길이 제한 없음)
  - `INTEGER`: 정수
  - `BOOLEAN`: 참/거짓

### 4. 환경 변수 (Environment Variables)
- **환경 변수**: 애플리케이션 실행 환경에 따라 달라지는 값
- 예: API 키, 데이터베이스 비밀번호, 서버 주소 등
- `.env` 파일에 저장하여 보안 유지
- Git에 커밋하지 않도록 `.gitignore`에 추가

---

## 🐛 문제 해결 과정

### 1단계: 문제 파악
- 에러 메시지 확인
- 로그 파일 확인
- 네트워크 연결 상태 확인

### 2단계: 원인 분석
- 코드 검토
- 설정 파일 확인
- 데이터베이스 스키마 확인

### 3단계: 해결 방법 적용
- 코드 수정
- 설정 변경
- 데이터베이스 스키마 수정

### 4단계: 테스트
- 기능 동작 확인
- 에러 재현 시도
- 로그 확인

---

## 💡 배운 점

1. **네트워크 주소 이해**
   - `localhost`와 실제 IP 주소의 차이
   - Docker 컨테이너 네트워크 구조

2. **데이터 소스 통일의 중요성**
   - 일관된 데이터 소스 사용으로 혼란 방지
   - DB vs 외부 API 선택 기준

3. **환경 변수 관리**
   - 개발 환경별 설정 파일 분리
   - Docker Compose 파일 선택의 중요성

4. **데이터베이스 스키마 설계**
   - 컬럼 타입과 길이의 중요성
   - 실제 데이터를 고려한 스키마 설계

---

## 📚 참고 자료

### Docker 관련
- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 가이드](https://docs.docker.com/compose/)

### 데이터베이스 관련
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [SQL ALTER TABLE 문법](https://www.postgresql.org/docs/current/sql-altertable.html)

### React Native 관련
- [React Native 공식 문서](https://reactnative.dev/)
- [Expo 공식 문서](https://docs.expo.dev/)

---

## ✅ 체크리스트

오늘 작업 완료 사항:
- [x] API Base URL 수정
- [x] 동물병원/동물약국 DB 조회 통일
- [x] 전체/펫호텔/미용 카테고리 지도 기능 추가
- [x] Docker 환경 변수 설정 문제 해결
- [x] 데이터베이스 스키마 수정
- [x] 문서 작성

---

## 🔄 다음 작업 예정

1. 성능 최적화
   - 대량 데이터 조회 시 페이지네이션 적용
   - 지도 마커 클러스터링

2. 기능 개선
   - 검색 필터 추가
   - 즐겨찾기 기능

3. 사용자 경험 개선
   - 로딩 상태 표시 개선
   - 에러 메시지 개선

---

**작성일**: 2025-12-02  
**작성자**: 개발팀  
**버전**: 1.0



