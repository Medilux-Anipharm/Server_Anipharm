// 헬스챗봇 관련 서비스
// 건강상담모드 / 케어관리모드 
const { Pet, HealthCheck, ChatMessage, HealthRecord } = require('../models');
const petService = require('./petService');
const healthCheckService = require('./healthCheckService');
const healthRecordService = require('./HealthRecord');
const chatbotService = require('./chatbotService');

class HealthChatbotService {
  /**
   * 건강상태 상담 시작 (자가검진 필수)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {object} healthCheckData - 건강 체크표 데이터
   * @returns {Promise<object>} 건강 체크표 ID
   */
  async startHealthStatusChat(petId, userId, healthCheckData) {
    try {
      // 1. 건강 체크표 생성 (healthCheckService에서 checkId 반환)
      const { concernType, appetite, activity, temperature, note } = healthCheckData;
      const healthCheck = await healthCheckService.createHealthCheck(
        petId, userId, concernType, appetite, activity, temperature, note
      );

      return {
        healthCheckId: healthCheck.checkId
      };
    } catch (error) {
      console.error('건강상태 상담 시작 오류:', error);
      throw error;
    }
  }

  /**
   * 케어 관리 상담 시작 (자가검진 없음)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<object>} 상담 세션 정보
   */
  async startCareManagementChat(petId, userId) {
    try {
      // 케어 관리 상담은 자가검진 없이 바로 시작
      // healthCheckId는 항상 null
      return {
        healthCheckId: null
      };
    } catch (error) {
      console.error('케어 관리 상담 시작 오류:', error);
      throw error;
    }
  }

  /**
   * 챗봇 메시지 전송 및 응답 생성
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형 ('health_status' | 'care_management')
   * @param {number|null} healthCheckId - 건강 체크표 ID (건강상태 상담 시 필수)
   * @param {string} userMessage - 사용자 메시지
   * @returns {Promise<object>} 챗봇 응답
   */
  async sendMessage(petId, userId, conversationType, healthCheckId, userMessage) {
    try {
      // 1. 사용자 메시지 저장
      const lastMessage = await this._getLastMessageOrder(petId, userId, conversationType, healthCheckId);
      const userMessageRecord = await ChatMessage.create({
        petId,
        userId,
        conversationType,
        healthCheckId,
        role: 'user',
        content: userMessage,
        messageOrder: lastMessage + 1
      });

      // 2. 대화 기록 조회 (최근 N개)
      const conversationHistory = await this._getConversationHistory(
        petId, userId, conversationType, healthCheckId, 10
      );

      // 3. 반려동물 컨텍스트 수집
      const pet = await petService.getPetById(petId);
      const petContext = await this._gatherPetContext(petId);
      
      // 4. 건강 체크표 조회 (건강상태 상담인 경우)
      let healthCheck = null;
      if (healthCheckId) {
        healthCheck = await healthCheckService.getHealthCheckById(healthCheckId);
      }

      // 5. 프롬프트 구성 (chatbotService 사용)
      let messages;
      if (conversationType === 'health_status') {
        messages = chatbotService.buildHealthStatusPrompt(
          pet, healthCheck, petContext, conversationHistory, false
        );
        // 사용자 메시지 추가
        messages.push({
          role: 'user',
          content: userMessage
        });
      } else {
        messages = chatbotService.buildCareManagementPrompt(
          pet, healthCheck, petContext, conversationHistory
        );
        // 사용자 메시지 추가
        messages.push({
          role: 'user',
          content: userMessage
        });
      }

      // 6. OpenAI 호출
      const openaiResponse = await chatbotService.sendMessage(messages);
      const assistantMessage = openaiResponse.choices[0].message.content;

      // 7. 어시스턴트 메시지 저장
      await ChatMessage.create({
        petId,
        userId,
        conversationType,
        healthCheckId,
        role: 'assistant',
        content: assistantMessage,
        messageOrder: lastMessage + 2
      });

      // 8. 응답 파싱 (JSON 형식인 경우)
      let parsedResponse = assistantMessage;
      try {
        parsedResponse = JSON.parse(assistantMessage);
      } catch (e) {
        // JSON이 아니면 그대로 반환
      }

      return {
        message: assistantMessage,
        parsed: parsedResponse
      };
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      throw error;
    }
  }

