# 회원가입 API

## 엔드포인트

```
POST /api/auth/register
```

## 요청

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!",
  "nickname": "사용자닉네임"
}
```

### 필드 설명
- `email` (string, required): 이메일 주소
- `password` (string, required): 비밀번호 (최소 8자, 영문+숫자+특수문자)
- `passwordConfirm` (string, required): 비밀번호 확인
- `nickname` (string, required): 닉네임 (2-20자, 한글/영문/숫자/언더스코어)

## 검증 규칙

### 이메일
- 필수 입력
- 올바른 이메일 형식
- 중복 불가

### 비밀번호
- 필수 입력
- 최소 8자 이상
- 영문, 숫자, 특수문자(!@#$%^&*) 포함 필수
- 비밀번호 확인과 일치해야 함

### 닉네임
- 필수 입력
- 2자 이상 20자 이하
- 한글, 영문, 숫자, 언더스코어(_)만 사용 가능
- 중복 불가

## 성공 응답

### Status: 201 Created

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "userId": 1,
      "email": "user@example.com",
      "nickname": "사용자닉네임",
      "profileImageUrl": null,
      "profileShape": "circle",
      "isEmailVerified": false,
      "createdAt": "2025-11-17T10:00:00.000Z"
    }
  }
}
```

## 에러 응답

### 400 Bad Request - 입력값 검증 실패

```json
{
  "success": false,
  "message": "입력값 검증 실패",
  "errors": [
    {
      "field": "email",
      "message": "올바른 이메일 형식이 아닙니다.",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "비밀번호는 최소 8자 이상이어야 합니다.",
      "value": "123"
    }
  ]
}
```

### 409 Conflict - 중복된 이메일/닉네임

```json
{
  "success": false,
  "message": "이미 사용 중인 이메일입니다."
}
```

또는

```json
{
  "success": false,
  "message": "이미 사용 중인 닉네임입니다."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "회원가입 중 오류가 발생했습니다.",
  "error": "에러 상세 메시지 (개발 환경에서만 표시)"
}
```

## 사용 예시

### cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "passwordConfirm": "Password123!",
    "nickname": "사용자닉네임"
  }'
```

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    nickname: '사용자닉네임'
  })
});

const data = await response.json();
console.log(data);
```

### Axios
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/auth/register', {
  email: 'user@example.com',
  password: 'Password123!',
  passwordConfirm: 'Password123!',
  nickname: '사용자닉네임'
});

console.log(response.data);
```

## 주의사항

1. 비밀번호는 서버에 저장되기 전에 bcrypt로 해싱됩니다.
2. 응답에는 비밀번호 해시가 포함되지 않습니다.
3. 이메일 인증은 별도로 처리해야 합니다.
4. 모든 검증은 서버 측에서 수행됩니다.

