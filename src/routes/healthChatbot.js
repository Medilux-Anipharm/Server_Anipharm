const express = require('express');
const router = express.Router();
const healthChatbotController = require('../controllers/healthChatbotController');
const { authenticate } = require('../middleware/auth');

/**
 * 건강상태 상담 시작 (자가검진 필수)
 * POST /api/chatbot/health/start
 */
router.post('/health/start', authenticate, healthChatbotController.startHealthStatusChat);

/**
 * 케어 관리 상담 시작 (자가검진 없음)
 * POST /api/chatbot/care/start
 */
router.post('/care/start', authenticate, healthChatbotController.startCareManagementChat);

/**
 * 챗봇 메시지 전송
 * POST /api/chatbot/message
 */
router.post('/message', authenticate, healthChatbotController.sendMessage);

/**
 * 건강 평가 생성 (건강상태 상담 전용)
 * POST /api/chatbot/health/assess
 */
router.post('/health/assess', authenticate, healthChatbotController.generateHealthAssessment);

/**
 * 대화 종료
 * POST /api/chatbot/conversation/end
 */
router.post('/conversation/end', authenticate, healthChatbotController.endConversation);

/**
 * 대화 스크립트 조회
 * GET /api/chatbot/conversation/script
 */
router.get('/conversation/script', authenticate, healthChatbotController.getConversationScript);

module.exports = router;

