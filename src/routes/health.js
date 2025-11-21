const express = require('express');
const router = express.Router();

// TODO: 헬스 다이어리 관련 라우트 구현
// GET /api/health/records - 건강 기록 조회
// POST /api/health/records - 건강 기록 등록
// GET /api/health/reports - 건강 레포트 조회
// GET /api/health/scores - 건강 점수 조회
// GET /api/health/reminders - 리마인더 조회
// POST /api/health/reminders - 리마인더 등록

router.get('/', (req, res) => {
  res.json({ message: 'Health routes' });
});

module.exports = router;

