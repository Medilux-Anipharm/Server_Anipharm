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
      console.log('건강상담모드 챗봇 시작 - 건강체크표 생성 완료:', healthCheck);

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
      // 0. healthCheckId 유효성 검사 (제공된 경우)
      if (healthCheckId) {
        try {
          const healthCheck = await healthCheckService.getHealthCheckById(healthCheckId);
          
        } catch (error) {
          // 건강체크표를 찾을 수 없는 경우 더 명확한 에러 메시지
          if (error.message.includes('건강체크표를 찾을 수 없습니다')) {
            throw new Error(`건강 체크표를 찾을 수 없습니다. healthCheckId: ${healthCheckId}가 존재하지 않거나 삭제되었을 수 있습니다.`);
          }
          throw error;
        }
      }

      // 1. 사용자 메시지 저장
      const lastMessage = await this._getLastMessageOrder(petId, userId, conversationType, healthCheckId);
      const userMessageRecord = await ChatMessage.create({
        petId,
        userId,
        conversationType,
        healthCheckId: healthCheckId || null, // NULL로 명시적 변환
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

      // 3. OpenAI 호출 (평가 모드이므로 JSON 형식 필수)
      const openaiResponse = await chatbotService.sendMessage(messages, true);
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
   * 대화 스크립트 생성
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형
   * @param {number|null} healthCheckId - 건강 체크표 ID (건강상태 상담인 경우)
   * @returns {Promise<object>} 대화 스크립트
   */
  async getConversationScript(petId, userId, conversationType, healthCheckId = null) {
    try {
      // 1. 반려동물 정보 조회
      const pet = await petService.getPetById(petId);
      
      // 2. 대화 기록 조회
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
        order: [['message_order', 'ASC'], ['created_at', 'ASC']],
        attributes: ['message_id', 'pet_id', 'user_id', 'health_check_id', 'conversation_type', 'role', 'content', 'message_order', 'created_at', 'updated_at'],
        raw: false // Sequelize 인스턴스로 반환 (createdAt 자동 변환)
      });

      if (messages.length === 0) {
        throw new Error('대화 기록이 없습니다.');
      }

      // 3. 스크립트 포맷팅
      const scriptLines = [];
      const conversationTypeLabel = conversationType === 'health_status' ? '건강상태 상담' : '케어 관리 상담';
      
      // 헤더 정보
      scriptLines.push(`=== ${pet.name} ${conversationTypeLabel} 대화 스크립트 ===`);
      
      // 안전한 날짜 포맷팅 함수
      const formatDate = (date) => {
        if (!date) return '날짜 정보 없음';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '날짜 정보 없음';
        return dateObj.toLocaleString('ko-KR');
      };
      
      const formatDateTime = (date) => {
        if (!date) return '날짜 정보 없음';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '날짜 정보 없음';
        return dateObj.toLocaleString('ko-KR', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };
      
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length - 1];
      
      scriptLines.push(`상담 시작: ${formatDate(firstMsg?.createdAt || firstMsg?.created_at)}`);
      scriptLines.push(`상담 종료: ${formatDate(lastMsg?.createdAt || lastMsg?.created_at)}`);
      scriptLines.push(`총 메시지 수: ${messages.length}개`);
      scriptLines.push('');

      // 대화 내용
      messages.forEach((msg, index) => {
        const roleLabel = msg.role === 'user' ? '사용자' : '챗봇';
        const createdAt = msg.createdAt || msg.created_at;
        const time = formatDateTime(createdAt);
        
        scriptLines.push(`[${index + 1}] ${roleLabel} (${time})`);
        scriptLines.push(msg.content || '');
        scriptLines.push('');
      });

      const script = scriptLines.join('\n');

      return {
        petId,
        petName: pet.name,
        conversationType,
        conversationTypeLabel,
        healthCheckId,
        messageCount: messages.length,
        startTime: firstMsg?.createdAt || firstMsg?.created_at,
        endTime: lastMsg?.createdAt || lastMsg?.created_at,
        script,
        messages: messages.map(msg => ({
          messageId: msg.messageId,
          role: msg.role,
          roleLabel: msg.role === 'user' ? '사용자' : '챗봇',
          content: msg.content,
          messageOrder: msg.messageOrder,
          createdAt: msg.createdAt || msg.created_at
        }))
      };
    } catch (error) {
      console.error('대화 스크립트 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 대화 종료 처리
   * @param {number} petId - 반려동물 ID
   * @param {number} userId - 사용자 ID
   * @param {string} conversationType - 상담 유형
   * @param {number|null} healthCheckId - 건강 체크표 ID (건강상태 상담인 경우)
   * @returns {Promise<object>} 종료 정보 및 대화 요약
   */
  async endConversation(petId, userId, conversationType, healthCheckId = null) {
    try {
      // 1. 대화 기록 조회
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
        order: [['message_order', 'ASC'], ['created_at', 'ASC']]
      });

      if (messages.length === 0) {
        throw new Error('대화 기록이 없습니다.');
      }

      // 2. 대화 요약 정보 생성
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length - 1];
      const userMessages = messages.filter(msg => msg.role === 'user');
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');

      // 3. 반려동물 정보 조회
      const pet = await petService.getPetById(petId);

      return {
        petId,
        petName: pet.name,
        conversationType,
        conversationTypeLabel: conversationType === 'health_status' ? '건강상태 상담' : '케어 관리 상담',
        healthCheckId,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        assistantMessageCount: assistantMessages.length,
        startTime: firstMsg?.createdAt || firstMsg?.created_at,
        endTime: new Date(), // 종료 시점
        duration: Math.round((new Date() - new Date(firstMsg?.createdAt || firstMsg?.created_at)) / 1000 / 60), // 분 단위
        summary: {
          firstUserMessage: userMessages[0]?.content || null,
          lastAssistantMessage: assistantMessages[assistantMessages.length - 1]?.content || null
        }
      };
    } catch (error) {
      console.error('대화 종료 처리 오류:', error);
      throw error;
    }
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
