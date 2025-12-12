# 기술 스택 (Tech Stack)

## 📱 프로젝트 개요
**Anipharm** - 반려동물 케어 플랫폼 (동물병원, 동물약국, 펫호텔 등 검색 및 지도 서비스)

---

## 🏗️ 전체 아키텍처

```
┌─────────────────┐
│  React Native   │  ← 프론트엔드 (모바일/웹)
│   (Expo)        │
└────────┬────────┘
         │ HTTP/HTTPS
         │
┌────────▼────────┐
│  Node.js/Express│  ← 백엔드 API 서버
│     (REST API)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────────┐
│PostgreSQL│ │ Naver Map API│
│ Database │ │  (외부 API)  │
└─────────┘ └──────────┘
```

---

## 🎨 프론트엔드 (Frontend)

### 핵심 기술
- **React Native** `0.81.5`
  - 크로스 플랫폼 모바일 앱 개발 프레임워크
  - iOS, Android, Web 모두 지원

- **Expo** `~54.0.25`
  - React Native 개발 도구 및 서비스
  - 빌드, 배포, 개발 환경 관리

- **TypeScript** `~5.9.2`
  - JavaScript에 타입 시스템 추가
  - 코드 안정성 및 개발 생산성 향상

### 주요 라이브러리

#### UI/UX
- **@expo/vector-icons** `^15.0.3`
  - 아이콘 라이브러리 (Ionicons 등)

- **expo-font** `^14.0.9`
  - 커스텀 폰트 로딩

- **expo-status-bar** `~3.0.8`
  - 상태바 제어

#### 지도 및 위치
- **expo-location** `~19.0.7`
  - GPS 위치 정보 획득
  - 현재 위치 추적

- **react-native-maps** `1.20.1`
  - 지도 표시 및 마커 관리

- **react-native-webview** `^13.16.0`
  - 웹뷰 컴포넌트 (Naver Map Web API 사용)

#### 데이터 관리
- **axios** `^1.13.2`
  - HTTP 클라이언트 (API 통신)

- **@react-native-async-storage/async-storage** `^2.2.0`
  - 로컬 스토리지 (토큰, 사용자 정보 저장)

#### 날짜/시간
- **@react-native-community/datetimepicker** `^8.5.1`
  - 날짜/시간 선택 컴포넌트

#### 웹 지원
- **react-native-web** `^0.21.0`
  - React Native 컴포넌트를 웹에서 사용

- **react-dom** `19.1.0`
  - React 웹 렌더링

---

## ⚙️ 백엔드 (Backend)

### 핵심 기술
- **Node.js** `>=18.0.0`
  - JavaScript 런타임 환경

- **Express.js** `^4.18.2`
  - 웹 애플리케이션 프레임워크
  - RESTful API 서버 구축

### 주요 라이브러리

#### 인증 및 보안
- **jsonwebtoken** `^9.0.2`
  - JWT (JSON Web Token) 생성 및 검증
  - 사용자 인증

- **bcryptjs** `^2.4.3`
  - 비밀번호 해싱
  - 암호화

- **helmet** `^7.1.0`
  - HTTP 보안 헤더 설정
  - XSS, CSRF 공격 방지

- **cors** `^2.8.5`
  - Cross-Origin Resource Sharing 설정
  - 프론트엔드와의 통신 허용

#### 데이터베이스
- **Sequelize** `^6.35.0`
  - ORM (Object-Relational Mapping)
  - PostgreSQL과의 상호작용

- **pg** `^8.11.3`
  - PostgreSQL 클라이언트

- **pg-hstore** `^2.3.4`
  - PostgreSQL hstore 타입 지원

- **sequelize-cli** `^6.6.2` (dev)
  - 데이터베이스 마이그레이션 관리

#### 데이터 처리
- **csv-parser** `^3.0.0`
  - CSV 파일 파싱
  - 동물병원/약국 데이터 import

- **multer** `^1.4.5-lts.1`
  - 파일 업로드 처리

#### 지도 및 좌표
- **proj4** `^2.20.2`
  - 좌표계 변환
  - EPSG:5174 (한국 좌표계) → WGS84 변환

- **geolib** `^3.3.4`
  - 지리적 거리 계산
  - Haversine 공식 (위도/경도 기반 거리)

#### HTTP 통신
- **axios** `^1.6.2`
  - 외부 API 호출 (Naver Map API)

#### 유효성 검사
- **express-validator** `^7.0.1`
  - 요청 데이터 유효성 검사

#### 로깅 및 모니터링
- **winston** `^3.11.0`
  - 로그 관리

- **morgan** `^1.10.0`
  - HTTP 요청 로깅

#### 성능 최적화
- **compression** `^1.7.4`
  - 응답 데이터 압축 (gzip)

#### API 문서화
- **swagger-jsdoc** `^6.2.8`
  - Swagger 문서 자동 생성

- **swagger-ui-express** `^5.0.0`
  - Swagger UI 제공

#### 환경 설정
- **dotenv** `^16.3.1`
  - 환경 변수 관리 (.env 파일)

---

## 🗄️ 데이터베이스

### PostgreSQL `15-alpine`
- **버전**: 15 (Alpine Linux 기반)
- **용도**: 
  - 동물병원 정보 저장
  - 동물약국 정보 저장
  - 사용자 정보 저장
  - 펫 정보 저장
  - 커뮤니티 게시글 저장

### 주요 테이블
- `veterinary_hospitals` - 동물병원 정보
- `pharmacies` - 동물약국 정보
- `users` - 사용자 정보
- `pets` - 반려동물 정보
- `posts` - 커뮤니티 게시글

