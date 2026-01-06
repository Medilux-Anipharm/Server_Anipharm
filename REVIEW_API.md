# 📝 리뷰 API 문서

약국 및 병원 리뷰 시스템 API 가이드입니다.

## 📌 목차

1. [API 엔드포인트 개요](#api-엔드포인트-개요)
2. [약국 리뷰 API](#약국-리뷰-api)
3. [병원 리뷰 API](#병원-리뷰-api)
4. [리뷰 관리 API](#리뷰-관리-api)
5. [좋아요 API](#좋아요-api)
6. [에러 코드](#에러-코드)

---

## API 엔드포인트 개요

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| GET | `/api/reviews/pharmacies/:pharmacyId` | 약국 리뷰 목록 조회 | 선택 |
| GET | `/api/reviews/pharmacies/:pharmacyId/summary` | 약국 리뷰 요약 | 불필요 |
| POST | `/api/reviews/pharmacies/:pharmacyId` | 약국 리뷰 작성 | 필수 |
| GET | `/api/reviews/hospitals/:hospitalId` | 병원 리뷰 목록 조회 | 선택 |
| GET | `/api/reviews/hospitals/:hospitalId/summary` | 병원 리뷰 요약 | 불필요 |
| POST | `/api/reviews/hospitals/:hospitalId` | 병원 리뷰 작성 | 필수 |
| GET | `/api/reviews/:reviewId` | 리뷰 상세 조회 | 선택 |
| PUT | `/api/reviews/:reviewId` | 리뷰 수정 | 필수 |
| DELETE | `/api/reviews/:reviewId` | 리뷰 삭제 | 필수 |
| POST | `/api/reviews/:reviewId/like` | 좋아요 추가 | 필수 |
| DELETE | `/api/reviews/:reviewId/like` | 좋아요 취소 | 필수 |

---

## 약국 리뷰 API

### 1. 약국 리뷰 목록 조회

**GET** `/api/reviews/pharmacies/:pharmacyId`

#### Query Parameters

```
sortBy     : string  - 정렬 기준 (latest|popular|rating) [기본값: latest]
page       : number  - 페이지 번호 [기본값: 1]
limit      : number  - 페이지당 개수 (1-50) [기본값: 20]
minRating  : number  - 최소 별점 필터 (1-5)
keyword    : string  - 키워드 필터
```

#### 요청 예시

```bash
# 기본 조회 (최신순)
curl -X GET "http://localhost:3000/api/reviews/pharmacies/1"

# 인기순, 별점 4점 이상만
curl -X GET "http://localhost:3000/api/reviews/pharmacies/1?sortBy=popular&minRating=4"

# 키워드 필터
curl -X GET "http://localhost:3000/api/reviews/pharmacies/1?keyword=친절해요"

# 인증된 사용자 (좋아요 여부 확인)
curl -X GET "http://localhost:3000/api/reviews/pharmacies/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "reviewId": 1,
        "rating": 5,
        "content": "정말 친절하고 전문적이었어요!",
        "author": {
          "userId": 123,
          "nickname": "반려인홍길동",
          "profileImageURL": "https://example.com/profile.jpg"
        },
        "keywords": ["친절해요", "깨끗해요"],
        "media": [
          {
            "mediaId": 1,
            "mediaUrl": "/uploads/reviews/review-123456.jpg",
            "mediaType": "image"
          }
        ],
        "likeCount": 15,
        "isLiked": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. 약국 리뷰 요약 조회

**GET** `/api/reviews/pharmacies/:pharmacyId/summary`

통계 정보 및 인기 키워드를 조회합니다.

#### 요청 예시

```bash
curl -X GET "http://localhost:3000/api/reviews/pharmacies/1/summary"
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 128,
    "ratingDistribution": {
      "5": 80,
      "4": 30,
      "3": 10,
      "2": 5,
      "1": 3
    },
    "keywordSummary": [
      {
        "keyword": "친절해요",
        "count": 45,
        "percentage": 35.2
      },
      {
        "keyword": "깨끗해요",
        "count": 38,
        "percentage": 29.7
      },
      {
        "keyword": "전문적이에요",
        "count": 32,
        "percentage": 25.0
      }
    ]
  }
}
```

---

### 3. 약국 리뷰 작성

**POST** `/api/reviews/pharmacies/:pharmacyId`

🔐 **인증 필수**

#### Request Body (multipart/form-data)

```
rating      : number (필수) - 별점 (1-5)
content     : string (필수) - 리뷰 내용
keywords    : array         - 키워드 배열 (선택)
mediaFiles  : file[]        - 미디어 파일 (선택, 최대 5개, 각 50MB)
```

#### 요청 예시

```bash
# 텍스트만
curl -X POST "http://localhost:3000/api/reviews/pharmacies/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "rating=5" \
  -F "content=정말 친절하고 좋았어요!" \
  -F "keywords[]=친절해요" \
  -F "keywords[]=깨끗해요"

# 이미지 포함
curl -X POST "http://localhost:3000/api/reviews/pharmacies/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "rating=5" \
  -F "content=우리 강아지가 좋아해요!" \
  -F "keywords[]=친절해요" \
  -F "mediaFiles=@/path/to/photo1.jpg" \
  -F "mediaFiles=@/path/to/photo2.jpg"
```

#### JavaScript 예시 (React Native / Expo)

```javascript
const createReview = async (pharmacyId, reviewData) => {
  const formData = new FormData();
  formData.append('rating', reviewData.rating);
  formData.append('content', reviewData.content);

  // 키워드 추가
  reviewData.keywords?.forEach(keyword => {
    formData.append('keywords[]', keyword);
  });

  // 이미지 추가
  reviewData.images?.forEach((image, index) => {
    formData.append('mediaFiles', {
      uri: image.uri,
      type: 'image/jpeg',
      name: `photo-${index}.jpg`
    });
  });

  const response = await fetch(
    `http://localhost:3000/api/reviews/pharmacies/${pharmacyId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return await response.json();
};
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "reviewId": 123,
    "rating": 5,
    "content": "정말 친절하고 좋았어요!",
    "author": {
      "userId": 456,
      "nickname": "반려인홍길동",
      "profileImageURL": null
    },
    "keywords": ["친절해요", "깨끗해요"],
    "media": [],
    "likeCount": 0,
    "isLiked": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "리뷰가 성공적으로 작성되었습니다."
}
```

---

## 병원 리뷰 API

병원 리뷰 API는 약국 리뷰 API와 동일한 구조입니다. URL만 다릅니다.

- **리뷰 목록**: `GET /api/reviews/hospitals/:hospitalId`
- **리뷰 요약**: `GET /api/reviews/hospitals/:hospitalId/summary`
- **리뷰 작성**: `POST /api/reviews/hospitals/:hospitalId`

사용법은 약국 리뷰 API와 동일합니다.

---

## 리뷰 관리 API

### 1. 리뷰 상세 조회

**GET** `/api/reviews/:reviewId`

#### 요청 예시

```bash
curl -X GET "http://localhost:3000/api/reviews/123"
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "reviewId": 123,
    "rating": 5,
    "content": "정말 좋았어요!",
    "author": {
      "userId": 456,
      "nickname": "반려인홍길동",
      "profileImageURL": null
    },
    "target": {
      "type": "pharmacy",
      "id": 1,
      "name": "강남 동물약국",
      "address": "서울시 강남구..."
    },
    "keywords": ["친절해요"],
    "media": [],
    "likeCount": 5,
    "isLiked": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. 리뷰 수정

**PUT** `/api/reviews/:reviewId`

🔐 **인증 필수** (본인만 가능)

#### Request Body (multipart/form-data)

모든 필드는 선택 사항입니다. 제공된 필드만 업데이트됩니다.

```
rating      : number  - 별점 (1-5)
content     : string  - 리뷰 내용
keywords    : array   - 키워드 배열 (기존 키워드 대체)
mediaFiles  : file[]  - 추가할 미디어 파일
```

#### 요청 예시

```bash
# 내용만 수정
curl -X PUT "http://localhost:3000/api/reviews/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content=수정된 리뷰 내용입니다"

# 별점과 키워드 수정
curl -X PUT "http://localhost:3000/api/reviews/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "rating=4" \
  -F "keywords[]=친절해요" \
  -F "keywords[]=빠른 진료"
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "reviewId": 123,
    "rating": 4,
    "content": "수정된 리뷰 내용입니다",
    // ... 전체 리뷰 데이터
  },
  "message": "리뷰가 성공적으로 수정되었습니다."
}
```

---

### 3. 리뷰 삭제

**DELETE** `/api/reviews/:reviewId`

🔐 **인증 필수** (본인만 가능)

#### 요청 예시

```bash
curl -X DELETE "http://localhost:3000/api/reviews/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 응답 예시

```json
{
  "success": true,
  "message": "리뷰가 성공적으로 삭제되었습니다."
}
```

---

## 좋아요 API

### 1. 좋아요 추가

**POST** `/api/reviews/:reviewId/like`

🔐 **인증 필수**

#### 요청 예시

```bash
curl -X POST "http://localhost:3000/api/reviews/123/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "likeCount": 16
  },
  "message": "좋아요를 눌렀습니다."
}
```

#### 에러 응답 (중복)

```json
{
  "success": false,
  "message": "이미 좋아요를 누른 리뷰입니다"
}
```

---

### 2. 좋아요 취소

**DELETE** `/api/reviews/:reviewId/like`

🔐 **인증 필수**

#### 요청 예시

```bash
curl -X DELETE "http://localhost:3000/api/reviews/123/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "likeCount": 15
  },
  "message": "좋아요를 취소했습니다."
}
```

---

## 에러 코드

| 상태 코드 | 설명 | 예시 |
|---------|------|------|
| 200 | 성공 | 조회, 수정, 삭제 성공 |
| 201 | 생성 성공 | 리뷰 작성 성공 |
| 400 | 잘못된 요청 | 유효성 검증 실패, 중복 좋아요 |
| 401 | 인증 필요 | 토큰 없음, 토큰 만료 |
| 403 | 권한 없음 | 타인의 리뷰 수정/삭제 시도 |
| 404 | 찾을 수 없음 | 존재하지 않는 리뷰 |
| 500 | 서버 오류 | 내부 서버 에러 |

### 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

---

## 📱 클라이언트 사용 예시

### React Native / Expo

```javascript
// 리뷰 목록 조회
const fetchReviews = async (pharmacyId, page = 1) => {
  const response = await fetch(
    `${API_URL}/api/reviews/pharmacies/${pharmacyId}?page=${page}&limit=20`,
    {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }
  );
  return await response.json();
};

// 리뷰 작성
const createReview = async (pharmacyId, data) => {
  const formData = new FormData();
  formData.append('rating', data.rating);
  formData.append('content', data.content);
  data.keywords?.forEach(k => formData.append('keywords[]', k));
  data.images?.forEach((img, i) => {
    formData.append('mediaFiles', {
      uri: img.uri,
      type: 'image/jpeg',
      name: `photo-${i}.jpg`
    });
  });

  const response = await fetch(
    `${API_URL}/api/reviews/pharmacies/${pharmacyId}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    }
  );
  return await response.json();
};

// 좋아요 토글
const toggleLike = async (reviewId, isLiked) => {
  const method = isLiked ? 'DELETE' : 'POST';
  const response = await fetch(
    `${API_URL}/api/reviews/${reviewId}/like`,
    {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  return await response.json();
};
```

---

## 🔧 트랜잭션 처리

이 API는 데이터 무결성을 위해 트랜잭션을 사용합니다:

- **리뷰 작성**: 리뷰 + 키워드 + 미디어가 하나의 트랜잭션으로 처리
- **리뷰 수정**: 리뷰 + 키워드 교체가 원자적으로 처리
- **좋아요**: 좋아요 기록 + 카운트 증감이 동기화됨

하나라도 실패하면 전체 작업이 롤백되어 데이터 일관성이 보장됩니다.

---

## 📚 추가 정보

- **Swagger 문서**: `http://localhost:3000/api-docs`
- **최대 파일 크기**: 50MB (비디오 고려)
- **최대 파일 개수**: 5개
- **지원 파일 형식**:
  - 이미지: jpeg, jpg, png, gif, webp
  - 비디오: mp4, mov, avi

---

## 🚀 다음 단계

1. 서버 실행: `npm start`
2. Swagger UI 확인: `http://localhost:3000/api-docs`
3. 리뷰 API 테스트

문제가 있으면 로그를 확인하세요! 😊
