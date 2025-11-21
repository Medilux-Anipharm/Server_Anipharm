const express = require('express');
const router = express.Router();

// TODO: 알림 관련 라우트 구현
// GET /api/notifications - 알림 목록 조회
// PUT /api/notifications/:notificationId/read - 알림 읽음 처리
// GET /api/notifications/settings - 알림 설정 조회
// PUT /api/notifications/settings - 알림 설정 수정

router.get('/', (req, res) => {
  res.json({ message: 'Notification routes' });
});

module.exports = router;

