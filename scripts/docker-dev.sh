#!/bin/bash

# 개발 모드로 Docker Compose 실행

echo "🚀 Anipharm 서버를 개발 모드로 시작합니다..."

docker-compose -f docker-compose.dev.yml up --build

