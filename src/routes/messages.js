const express = require('express');
const router = express.Router();

// TODO: 메시지 관련 라우트 구현
// GET /api/messages/threads - 대화 목록 조회
// GET /api/messages/threads/:threadId - 대화 상세 조회
// POST /api/messages/threads/:threadId/messages - 메시지 전송
// PUT /api/messages/threads/:threadId/read - 읽음 처리

router.get('/', (req, res) => {
  res.json({ message: 'Message routes' });
});

module.exports = router;

