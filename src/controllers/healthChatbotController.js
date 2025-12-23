const healthChatbotService = require('../services/healthChatbotService');
const logger = require('../utils/logger');

class HealthChatbotController {
  /**
   * 건강상태 상담 시작 (자가검진 필수)
   * POST /api/chatbot/health/start
   */
  async startHealthStatusChat(req, res) {
    try {
      const userId = req.user.userId;
      const { petId, healthCheckData } = req.body;

      if (!petId || !healthCheckData) {
        return res.status(400).json({
          success: false,
          message: 'petId와 healthCheckData는 필수입니다.'
        });
      }

      const result = await healthChatbotService.startHealthStatusChat(
        petId,
        userId,
        healthCheckData
      );

      logger.info(`Health status chat started: healthCheckId=${result.healthCheckId} for petId=${petId}`);
      
      return res.status(201).json({
        success: true,
        data: result,
        message: '건강상태 상담이 시작되었습니다.'
      });
    } catch (error) {
      logger.error('Error starting health status chat:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '건강상태 상담 시작에 실패했습니다.'
      });
    }
  }

  /**
   * 케어 관리 상담 시작 (자가검진 없음)
   * POST /api/chatbot/care/start
   */
  async startCareManagementChat(req, res) {
    try {
      const userId = req.user.userId;
      const { petId } = req.body;

      if (!petId) {
        return res.status(400).json({
          success: false,
          message: 'petId는 필수입니다.'
        });
      }

      const result = await healthChatbotService.startCareManagementChat(
        petId,
        userId
      );

      logger.info(`Care management chat started for petId=${petId}`);
      
      return res.status(201).json({
        success: true,
        data: result,
        message: '케어 관리 상담이 시작되었습니다.'
      });
    } catch (error) {
      logger.error('Error starting care management chat:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '케어 관리 상담 시작에 실패했습니다.'
      });
    }
  }

  /**
   * 챗봇 메시지 전송
   * POST /api/chatbot/message
   */
  async sendMessage(req, res) {
    try {
      const userId = req.user.userId;
      const { petId, conversationType, healthCheckId, message } = req.body;

      if (!petId || !conversationType || !message) {
        return res.status(400).json({
          success: false,
          message: 'petId, conversationType, message는 필수입니다.'
        });
      }

      // 건강상태 상담인 경우 healthCheckId 필수
      if (conversationType === 'health_status' && !healthCheckId) {
        return res.status(400).json({
          success: false,
          message: '건강상태 상담은 healthCheckId가 필수입니다.'
        });
      }

      // 위치 정보 추출 (선택적)
      const userLocation = req.body.location ? {
        latitude: parseFloat(req.body.location.latitude),
        longitude: parseFloat(req.body.location.longitude)
      } : null;
      
      console.log('[컨트롤러] 위치 정보 수신:', userLocation);
      console.log('[컨트롤러] 요청 body:', JSON.stringify(req.body, null, 2));

      const response = await healthChatbotService.sendMessage(
        petId,
        userId,
        conversationType,
        healthCheckId || null,
        message,
        userLocation
      );

      logger.info(`Chat message sent: petId=${petId}, conversationType=${conversationType}`);
      
      return res.status(200).json({
        success: true,
        data: response,
        message: '메시지가 전송되었습니다.'
      });
    } catch (error) {
      logger.error('Error sending chat message:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '메시지 전송에 실패했습니다.'
      });
    }
  }

  /**
   * 건강 평가 생성 (건강상태 상담 전용)
   * POST /api/chatbot/health/assess
   */
  async generateHealthAssessment(req, res) {
    try {
      const userId = req.user.userId;
      const { petId, healthCheckId } = req.body;

      if (!petId || !healthCheckId) {
        return res.status(400).json({
          success: false,
          message: 'petId와 healthCheckId는 필수입니다.'
        });
      }

      const assessment = await healthChatbotService.generateHealthAssessment(
        petId,
        userId,
        healthCheckId
      );

      logger.info(`Health assessment generated: healthCheckId=${healthCheckId}`);
      
      return res.status(200).json({
        success: true,
        data: assessment,
        message: '건강 평가가 생성되었습니다.'
      });
    } catch (error) {
      logger.error('Error generating health assessment:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '건강 평가 생성에 실패했습니다.'
      });
    }
  }

  /**
   * 대화 종료
   * POST /api/chatbot/conversation/end
   */
  async endConversation(req, res) {
    try {
      const userId = req.user.userId;
      const { petId, conversationType, healthCheckId } = req.body;

      if (!petId || !conversationType) {
        return res.status(400).json({
          success: false,
          message: 'petId와 conversationType은 필수입니다.'
        });
      }

      // 건강상태 상담인 경우 healthCheckId 필수
      if (conversationType === 'health_status' && !healthCheckId) {
        return res.status(400).json({
          success: false,
          message: '건강상태 상담은 healthCheckId가 필수입니다.'
        });
      }

      const result = await healthChatbotService.endConversation(
        parseInt(petId),
        userId,
        conversationType,
        healthCheckId ? parseInt(healthCheckId) : null
      );

      logger.info(`Conversation ended: petId=${petId}, conversationType=${conversationType}`);
      
      return res.status(200).json({
        success: true,
        data: result,
        message: '대화가 종료되었습니다.'
      });
    } catch (error) {
      logger.error('Error ending conversation:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '대화 종료에 실패했습니다.'
      });
    }
  }

  /**
   * 대화 스크립트 조회
   * GET /api/chatbot/conversation/script
   */
  async getConversationScript(req, res) {
    try {
      const userId = req.user.userId;
      const { petId, conversationType, healthCheckId } = req.query;

      if (!petId || !conversationType) {
        return res.status(400).json({
          success: false,
          message: 'petId와 conversationType은 필수입니다.'
        });
      }

      // 건강상태 상담인 경우 healthCheckId 필수
      if (conversationType === 'health_status' && !healthCheckId) {
        return res.status(400).json({
          success: false,
          message: '건강상태 상담은 healthCheckId가 필수입니다.'
        });
      }

      const script = await healthChatbotService.getConversationScript(
        parseInt(petId),
        userId,
        conversationType,
        healthCheckId ? parseInt(healthCheckId) : null
      );

      logger.info(`Conversation script retrieved: petId=${petId}, conversationType=${conversationType}`);
      
      return res.status(200).json({
        success: true,
        data: script,
        message: '대화 스크립트를 조회했습니다.'
      });
    } catch (error) {
      logger.error('Error getting conversation script:', error);
      return res.status(400).json({
        success: false,
        message: error.message || '대화 스크립트 조회에 실패했습니다.'
      });
    }
  }
}

module.exports = new HealthChatbotController();