---

## 🐳 컨테이너화 (Containerization)

### Docker
- **Docker Compose** 사용
- 개발 환경과 프로덕션 환경 분리

### 서비스 구성
1. **PostgreSQL 컨테이너**
   - 포트: `5433:5432` (호스트:컨테이너)
   - 볼륨: `postgres_data_dev`

2. **Node.js 애플리케이션 컨테이너**
   - 포트: `3000:3000`
   - 볼륨 마운트: 소스 코드, 로그, 업로드 파일

---

## 🌐 외부 API

### Naver Map API
- **Geocoding API**
  - 주소 → 좌표 변환
  - 좌표 → 주소 변환

- **Local Search API**
  - 키워드 기반 장소 검색
  - 카테고리별 검색 (펫호텔, 미용 등)

---

## 🛠️ 개발 도구

### 프론트엔드
- **Expo CLI**
  - 개발 서버 실행
  - 핫 리로드

### 백엔드
- **nodemon** `^3.0.2` (dev)
  - 파일 변경 감지 및 자동 재시작

### 테스팅
- **Jest** `^29.7.0` (dev)
  - 단위 테스트 프레임워크

- **supertest** `^6.3.3` (dev)
  - API 테스트

---

## 📦 패키지 관리

- **npm** `>=9.0.0`
  - Node.js 패키지 관리자

---

## 🔐 인증 방식

- **JWT (JSON Web Token)**
  - Access Token: 7일
  - Refresh Token: 30일

---

## 📁 프로젝트 구조

```
Anipharm/
├── Client_Anipharm/          # 프론트엔드
│   ├── src/
│   │   ├── screens/          # 화면 컴포넌트
│   │   ├── services/         # API 서비스
│   │   ├── config/           # 설정 파일
│   │   ├── types/            # TypeScript 타입 정의
│   │   └── utils/            # 유틸리티 함수
│   ├── package.json
│   └── tsconfig.json
│
└── Server_Anipharm/          # 백엔드
    ├── src/
    │   ├── controllers/      # 컨트롤러 (요청 처리)
    │   ├── services/         # 비즈니스 로직
    │   ├── models/           # 데이터베이스 모델
    │   ├── routes/           # 라우트 정의
    │   ├── config/           # 설정 파일
    │   ├── utils/            # 유틸리티 함수
    │   └── app.js            # Express 앱 진입점
    ├── docker-compose.dev.yml
    ├── Dockerfile.dev
    └── package.json
```

---

## 🚀 실행 환경

### 개발 환경
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **Docker**: 최신 버전
- **Docker Compose**: 최신 버전

### 지원 플랫폼
- **iOS**: 13.0 이상
- **Android**: API 21 이상 (Android 5.0)
- **Web**: 최신 브라우저 (Chrome, Safari, Firefox, Edge)

---

## 📊 기술 스택 요약

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **프론트엔드** | React Native | 0.81.5 |
| | Expo | ~54.0.25 |
| | TypeScript | ~5.9.2 |
| **백엔드** | Node.js | >=18.0.0 |
| | Express.js | ^4.18.2 |
| **데이터베이스** | PostgreSQL | 15-alpine |
| **ORM** | Sequelize | ^6.35.0 |
| **컨테이너** | Docker | 최신 |
| | Docker Compose | 최신 |
| **인증** | JWT | jsonwebtoken ^9.0.2 |
| **지도** | Naver Map API | - |
| **좌표 변환** | proj4 | ^2.20.2 |
| **거리 계산** | geolib | ^3.3.4 |

---

## 💡 기술 선택 이유

### React Native + Expo
- **크로스 플랫폼**: 하나의 코드베이스로 iOS, Android, Web 지원
- **빠른 개발**: 핫 리로드, 쉬운 배포
- **풍부한 생태계**: 다양한 라이브러리

### Node.js + Express
- **JavaScript 통일**: 프론트엔드와 백엔드 모두 JavaScript
- **비동기 처리**: I/O 집약적 작업에 적합
- **빠른 개발**: 간단한 API 서버 구축

### PostgreSQL
- **관계형 데이터베이스**: 복잡한 데이터 관계 관리
- **성능**: 대용량 데이터 처리
- **확장성**: 다양한 데이터 타입 지원

### Sequelize
- **ORM**: SQL 대신 JavaScript 객체로 데이터 조작
- **마이그레이션**: 데이터베이스 스키마 버전 관리
- **타입 안정성**: 모델 정의로 데이터 구조 명확화

### Docker
- **환경 일관성**: 개발/프로덕션 환경 통일
- **쉬운 배포**: 컨테이너 기반 배포
- **의존성 관리**: 데이터베이스, 서버 한 번에 관리

---

## 🔄 데이터 흐름

1. **사용자 요청** → React Native 앱
2. **API 호출** → Axios로 Express 서버에 요청
3. **서버 처리** → Express 라우터 → 컨트롤러 → 서비스
4. **데이터 조회** → Sequelize ORM → PostgreSQL
5. **외부 API 호출** → Naver Map API (필요 시)
6. **응답 반환** → JSON 형식으로 프론트엔드에 전달
7. **UI 업데이트** → React Native 컴포넌트 렌더링

---

## 📚 학습 리소스

### 공식 문서
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Docker](https://docs.docker.com/)

### 유용한 링크
- [Naver Map API](https://developers.naver.com/docs/map/overview/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/)

---

**작성일**: 2025-12-02  
**버전**: 1.0


