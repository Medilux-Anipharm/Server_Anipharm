const express = require('express');
const router = express.Router();

// TODO: 사용자 관련 라우트 구현
// GET /api/users/profile - 프로필 조회
// PUT /api/users/profile - 프로필 수정
// GET /api/users/:userId - 사용자 정보 조회

router.get('/', (req, res) => {
  res.json({ message: 'User routes' });
});

module.exports = router;

