const express = require('express');
const router = express.Router();

// TODO: 병원 관련 라우트 구현
// GET /api/hospitals - 병원 목록 조회 (위치 기반)
// GET /api/hospitals/:hospitalId - 병원 상세 조회
// GET /api/hospitals/:hospitalId/reviews - 병원 리뷰 조회
// POST /api/hospitals/:hospitalId/reviews - 병원 리뷰 작성

router.get('/', (req, res) => {
  res.json({ message: 'Hospital routes' });
});

module.exports = router;

