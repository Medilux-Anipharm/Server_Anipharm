# 데이터베이스 모델 문서

이 문서는 Anipharm 서버의 데이터베이스 모델에 대한 상세 정보를 제공합니다.

## 목차
- [필요한 모델 (현재 사용 중)](#필요한-모델-현재-사용-중)
- [삭제된 모델](#삭제된-모델)

---

## 필요한 모델 (현재 사용 중)

### 1. User (사용자)
**테이블명**: `users`  
**용도**: 앱 사용자 정보를 저장하는 핵심 모델

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `user_id` | BIGINT | PK, AUTO_INCREMENT | 사용자 고유 ID |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 주소 (로그인용) |
| `password_hash` | VARCHAR(255) | NULL | 비밀번호 해시 (bcrypt) |
| `nickname` | VARCHAR(20) | NOT NULL, UNIQUE | 닉네임 (2-20자) |
| `profile_image_url` | VARCHAR(500) | NULL | 프로필 이미지 URL |
| `profile_shape` | VARCHAR(10) | DEFAULT 'circle' | 프로필 이미지 모양 ('circle', 'square') |
| `bio` | VARCHAR(200) | NULL | 자기소개 (최대 200자) |
| `location_city` | VARCHAR(100) | NULL | 거주 도시 |
| `location_district` | VARCHAR(100) | NULL | 거주 구/군 |
| `latitude` | DECIMAL(10, 8) | NULL | 위도 |
| `longitude` | DECIMAL(11, 8) | NULL | 경도 |
| `is_email_verified` | BOOLEAN | DEFAULT false | 이메일 인증 여부 |
| `is_active` | BOOLEAN | DEFAULT true | 계정 활성화 여부 |
| `last_login_at` | DATE | NULL | 마지막 로그인 시간 |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시간 |

#### 관계
- `hasMany` Pet (반려동물)
- `hasMany` FacilityReview (시설 리뷰)
- `hasMany` HealthRecord (건강 기록)

#### 사용 위치
- `src/services/authService.js` - 회원가입, 로그인, 이메일/닉네임 중복 체크
- `src/middleware/auth.js` - JWT 인증 미들웨어
- `src/middleware/validation.js` - 유효성 검증

#### 필요 이유
- 앱의 모든 기능이 사용자 인증을 기반으로 동작
- 반려동물, 건강 기록 등 모든 데이터가 사용자와 연결됨
- 인증 및 권한 관리의 핵심

---

### 2. Pet (반려동물)
**테이블명**: `pets`  
**용도**: 사용자가 등록한 반려동물 정보 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `pet_id` | BIGINT | PK, AUTO_INCREMENT | 반려동물 고유 ID |
| `user_id` | BIGINT | NOT NULL, FK → users | 소유자 사용자 ID |
| `name` | VARCHAR(10) | NOT NULL | 반려동물 이름 |
| `species` | VARCHAR(10) | NOT NULL | 종류 ('강아지', '고양이') |
| `breed` | VARCHAR(50) | NULL | 품종 |
| `gender` | VARCHAR(20) | NULL | 성별 ('male', 'female', 'neutered_male', 'neutered_female') |
| `birth_date` | DATEONLY | NOT NULL | 생년월일 |
| `weight` | DECIMAL(5, 2) | NULL | 체중 (kg) |
| `profile_image_url` | VARCHAR(500) | NULL | 프로필 이미지 URL |
| `is_primary` | BOOLEAN | DEFAULT false | 대표 반려동물 여부 |
| `display_order` | INTEGER | DEFAULT 0 | 표시 순서 |
| `is_deleted` | BOOLEAN | DEFAULT false | 삭제 여부 (soft delete) |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시간 |

#### 관계
- `belongsTo` User (소유자)
- `hasMany` PetHealthConcern (건강 고민)
- `hasMany` HealthRecord (건강 기록)
- `hasMany` FacilityReview (시설 리뷰)

#### 사용 위치
- `src/services/petService.js` - 반려동물 CRUD 작업

#### 필요 이유
- 앱의 핵심 기능인 반려동물 건강 관리의 주체
- 건강 기록, 리뷰 등 모든 데이터가 반려동물과 연결됨
- 사용자가 여러 반려동물을 관리할 수 있도록 지원

---

### 3. PetHealthConcern (반려동물 건강 고민)
**테이블명**: `pet_health_concerns`  
**용도**: 반려동물의 건강 고민 항목 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `concern_id` | BIGINT | PK, AUTO_INCREMENT | 건강 고민 고유 ID |
| `pet_id` | BIGINT | NOT NULL, FK → pets | 반려동물 ID |
| `concern_type` | VARCHAR(50) | NOT NULL | 건강 고민 유형 |
| `created_at` | DATE | DEFAULT NOW | 생성 시간 |

#### 관계
- `belongsTo` Pet (반려동물)

#### 사용 위치
- `src/services/petService.js` - 반려동물 생성/수정 시 건강 고민 저장

#### 필요 이유
- 반려동물별 건강 고민을 관리하여 맞춤형 건강 관리 제공
- 건강 기록과 연계하여 추적 가능

---

### 4. HealthRecord (건강 기록)
**테이블명**: `health_records`  
**용도**: 반려동물의 일일 건강 상태 기록 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `record_id` | BIGINT | PK, AUTO_INCREMENT | 건강 기록 고유 ID |
| `pet_id` | BIGINT | NOT NULL, FK → pets | 반려동물 ID |
| `user_id` | BIGINT | NOT NULL, FK → users | 사용자 ID |
| `record_date` | DATEONLY | NOT NULL | 기록 날짜 |
| `record_type` | VARCHAR(20) | NOT NULL | 기록 유형 ('meal', 'water', 'urine', 'feces', 'activity', 'weight', 'symptom') |
| `meal_amount` | DECIMAL(8, 2) | NULL | 식사량 |
| `water_amount` | DECIMAL(8, 2) | NULL | 물 섭취량 |
| `urine_color` | VARCHAR(20) | NULL | 소변 색상 |
| `feces_consistency` | VARCHAR(20) | NULL | 배변 일관성 |
| `feces_color` | VARCHAR(20) | NULL | 배변 색상 |
| `feces_photo_url` | VARCHAR(500) | NULL | 배변 사진 URL |
| `activity_minutes` | INTEGER | NULL | 활동 시간 (분) |
| `weight_kg` | DECIMAL(5, 2) | NULL | 체중 (kg) |
| `symptoms` | JSONB | NULL | 증상 정보 (JSON 배열) |
| `symptom_photo_urls` | JSONB | NULL | 증상 사진 URL 배열 |
| `memo` | TEXT | NULL | 메모 (최대 1000자) |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시간 |

#### 관계
- `belongsTo` Pet (반려동물)
- `belongsTo` User (사용자)

#### 사용 위치
- `src/services/HealthRecord.js` - 건강 기록 CRUD 작업

#### 필요 이유
- 반려동물의 일일 건강 상태를 체계적으로 기록
- 시간에 따른 건강 변화 추적 가능
- 병원 방문 시 건강 이력 제공

---

### 5. Pharmacy (동물약국)
**테이블명**: `pharmacies`  
**용도**: 동물약국 정보 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `pharmacy_id` | BIGINT | PK, AUTO_INCREMENT | 약국 고유 ID |
| `name` | VARCHAR(100) | NOT NULL | 약국명 |
| `phone` | VARCHAR(50) | NULL | 전화번호 |
| `address` | VARCHAR(255) | NOT NULL | 주소 |
| `address_detail` | VARCHAR(255) | NULL | 상세 주소 |
| `operating_hours` | TEXT | NULL | 운영시간 (CSV 원본 데이터) |
| `website` | VARCHAR(500) | NULL | 홈페이지 URL |
| `latitude` | DECIMAL(10, 8) | NOT NULL | 위도 |
| `longitude` | DECIMAL(11, 8) | NOT NULL | 경도 |
| `is_late_night` | BOOLEAN | DEFAULT false | 심야 운영 여부 |
| `is_24h` | BOOLEAN | DEFAULT false | 24시간 운영 여부 |
| `is_emergency` | BOOLEAN | DEFAULT false | 응급 약국 여부 |
| `rating_average` | DECIMAL(3, 2) | DEFAULT 0.00 | 평균 평점 (0.00-5.00) |
| `review_count` | INTEGER | DEFAULT 0 | 리뷰 개수 |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시간 |

#### 관계
- `hasMany` FacilityPhoto (시설 사진, facility_type='pharmacy')
- `hasMany` FacilityReview (시설 리뷰, facility_type='pharmacy')

#### 사용 위치
- `src/services/veterinaryPharmacyService.js` - 약국 검색, 위치 기반 조회, CSV import

#### 필요 이유
- 사용자가 주변 동물약국을 찾을 수 있도록 지원
- 위치 기반 검색 기능의 핵심 데이터
- 리뷰 및 평점 시스템의 대상

---

### 6. VeterinaryHospital (동물병원)
**테이블명**: `veterinary_hospitals`  
**용도**: 동물병원 정보 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `hospital_id` | BIGINT | PK, AUTO_INCREMENT | 병원 고유 ID |
| `name` | VARCHAR(100) | NOT NULL | 병원명 |
| `phone` | VARCHAR(20) | NULL | 전화번호 |
| `address` | VARCHAR(255) | NOT NULL | 주소 |
| `operating_hours` | TEXT | NULL | 운영시간 (CSV 원본 데이터) |
| `website` | VARCHAR(500) | NULL | 홈페이지 URL |
| `latitude` | DECIMAL(10, 8) | NOT NULL | 위도 |
| `longitude` | DECIMAL(11, 8) | NOT NULL | 경도 |
| `is_24h` | BOOLEAN | DEFAULT false | 24시간 운영 여부 |
| `is_emergency` | BOOLEAN | DEFAULT false | 응급 병원 여부 |
| `rating_average` | DECIMAL(3, 2) | DEFAULT 0.00 | 평균 평점 (0.00-5.00) |
| `review_count` | INTEGER | DEFAULT 0 | 리뷰 개수 |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시간 |

#### 관계
- `hasMany` FacilityPhoto (시설 사진, facility_type='hospital')
- `hasMany` FacilityReview (시설 리뷰, facility_type='hospital')

#### 사용 위치
- `src/services/veterinaryHospitalService.js` - 병원 검색, 위치 기반 조회, CSV import

#### 필요 이유
- 사용자가 주변 동물병원을 찾을 수 있도록 지원
- 위치 기반 검색 기능의 핵심 데이터
- 리뷰 및 평점 시스템의 대상

---

### 7. FacilityPhoto (시설 사진)
**테이블명**: `facility_photos`  
**용도**: 동물병원/약국의 사진 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `photo_id` | BIGINT | PK, AUTO_INCREMENT | 사진 고유 ID |
| `facility_type` | VARCHAR(20) | NOT NULL | 시설 유형 ('pharmacy', 'hospital') |
| `facility_id` | BIGINT | NOT NULL | 시설 ID (약국/병원 ID) |
| `user_id` | BIGINT | NULL, FK → users | 업로드한 사용자 ID |
| `image_url` | VARCHAR(500) | NOT NULL | 이미지 URL |
| `image_order` | INTEGER | DEFAULT 0 | 이미지 순서 |
| `is_reported` | BOOLEAN | DEFAULT false | 신고 여부 |
| `created_at` | DATE | DEFAULT NOW | 생성 시간 |

#### 관계
- `belongsTo` User (업로더)

#### 사용 위치
- `src/services/veterinaryPharmacyService.js` - 약국 상세 정보 조회 시 포함
- `src/services/veterinaryHospitalService.js` - 병원 상세 정보 조회 시 포함

#### 필요 이유
- 시설 정보의 시각적 확인을 위한 사진 제공
- 사용자가 시설을 선택할 때 참고 자료로 활용

---

### 8. FacilityReview (시설 리뷰)
**테이블명**: `facility_reviews`  
**용도**: 동물병원/약국에 대한 사용자 리뷰 저장

#### 필드 정의
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `review_id` | BIGINT | PK, AUTO_INCREMENT | 리뷰 고유 ID |
| `facility_type` | VARCHAR(20) | NOT NULL | 시설 유형 ('pharmacy', 'hospital') |
| `facility_id` | BIGINT | NOT NULL | 시설 ID (약국/병원 ID) |
| `user_id` | BIGINT | NOT NULL, FK → users | 작성자 사용자 ID |
| `pet_id` | BIGINT | NULL, FK → pets | 관련 반려동물 ID |
| `rating` | INTEGER | NOT NULL | 평점 (1-5) |
| `content` | TEXT | NULL | 리뷰 내용 (최대 2000자) |
| `keywords` | JSONB | NULL | 키워드 배열 (JSON) |
| `photo_urls` | JSONB | NULL | 리뷰 사진 URL 배열 |
| `helpful_count` | INTEGER | DEFAULT 0 | 도움됨 개수 |
| `is_reported` | BOOLEAN | DEFAULT false | 신고 여부 |
| `is_hidden` | BOOLEAN | DEFAULT false | 숨김 여부 |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시간 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시간 |

#### 관계
- `belongsTo` User (작성자)
- `belongsTo` Pet (관련 반려동물)

#### 사용 위치
- `src/services/veterinaryPharmacyService.js` - 약국 상세 정보 조회 시 포함
- `src/services/veterinaryHospitalService.js` - 병원 상세 정보 조회 시 포함

#### 필요 이유
- 사용자들이 시설에 대한 경험을 공유
- 다른 사용자들이 시설을 선택할 때 참고 자료로 활용
- 평점 시스템을 통한 시설 품질 평가

---

## 삭제된 모델

### 1. ChatbotConversation (챗봇 대화)
**삭제 이유**: 챗봇 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `conversation_id` | BIGINT | 대화 고유 ID |
| `user_id` | BIGINT | 사용자 ID |
| `pet_id` | BIGINT | 반려동물 ID |
| `conversation_type` | VARCHAR(20) | 대화 유형 ('health_check', 'care_management') |
| `status` | VARCHAR(20) | 상태 |
| `triage_message` | TEXT | 트리지 메시지 |

**재구현 시기**: 챗봇 기능 구현 시

---

### 2. ChatbotMessage (챗봇 메시지)
**삭제 이유**: 챗봇 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 챗봇 기능 구현 시

---

### 3. ConversationSummary (대화 요약)
**삭제 이유**: 챗봇 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 챗봇 기능 구현 시

---

### 4. CommunityPost (커뮤니티 게시글)
**삭제 이유**: 커뮤니티 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 커뮤니티 기능 구현 시

---

### 5. PostComment (게시글 댓글)
**삭제 이유**: 커뮤니티 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 커뮤니티 기능 구현 시

---

### 6. PostLike (게시글 좋아요)
**삭제 이유**: 커뮤니티 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 커뮤니티 기능 구현 시

---

### 7. PostReport (게시글 신고)
**삭제 이유**: 커뮤니티 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 커뮤니티 기능 구현 시

---

### 8. PostScrap (게시글 스크랩)
**삭제 이유**: 커뮤니티 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 커뮤니티 기능 구현 시

---

### 9. Message (메시지)
**삭제 이유**: 메시지 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 메시지 기능 구현 시

---

### 10. MessageAttachment (메시지 첨부파일)
**삭제 이유**: 메시지 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 메시지 기능 구현 시

---

### 11. MessageThread (메시지 스레드)
**삭제 이유**: 메시지 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 메시지 기능 구현 시

---

### 12. Notification (알림)
**삭제 이유**: 알림 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 푸시 알림 기능 구현 시

---

### 13. NotificationSetting (알림 설정)
**삭제 이유**: 알림 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 푸시 알림 기능 구현 시

---

### 14. UserInquiry (사용자 문의)
**삭제 이유**: 고객 지원 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 고객 지원 기능 구현 시

---

### 15. DeviceToken (디바이스 토큰)
**삭제 이유**: 푸시 알림 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 푸시 알림 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `token_id` | BIGINT | 토큰 고유 ID |
| `user_id` | BIGINT | 사용자 ID |
| `device_token` | VARCHAR(255) | 디바이스 토큰 (FCM/APNS) |
| `platform` | VARCHAR(20) | 플랫폼 ('ios', 'android') |

---

### 16. HealthCheckForm (건강 체크 폼)
**삭제 이유**: 챗봇 기능과 연계되어야 하는데, 챗봇이 아직 구현되지 않음

**재구현 시기**: 챗봇 건강 체크 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `form_id` | BIGINT | 폼 고유 ID |
| `conversation_id` | BIGINT | 챗봇 대화 ID |
| `pet_id` | BIGINT | 반려동물 ID |
| `symptoms` | JSONB | 증상 정보 |
| `appetite_level` | VARCHAR(20) | 식욕 수준 |
| `water_intake` | VARCHAR(20) | 물 섭취량 |
| `activity_level` | VARCHAR(20) | 활동 수준 |
| `behavioral_changes` | JSONB | 행동 변화 |

---

### 17. HealthReport (건강 리포트)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 건강 리포트 기능 구현 시

---

### 18. HealthScore (건강 점수)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 건강 점수 계산 기능 구현 시

---

### 19. Reminder (리마인더)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 리마인더 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `reminder_id` | BIGINT | 리마인더 고유 ID |
| `pet_id` | BIGINT | 반려동물 ID |
| `reminder_type` | VARCHAR(50) | 리마인더 유형 |
| `title` | VARCHAR(100) | 제목 |
| `description` | TEXT | 설명 |
| `scheduled_date` | DATE | 예정 날짜 |
| `scheduled_time` | TIME | 예정 시간 |
| `is_completed` | BOOLEAN | 완료 여부 |
| `is_notification_enabled` | BOOLEAN | 알림 활성화 여부 |

---

### 20. ReminderCompletion (리마인더 완료)
**삭제 이유**: Reminder 모델과 함께 사용되는데, Reminder가 삭제됨

**재구현 시기**: 리마인더 기능 구현 시

---

### 21. ReviewHelpful (리뷰 도움됨)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 리뷰 도움됨 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `helpful_id` | BIGINT | 도움됨 고유 ID |
| `review_id` | BIGINT | 리뷰 ID |
| `user_id` | BIGINT | 사용자 ID |

---

### 22. SearchLog (검색 로그)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 검색 통계 및 분석 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `log_id` | BIGINT | 로그 고유 ID |
| `user_id` | BIGINT | 사용자 ID (nullable) |
| `search_type` | VARCHAR(30) | 검색 유형 ('pharmacy', 'hospital', 'community', 'product') |
| `keyword` | VARCHAR(255) | 검색 키워드 |
| `result_count` | INTEGER | 검색 결과 개수 |
| `searched_at` | DATE | 검색 시간 |

---

### 23. SocialLogin (소셜 로그인)
**삭제 이유**: 소셜 로그인 기능이 아직 구현되지 않았고, 서비스에서 사용되지 않음

**재구현 시기**: 소셜 로그인 기능 구현 시 (카카오, 네이버, 구글 등)

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `social_login_id` | BIGINT | 소셜 로그인 고유 ID |
| `user_id` | BIGINT | 사용자 ID |
| `provider` | VARCHAR(20) | 제공자 ('kakao', 'naver', 'google') |
| `provider_user_id` | VARCHAR(255) | 제공자 사용자 ID |
| `access_token` | TEXT | 액세스 토큰 |
| `refresh_token` | TEXT | 리프레시 토큰 |

---

### 24. UserFavorite (사용자 즐겨찾기)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 즐겨찾기 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `favorite_id` | BIGINT | 즐겨찾기 고유 ID |
| `user_id` | BIGINT | 사용자 ID |
| `facility_type` | VARCHAR(20) | 시설 유형 ('pharmacy', 'hospital') |
| `facility_id` | BIGINT | 시설 ID |

---

### 25. UserVisitHistory (사용자 방문 기록)
**삭제 이유**: 서비스에서 사용되지 않음

**재구현 시기**: 방문 기록 기능 구현 시

#### 필드 정의 (참고용)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `visit_id` | BIGINT | 방문 기록 고유 ID |
| `user_id` | BIGINT | 사용자 ID |
| `pet_id` | BIGINT | 반려동물 ID |
| `facility_type` | VARCHAR(20) | 시설 유형 |
| `facility_id` | BIGINT | 시설 ID |
| `visit_date` | DATE | 방문 날짜 |
| `purpose` | VARCHAR(100) | 방문 목적 |

---

## 모델 관계도

```
User
├── Pet
│   ├── PetHealthConcern
│   ├── HealthRecord
│   └── FacilityReview
├── FacilityReview
└── HealthRecord

Pharmacy
├── FacilityPhoto
└── FacilityReview

VeterinaryHospital
├── FacilityPhoto
└── FacilityReview
```

---

## 참고사항

- 모든 모델은 Sequelize ORM을 사용하여 정의됨
- 타임스탬프는 `created_at`, `updated_at` 필드로 관리
- 외래키 관계는 Sequelize의 `associate` 메서드로 정의
- 삭제된 모델들은 향후 기능 구현 시 재추가 예정

