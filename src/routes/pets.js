const express = require('express');
const router = express.Router();

// TODO: 반려동물 관련 라우트 구현
// GET /api/pets - 반려동물 목록 조회
// POST /api/pets - 반려동물 등록
// GET /api/pets/:petId - 반려동물 상세 조회
// PUT /api/pets/:petId - 반려동물 수정
// DELETE /api/pets/:petId - 반려동물 삭제

router.get('/', (req, res) => {
  res.json({ message: 'Pet routes' });
});

module.exports = router;

