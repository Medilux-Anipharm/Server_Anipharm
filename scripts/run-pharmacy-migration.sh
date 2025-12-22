#!/bin/bash

# 동물약국 테이블 마이그레이션 실행 스크립트 (address_detail 추가, is_24h/is_emergency 제거)

echo "=== 동물약국 테이블 마이그레이션 시작 ==="

# Docker 컨테이너가 실행 중인지 확인
if ! docker ps | grep -q anipharm-postgres-dev; then
    echo "Docker 컨테이너가 실행 중이 아닙니다. 컨테이너를 시작합니다..."
    cd "$(dirname "$0")/.."
    docker compose -f docker-compose.dev.yml up -d postgres
    echo "PostgreSQL 컨테이너 시작 대기 중..."
    sleep 5
fi

# 마이그레이션 실행
echo "마이그레이션 실행 중..."
docker exec -i anipharm-postgres-dev psql -U postgres -d anipharm_db < migrations/update_pharmacies_table_address_detail.sql

if [ $? -eq 0 ]; then
    echo "=== 마이그레이션 완료 ==="
else
    echo "=== 마이그레이션 실패 ==="
    exit 1
fi