  /**
   * 건강 평가 생성 (건강상태 상담 전용)
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {number} healthCheckId - 건강 체크표 ID
   * @returns {Promise<object>} 평가 결과
   */
  async generateHealthAssessment(petId, userId, healthCheckId) {
    try {
      // 1. 데이터 수집
      const pet = await petService.getPetById(petId);
      const healthCheck = await healthCheckService.getHealthCheckById(healthCheckId);
      const petContext = await this._gatherPetContext(petId);
      const conversationHistory = await this._getConversationHistory(
        petId, userId, 'health_status', healthCheckId, 20
      );

      // 2. 프롬프트 구성 (평가용, chatbotService 사용)
      const messages = chatbotService.buildHealthStatusPrompt(
        pet, healthCheck, petContext, conversationHistory, true
      );

      // 3. OpenAI 호출
      const openaiResponse = await chatbotService.sendMessage(messages);
      const assessmentText = openaiResponse.choices[0].message.content;

      // 4. JSON 파싱
      let assessment;
      try {
        assessment = JSON.parse(assessmentText);
      } catch (e) {
        throw new Error('평가 결과 파싱 실패: ' + e.message);
      }

      // 5. 검증 및 후처리
      this._validateAssessment(assessment);

      return assessment;
    } catch (error) {
      console.error('건강 평가 생성 오류:', error);
            throw error;
        }
    }

  // ============ Private Helper Methods ============

  /**
   * 반려동물 컨텍스트 수집 (최근 건강 기록 등)
   */
  async _gatherPetContext(petId) {
    try {
      // 최근 7일 건강 기록 조회
      const recentRecords = await HealthRecord.findAll({
        where: { petId },
        order: [['record_date', 'DESC'], ['created_at', 'DESC']],
        limit: 10
      });

      return {
        recentHealthRecords: recentRecords.map(record => ({
          date: record.recordDate,
          type: record.recordType,
          symptoms: record.symptoms,
          weight: record.weightKg,
          memo: record.memo
        }))
      };
    } catch (error) {
      console.error('반려동물 컨텍스트 수집 오류:', error);
      return { recentHealthRecords: [] };
    }
  }

  /**
   * 대화 기록 조회
   */
  async _getConversationHistory(petId, userId, conversationType, healthCheckId, limit = 10) {
    const where = {
      petId,
      userId,
      conversationType
    };
    
    if (healthCheckId) {
      where.healthCheckId = healthCheckId;
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [['message_order', 'ASC']],
      limit
    });

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 마지막 메시지 순서 조회
   */
  async _getLastMessageOrder(petId, userId, conversationType, healthCheckId) {
    const where = {
      petId,
      userId,
      conversationType
    };
    
    if (healthCheckId) {
      where.healthCheckId = healthCheckId;
    }

    const lastMessage = await ChatMessage.findOne({
      where,
      order: [['message_order', 'DESC']]
    });

    return lastMessage ? lastMessage.messageOrder : 0;
  }


  /**
   * 평가 결과 검증
   */
  _validateAssessment(assessment) {
    const validLevels = ['BLUE', 'GREEN', 'AMBER', 'RED'];
    
    if (!assessment.triage_level || !validLevels.includes(assessment.triage_level)) {
      throw new Error('유효하지 않은 triage_level');
    }

    if (!Array.isArray(assessment.recommended_actions)) {
      throw new Error('recommended_actions는 배열이어야 합니다');
    }

    if (assessment.recommended_actions.length > 3) {
      assessment.recommended_actions = assessment.recommended_actions.slice(0, 3);
    }

    if (!assessment.health_check_summary || typeof assessment.health_check_summary !== 'string') {
      throw new Error('health_check_summary는 문자열이어야 합니다');
    }
  }
}

module.exports = new HealthChatbotService();
