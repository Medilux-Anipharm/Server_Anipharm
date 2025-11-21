const express = require('express');
const router = express.Router();

// TODO: 약국 관련 라우트 구현
// GET /api/pharmacies - 약국 목록 조회 (위치 기반)
// GET /api/pharmacies/:pharmacyId - 약국 상세 조회
// GET /api/pharmacies/:pharmacyId/reviews - 약국 리뷰 조회
// POST /api/pharmacies/:pharmacyId/reviews - 약국 리뷰 작성

router.get('/', (req, res) => {
  res.json({ message: 'Pharmacy routes' });
});

module.exports = router;

