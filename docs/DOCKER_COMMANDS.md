# Docker Compose Dev 환경 명령어 모음

## 기본 명령어

### 1. 컨테이너 시작 (백그라운드)
```bash
cd /Users/hyeonjiyun/src/Anipharm/Server_Anipharm
docker compose -f docker-compose.dev.yml up -d
```

### 2. 컨테이너 시작 (로그 확인)
```bash
docker compose -f docker-compose.dev.yml up
```

### 3. 컨테이너 중지
```bash
docker compose -f docker-compose.dev.yml down
```

### 4. 컨테이너 중지 및 볼륨 삭제
```bash
docker compose -f docker-compose.dev.yml down -v
```

### 5. 컨테이너 재시작
```bash
docker compose -f docker-compose.dev.yml restart
```

## 특정 서비스만 제어

### PostgreSQL만 시작
```bash
docker compose -f docker-compose.dev.yml up -d postgres
```

### 애플리케이션만 시작
```bash
docker compose -f docker-compose.dev.yml up -d app
```

### 특정 서비스 재시작
```bash
docker compose -f docker-compose.dev.yml restart app
docker compose -f docker-compose.dev.yml restart postgres
```

## 로그 확인

### 모든 서비스 로그
```bash
docker compose -f docker-compose.dev.yml logs
```

### 특정 서비스 로그
```bash
docker compose -f docker-compose.dev.yml logs app
docker compose -f docker-compose.dev.yml logs postgres
```

### 실시간 로그 확인 (tail)
```bash
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml logs -f postgres
```

### 최근 N줄만 보기
```bash
docker compose -f docker-compose.dev.yml logs --tail 50 app
```

## 상태 확인

### 실행 중인 컨테이너 확인
```bash
docker compose -f docker-compose.dev.yml ps
```

### 컨테이너 상태 상세 확인
```bash
docker compose -f docker-compose.dev.yml ps -a
```

## 컨테이너 내부 접속

### PostgreSQL 컨테이너 접속
```bash
docker exec -it anipharm-postgres-dev psql -U postgres -d anipharm_db
```

### 애플리케이션 컨테이너 접속
```bash
docker exec -it anipharm-server-dev sh
```

## 데이터베이스 작업

### 마이그레이션 실행
```bash
docker exec -i anipharm-postgres-dev psql -U postgres -d anipharm_db < migrations/add_operating_hours_website_to_pharmacies.sql
```

### SQL 쿼리 실행
```bash
docker exec -i anipharm-postgres-dev psql -U postgres -d anipharm_db -c "SELECT COUNT(*) FROM pharmacies;"
```

### 데이터베이스 백업
```bash
docker exec anipharm-postgres-dev pg_dump -U postgres anipharm_db > backup.sql
```

### 데이터베이스 복원
```bash
docker exec -i anipharm-postgres-dev psql -U postgres -d anipharm_db < backup.sql
```

## 빌드 및 재빌드

### 이미지 재빌드 (캐시 없이)
```bash
docker compose -f docker-compose.dev.yml build --no-cache
```

### 이미지 재빌드 후 시작
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

## 네트워크 확인

### 네트워크 목록
```bash
docker network ls | grep anipharm
```

### 네트워크 상세 정보
```bash
docker network inspect server_anipharm_anipharm-network-dev
```

## 볼륨 확인

### 볼륨 목록
```bash
docker volume ls | grep anipharm
```

### 볼륨 상세 정보
```bash
docker volume inspect server_anipharm_postgres_data_dev
```

## 유용한 조합 명령어

### 전체 재시작 (중지 → 시작)
```bash
docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up -d
```

### 로그 확인하면서 시작
```bash
docker compose -f docker-compose.dev.yml up
```

### 컨테이너 재시작 후 로그 확인
```bash
docker compose -f docker-compose.dev.yml restart app && docker compose -f docker-compose.dev.yml logs -f app
```

## 문제 해결

### 컨테이너 강제 제거
```bash
docker compose -f docker-compose.dev.yml down --remove-orphans
```

### 모든 컨테이너 중지 및 제거
```bash
docker compose -f docker-compose.dev.yml down -v --remove-orphans
```

### 컨테이너 로그 초기화
```bash
docker compose -f docker-compose.dev.yml logs --no-log-prefix app > /dev/null
```

## 환경 변수 확인

### 컨테이너 환경 변수 확인
```bash
docker exec anipharm-server-dev env | grep DB_
docker exec anipharm-server-dev env | grep NAVER_
```

## 컨테이너 정보

### 컨테이너 이름
- PostgreSQL: `anipharm-postgres-dev`
- 애플리케이션: `anipharm-server-dev`

### 네트워크 이름
- `server_anipharm_anipharm-network-dev`

### 볼륨 이름
- `server_anipharm_postgres_data_dev`

## 포트 정보

- PostgreSQL: `localhost:5433` (컨테이너 내부: 5432)
- 애플리케이션: `localhost:3000` (컨테이너 내부: 3000)

## 빠른 참조

```bash
# 시작
docker compose -f docker-compose.dev.yml up -d

# 중지
docker compose -f docker-compose.dev.yml down

# 로그
docker compose -f docker-compose.dev.yml logs -f app

# 재시작
docker compose -f docker-compose.dev.yml restart

# 상태 확인
docker compose -f docker-compose.dev.yml ps
```

