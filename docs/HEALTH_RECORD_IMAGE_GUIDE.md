# 🐾 반려동물 건강 기록 이미지 저장 기능 완벽 가이드

> 개발 초보자를 위한 HealthRecord 이미지 저장 기능 설명서

## 📋 목차
1. [기능 개요](#기능-개요)
2. [왜 필요한가요?](#왜-필요한가요)
3. [구현된 기능들](#구현된-기능들)
4. [각 메서드 상세 설명](#각-메서드-상세-설명)
5. [실제 사용 예시](#실제-사용-예시)
6. [주의사항](#주의사항)
7. [마무리](#마무리)

---

## 기능 개요

반려동물의 건강 기록에 이미지를 저장하고 관리하는 기능입니다. 배변 사진과 증상 사진을 각각 다르게 관리할 수 있어요.

### 🎯 핵심 개념

- **배변 사진**: 한 장만 저장 (단일 URL)
- **증상 사진**: 여러 장 저장 가능 (URL 배열)

---

## 왜 필요한가요?

반려동물을 키우다 보면:
- 💩 배변 상태를 사진으로 기록하고 싶을 때
- 🤒 증상이 있을 때 여러 각도로 사진을 찍어야 할 때
- 📊 시간이 지나면서 증상이 어떻게 변하는지 추적하고 싶을 때

이런 상황에서 이미지를 저장하고 관리하는 기능이 필요합니다!

---

## 구현된 기능들

총 **4가지 메서드**가 구현되어 있어요:

1. ✅ **배변 사진 저장/업데이트** - `saveFecesPhoto()`
2. ✅ **증상 사진 추가** - `addSymptomPhoto()`
3. ✅ **증상 사진 삭제** - `removeSymptomPhoto()`
4. ✅ **증상 사진 전체 교체** - `updateSymptomPhotos()`

---

## 각 메서드 상세 설명

### 1️⃣ 배변 사진 저장/업데이트

```javascript
async saveFecesPhoto(recordId, petId, userId, photoUrl)
```

**역할**: 배변 사진 URL을 저장하거나 기존 사진을 새로운 사진으로 교체합니다.

**파라미터 설명**:
- `recordId`: 건강 기록의 고유 ID
- `petId`: 반려동물의 ID
- `userId`: 사용자 ID (권한 확인용)
- `photoUrl`: 저장할 배변 사진의 URL

**동작 방식**:
1. 해당 건강 기록이 존재하는지 확인
2. 사용자가 권한이 있는지 확인 (본인의 반려동물인지)
3. 배변 사진 URL 업데이트
4. 업데이트된 기록 반환

**예시**:
```javascript
// 배변 사진 저장
const updatedRecord = await healthRecordService.saveFecesPhoto(
    1,           // recordId
    5,           // petId
    10,          // userId
    'https://example.com/feces-photo.jpg'  // photoUrl
);
```

---

### 2️⃣ 증상 사진 추가

```javascript
async addSymptomPhoto(recordId, petId, userId, photoUrl)
```

**역할**: 증상 사진 URL 배열에 새로운 사진을 추가합니다.

**특징**:
- 중복 방지: 같은 URL이 이미 있으면 추가하지 않아요
- 배열에 추가: 기존 사진들은 유지되고 새 사진만 추가됩니다

**예시**:
```javascript
// 첫 번째 증상 사진 추가
await healthRecordService.addSymptomPhoto(1, 5, 10, 'https://example.com/symptom1.jpg');
// symptomPhotoUrls: ['https://example.com/symptom1.jpg']

// 두 번째 증상 사진 추가
await healthRecordService.addSymptomPhoto(1, 5, 10, 'https://example.com/symptom2.jpg');
// symptomPhotoUrls: ['https://example.com/symptom1.jpg', 'https://example.com/symptom2.jpg']

// 같은 사진 다시 추가 시도 (중복 방지)
await healthRecordService.addSymptomPhoto(1, 5, 10, 'https://example.com/symptom1.jpg');
// symptomPhotoUrls: ['https://example.com/symptom1.jpg', 'https://example.com/symptom2.jpg']
// (변화 없음 - 중복 방지됨)
```

---

### 3️⃣ 증상 사진 삭제

```javascript
async removeSymptomPhoto(recordId, petId, userId, photoUrl)
```

**역할**: 증상 사진 URL 배열에서 특정 사진을 삭제합니다.

**동작 방식**:
1. 기존 사진 배열에서 해당 URL 찾기
2. 해당 URL을 제외한 새로운 배열 생성
3. 업데이트

**예시**:
```javascript
// 현재 사진들: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']

// photo2.jpg 삭제
await healthRecordService.removeSymptomPhoto(1, 5, 10, 'photo2.jpg');
// 결과: ['photo1.jpg', 'photo3.jpg']
```

---

### 4️⃣ 증상 사진 전체 교체

```javascript
async updateSymptomPhotos(recordId, petId, userId, photoUrls)
```

**역할**: 증상 사진 URL 배열을 완전히 새로운 배열로 교체합니다.

**언제 사용하나요?**
- 여러 사진을 한 번에 교체하고 싶을 때
- 사진 순서를 바꾸고 싶을 때
- 모든 사진을 새로 업로드할 때

**예시**:
```javascript
// 기존: ['photo1.jpg', 'photo2.jpg']

// 전체 교체
await healthRecordService.updateSymptomPhotos(
    1, 
    5, 
    10, 
    ['new-photo1.jpg', 'new-photo2.jpg', 'new-photo3.jpg']
);
// 결과: ['new-photo1.jpg', 'new-photo2.jpg', 'new-photo3.jpg']
```

---

## 실제 사용 예시

### 시나리오: 반려동물의 증상 기록하기

```javascript
const healthRecordService = require('./services/HealthRecord');

// 1. 건강 기록 생성
const record = await healthRecordService.createHealthRecord(
    5,              // petId
    10,             // userId
    '2025-12-04',   // recordDate
    'symptom',      // recordType
    null, null, null, null, null, null, null, null,
    ['기침', '콧물'],  // symptoms
    null,           // symptomPhotoUrls (아직 없음)
    '오늘부터 기침이 시작됨'  // memo
);

// 2. 첫 번째 증상 사진 추가
await healthRecordService.addSymptomPhoto(
    record.recordId,
    5,
    10,
    'https://storage.example.com/symptom-1.jpg'
);

// 3. 두 번째 증상 사진 추가
await healthRecordService.addSymptomPhoto(
    record.recordId,
    5,
    10,
    'https://storage.example.com/symptom-2.jpg'
);

// 4. 배변 사진도 추가
await healthRecordService.saveFecesPhoto(
    record.recordId,
    5,
    10,
    'https://storage.example.com/feces-1.jpg'
);
```

### 시나리오: 증상이 나아져서 사진 정리하기

```javascript
// 특정 사진만 삭제
await healthRecordService.removeSymptomPhoto(
    record.recordId,
    5,
    10,
    'https://storage.example.com/symptom-1.jpg'
);

// 또는 모든 증상 사진을 새로운 사진들로 교체
await healthRecordService.updateSymptomPhotos(
    record.recordId,
    5,
    10,
    [
        'https://storage.example.com/recovery-1.jpg',
        'https://storage.example.com/recovery-2.jpg'
    ]
);
```

---

## 주의사항

### ⚠️ 권한 확인

모든 메서드는 다음을 확인합니다:
- 건강 기록이 존재하는지
- 해당 반려동물이 사용자의 것인지 (`petId`, `userId` 확인)

**잘못된 사용 예시**:
```javascript
// ❌ 다른 사람의 반려동물 기록에 접근 시도
await healthRecordService.saveFecesPhoto(
    1,    // recordId
    5,    // petId
    99,   // 다른 사용자의 userId (권한 없음)
    'photo.jpg'
);
// 에러 발생: "건강기록을 찾을 수 없거나 권한이 없습니다."
```

### 📝 URL 형식

- URL은 문자열이어야 합니다
- 실제로 접근 가능한 URL이어야 합니다
- 이미지 파일 형식 (jpg, png 등)을 권장합니다

### 🔄 증상 사진 배열 관리

- `addSymptomPhoto`: 배열에 추가 (중복 방지)
- `removeSymptomPhoto`: 배열에서 삭제
- `updateSymptomPhotos`: 배열 전체 교체

**팁**: 한 번에 여러 사진을 관리하려면 `updateSymptomPhotos`를 사용하세요!

---

## 데이터베이스 구조 이해하기

### HealthRecord 모델의 이미지 필드

```javascript
{
    fecesPhotoUrl: String,        // 배변 사진 (단일)
    symptomPhotoUrls: Array        // 증상 사진 (여러 개)
}
```

**배변 사진**:
- 타입: `STRING(500)`
- 하나의 URL만 저장
- 예: `'https://example.com/feces.jpg'`

**증상 사진**:
- 타입: `JSONB` (배열)
- 여러 URL 저장 가능
- 예: `['https://example.com/symptom1.jpg', 'https://example.com/symptom2.jpg']`

---

## 에러 처리

모든 메서드는 다음과 같은 에러를 처리합니다:

```javascript
try {
    await healthRecordService.saveFecesPhoto(recordId, petId, userId, photoUrl);
} catch (error) {
    if (error.message === '건강기록을 찾을 수 없거나 권한이 없습니다.') {
        // 권한 없음 또는 기록 없음
        console.error('권한이 없거나 기록을 찾을 수 없습니다.');
    } else {
        // 기타 에러
        console.error('예상치 못한 에러:', error);
    }
}
```

---

## 마무리

이제 반려동물의 건강 기록에 이미지를 저장하고 관리할 수 있어요! 🎉

### 요약

- ✅ 배변 사진은 한 장만 저장 (`saveFecesPhoto`)
- ✅ 증상 사진은 여러 장 저장 가능 (`addSymptomPhoto`, `removeSymptomPhoto`, `updateSymptomPhotos`)
- ✅ 모든 메서드는 권한 확인을 합니다
- ✅ 중복 방지 기능이 있어요

### 다음 단계

이 기능을 사용해서:
1. 프론트엔드에서 이미지 업로드 기능 구현
2. 이미지 갤러리 뷰 구현
3. 이미지 삭제 UI 구현

등을 만들어볼 수 있어요!

---

**작성일**: 2025년 12월 4일  
**버전**: 1.0.0  
**작성자**: Anipharm 개발팀

