# Anipharm Server

펫케어 앱 백엔드 서버 (Node.js + Express + PostgreSQL + Sequelize)

## 프로젝트 구조

```
Server_Anipharm/
├── config/                 # Sequelize 설정
│   └── database.js
├── src/
│   ├── app.js             # Express 앱 진입점
│   ├── config/            # 애플리케이션 설정
│   │   └── database.js     # Sequelize 인스턴스
│   ├── models/            # Sequelize 모델
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Pet.js
│   │   └── ...
│   ├── routes/            # API 라우트
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── pets.js
│   │   └── ...
│   ├── controllers/       # 컨트롤러 (구현 예정)
│   ├── services/          # 비즈니스 로직 (구현 예정)
│   ├── middleware/        # 미들웨어 (구현 예정)
│   ├── utils/             # 유틸리티
│   │   └── logger.js
│   ├── migrations/        # 데이터베이스 마이그레이션
│   └── seeders/           # 시드 데이터
├── logs/                  # 로그 파일
├── uploads/               # 업로드 파일
├── .env.example           # 환경 변수 예제
├── .gitignore
├── .sequelizerc           # Sequelize CLI 설정
├── database.erd           # ERD 파일 (DBML 형식)
├── package.json
└── README.md
```

## 기술 스택

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Logging**: Winston

## 설치 및 실행

### 방법 1: Docker 사용 (권장)

Docker를 사용하면 PostgreSQL과 Node.js 애플리케이션을 함께 실행할 수 있습니다.

#### 개발 모드

```bash
docker-compose -f docker-compose.dev.yml up --build
```

또는 스크립트 사용:
```bash
./scripts/docker-dev.sh
```

#### 프로덕션 모드

```bash
docker-compose up --build
```

또는 스크립트 사용:
```bash
./scripts/docker-prod.sh
```

자세한 내용은 [Docker 실행 가이드](docs/DOCKER.md)를 참고하세요.

### 방법 2: 로컬 환경에서 실행

#### 1. 의존성 설치

```bash
npm install
```

#### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 값들을 설정하세요.

```bash
cp .env.example .env
```

#### 3. 데이터베이스 생성

PostgreSQL에서 데이터베이스를 생성합니다:

```sql
CREATE DATABASE anipharm_db;
```

#### 4. 마이그레이션 실행

```bash
npm run migrate
```

#### 5. 서버 실행

개발 모드:
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

## 데이터베이스 스키마

ERD 파일은 `database.erd`에 DBML 형식으로 저장되어 있습니다. 
[DBdiagram.io](https://dbdiagram.io)에서 열어서 시각화할 수 있습니다.

주요 테이블:
- **사용자 및 인증**: users, social_logins, login_sessions, login_attempts, account_locks
- **반려동물**: pets, pet_health_concerns
- **지도 및 시설**: pharmacies, veterinary_hospitals, facility_reviews, facility_photos
- **AI 챗봇**: chatbot_conversations, chatbot_messages, health_check_forms, conversation_summaries
- **헬스 다이어리**: health_records, health_reports, health_scores, reminders, reminder_completions
- **커뮤니티**: community_posts, post_comments, post_likes, post_scraps, post_reports
- **메시지**: message_threads, messages, message_attachments, blocked_users
- **알림**: notifications, notification_settings, device_tokens
- **기타**: user_inquiries, search_logs

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/social/kakao` - 카카오 로그인
- `POST /api/auth/social/naver` - 네이버 로그인
- `POST /api/auth/social/google` - 구글 로그인

### 사용자
- `GET /api/users/profile` - 프로필 조회
- `PUT /api/users/profile` - 프로필 수정

### 반려동물
- `GET /api/pets` - 반려동물 목록
- `POST /api/pets` - 반려동물 등록
- `GET /api/pets/:petId` - 반려동물 상세
- `PUT /api/pets/:petId` - 반려동물 수정
- `DELETE /api/pets/:petId` - 반려동물 삭제

### 약국/병원
- `GET /api/pharmacies` - 약국 목록 (위치 기반)
- `GET /api/pharmacies/:pharmacyId` - 약국 상세
- `GET /api/hospitals` - 병원 목록 (위치 기반)
- `GET /api/hospitals/:hospitalId` - 병원 상세

### AI 챗봇
- `POST /api/chatbot/conversations` - 대화 시작
- `POST /api/chatbot/conversations/:conversationId/messages` - 메시지 전송

### 헬스 다이어리
- `GET /api/health/records` - 건강 기록 조회
- `POST /api/health/records` - 건강 기록 등록
- `GET /api/health/reports` - 건강 레포트 조회

### 커뮤니티
- `GET /api/community/posts` - 게시글 목록
- `POST /api/community/posts` - 게시글 작성
- `GET /api/community/posts/:postId` - 게시글 상세

### 메시지
- `GET /api/messages/threads` - 대화 목록
- `POST /api/messages/threads/:threadId/messages` - 메시지 전송

### 알림
- `GET /api/notifications` - 알림 목록
- `PUT /api/notifications/:notificationId/read` - 읽음 처리

## 개발 가이드

### 모델 추가

1. `src/models/` 디렉토리에 새 모델 파일 생성
2. `src/models/index.js`에서 자동으로 로드됨
3. 관계(associations)는 각 모델의 `associate` 메서드에서 정의

### 마이그레이션 생성

```bash
npx sequelize-cli migration:generate --name migration-name
```

### 시드 데이터 생성

```bash
npx sequelize-cli seed:generate --name seed-name
```

## 라이선스

ISC

