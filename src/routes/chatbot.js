const express = require('express');
const router = express.Router();

// TODO: AI 챗봇 관련 라우트 구현
// POST /api/chatbot/conversations - 대화 시작
// GET /api/chatbot/conversations/:conversationId - 대화 조회
// POST /api/chatbot/conversations/:conversationId/messages - 메시지 전송
// GET /api/chatbot/summaries - 대화 정리함 조회
// POST /api/chatbot/summaries - 대화 요약 저장

router.get('/', (req, res) => {
  res.json({ message: 'Chatbot routes' });
});

module.exports = router;

